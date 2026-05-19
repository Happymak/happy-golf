// ============================================================
// /api/analyze-round.js
// Vercel Serverless Function
// Proxies image + context to Anthropic Claude API
// Includes safety guards: kill switch, rate limit, in-flight lock
// ============================================================

import Anthropic from '@anthropic-ai/sdk';

// In-memory rate limiter (resets when serverless function spins down)
// For a personal app this is enough; for production use Vercel KV / Redis
const rateLimitStore = new Map();
const inFlightRequests = new Set();

// Rate limit config
const MAX_PER_DAY = 5;
const MIN_INTERVAL_MS = 30 * 1000; // 30 seconds between requests
const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB max

function getClientKey(req) {
  // Use IP from Vercel headers as identifier
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim()
      || req.headers['x-real-ip']
      || 'unknown';
}

function checkRateLimit(clientKey) {
  const now = Date.now();
  let record = rateLimitStore.get(clientKey);

  // Clean up old records on every check
  if (record && now - record.firstRequest > DAY_MS) {
    rateLimitStore.delete(clientKey);
    record = null;
  }

  if (!record) {
    return { allowed: true, remaining: MAX_PER_DAY };
  }

  // Check daily limit
  if (record.count >= MAX_PER_DAY) {
    return {
      allowed: false,
      reason: `Daily limit reached (${MAX_PER_DAY} analyses). Resets in ${Math.ceil((DAY_MS - (now - record.firstRequest)) / (60 * 60 * 1000))} hours.`
    };
  }

  // Check min interval since last request
  if (now - record.lastRequest < MIN_INTERVAL_MS) {
    const waitSec = Math.ceil((MIN_INTERVAL_MS - (now - record.lastRequest)) / 1000);
    return {
      allowed: false,
      reason: `Please wait ${waitSec} seconds before another analysis.`
    };
  }

  return { allowed: true, remaining: MAX_PER_DAY - record.count };
}

function recordRequest(clientKey) {
  const now = Date.now();
  const record = rateLimitStore.get(clientKey) || { firstRequest: now, count: 0, lastRequest: 0 };
  record.count += 1;
  record.lastRequest = now;
  rateLimitStore.set(clientKey, record);
}

export default async function handler(req, res) {
  // CORS headers (allow same-origin only on Vercel)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  // === LAYER 1: Kill switch ===
  if (process.env.AI_ANALYSIS_ENABLED !== 'true') {
    return res.status(503).json({
      error: 'AI analysis is currently disabled.',
      hint: 'Set AI_ANALYSIS_ENABLED=true in Vercel environment variables to enable.'
    });
  }

  // === LAYER 2: API key check ===
  if (!process.env.ANTHROPIC_API_KEY) {
    return res.status(500).json({
      error: 'API key not configured.',
      hint: 'Set ANTHROPIC_API_KEY in Vercel environment variables.'
    });
  }

  const clientKey = getClientKey(req);

  // === LAYER 3: In-flight lock (prevent concurrent requests) ===
  if (inFlightRequests.has(clientKey)) {
    return res.status(429).json({
      error: 'An analysis is already in progress. Please wait for it to finish.'
    });
  }

  // === LAYER 4: Rate limit ===
  const rateLimit = checkRateLimit(clientKey);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: rateLimit.reason });
  }

  // === Parse body ===
  let body;
  try {
    body = req.body;
    if (typeof body === 'string') body = JSON.parse(body);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid JSON body.' });
  }

  const { imageBase64, imageMediaType, courseName, userContext } = body || {};

  if (!imageBase64 || !imageMediaType) {
    return res.status(400).json({ error: 'Missing imageBase64 or imageMediaType.' });
  }

  // === LAYER 5: Image size check ===
  const sizeBytes = (imageBase64.length * 3) / 4; // rough base64 size
  if (sizeBytes > MAX_IMAGE_SIZE_BYTES) {
    return res.status(413).json({
      error: `Image too large (${(sizeBytes / 1024 / 1024).toFixed(1)}MB). Max is ${MAX_IMAGE_SIZE_BYTES / 1024 / 1024}MB.`
    });
  }

  // Acquire in-flight lock
  inFlightRequests.add(clientKey);
  recordRequest(clientKey);

  try {
    const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

    // Build the prompt with rich personal context for Happymak
    const systemPrompt = `You are Happymak's personal golf coach. You know his game intimately — his strengths, his patterns, his improvement plan for 2026. Speak to him directly, like a coach who's been working with him. Use "you" not "Happymak" in the analysis.

===== HAPPYMAK'S PROFILE =====

PHYSICAL & TECHNICAL:
- Lefty golfer (plays left-handed)
- Swing speed: ~108 mph (above average, real power available)
- Course Handicap: 19 (working to lower this in 2026)
- Home course: Miami Beach Golf Club (Normandy course)
- Typical tees: Blue (6,430 yds, slope 138, par 72)
- Based in Miami Beach, Florida
- Plays in Florida heat, often wind from the east

REFERENCE ROUND (May 13, 2026 — known baseline at home course):
- Gross 102 / Net 83 / Differential 23.6 at Miami Beach Blue tees
- Front 9: 49 (8-5-5-7-4-3-8-5-4) — strong, only 14 over par 35
- Back 9: 53 (8-6-7-6-6-7-4-4-5) — collapsed, 16 over par 37
- Tee accuracy: 89% front → 33% back (driver fell apart)
- GIR: 22%, Putts: 34, Scrambling: 17%, Penalties on 7 holes
- The killers: 4 double bogeys + 1 triple

This shows his typical pattern: starts strong, driver leaks on back nine, doubles compound. Use this as a baseline when comparing.

===== Q2 2026 AREAS OF IMPROVEMENT (his active focus) =====

1. **Tempo & Rhythm** — Foundation of every swing. Tends to rush under pressure.
2. **Elevated Chip and Pitch Shots** — Over slopes and breaks around Miami Beach greens.
3. **Chip & Runs** — Around the green, distance control with low trajectory.
4. **Tee Shots** — Driver & 3-wood consistency. His biggest leak — penalty shots kill rounds.
5. **Wedge Shots 30-90 yds** — New distance system: 30-65 → 58°, 65-85 → 54°, 85-110 → A wedge.
6. **Pre-Shot Routine** — Full shots & putting. Consistency under pressure especially.

===== FRAMEWORKS HE LIVES BY =====

**DECADE Golf (Scott Fawcett):**
- Aim for FAT PART of the green/fairway (never pins, never lines)
- Take MEDICINE when in trouble — no hero shots
- Play your dispersion zone (where 8/10 shots end up)
- The most important shot is always the NEXT one
- Eliminate "easy mistakes" — penalties, OB, water are round-killers

**The Tiger Five (mistakes to eliminate):**
1. 3-putts
2. Double bogeys or worse
3. Penalty shots (water, OB, lost ball)
4. Chunks / fat shots
5. Bad club selection

**Core belief:**
"70-80% of improvement in scoring comes from AVOIDING bogeys and worse, not making more birdies."

===== HIS MANTRA =====

Plays peacefully but with intent. Competes with himself. Plays to enjoy AND to win — both can be true. Every shot matters, especially the NEXT one. His own best ally on the course — doesn't talk down to himself. His best round ever started with an 8 — he can recover. Focus: precision over distance, play with flow, with better tempo.

===== YOUR ANALYSIS TASK =====

Look at the scorecard image carefully and produce a personalized analysis. Read every number you can see: hole-by-hole scores, par per hole, totals, OUT/IN/TOTAL, any additional stats visible (putts, fairways, GIR, penalties).

If Happymak provided his own observations or comments about this round, TAKE THEM SERIOUSLY — they give you context the numbers don't show (sensations, weather, what felt off, mental state, course conditions). Reference his comments specifically in your analysis.

Provide:

1. **reading** (2-3 short paragraphs in plain English): What story does this round tell? Compare front vs back nine. Where did strokes get away? What looked solid? Reference specific holes by number. If his comments add color (e.g. "missed many greens"), connect that to what the scorecard shows.

2. **areaConnections** (array of strings, 2-4 items): Which of his 6 Q2 areas showed up most in this round? Be specific: "Tee Shots — saw the same back-nine driver pattern as the May 13 round" rather than just "Tee shots were bad". Include both positives ("Wedge distance system seems to be working — see hole X") and negatives.

3. **tigerFiveCount** (string, one line): Count what you can: "2 doubles, 1 triple, 1 penalty hole visible, no 3-putts I can confirm without putt data."

4. **focusForNextRound** (array of strings, 3-4 actionable items): Concrete focus points for next round based on THIS round's specific failures. Reference DECADE/Tiger Five principles where relevant. Connect to his Q2 areas. Make them specific to what failed THIS round, not generic advice.

Be direct, warm but honest, conversational like a coach who knows him. Use "you" throughout. If you see something positive, celebrate it. If you see compounding mistakes, point it out — but constructively.

Keep total response under 500 words. Return ONLY valid JSON with the 4 keys: reading, areaConnections, tigerFiveCount, focusForNextRound.`;

    const userMessage = `Course played: ${courseName || 'Unknown'}
${userContext ? `\nMy own observations about this round:\n${userContext}` : '\n(No additional notes provided.)'}

Please analyze this scorecard.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2000,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: imageMediaType,
                data: imageBase64
              }
            },
            {
              type: 'text',
              text: userMessage
            }
          ]
        }
      ]
    });

    // Extract text response
    const textContent = response.content.find(c => c.type === 'text');
    if (!textContent) {
      throw new Error('No text response from Claude.');
    }

    // Try to parse as JSON, fallback to plain text
    let analysis;
    try {
      // Strip markdown code fences if present
      let cleaned = textContent.text.trim();
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
      analysis = JSON.parse(cleaned);
    } catch (e) {
      // Fallback to plain text format
      analysis = {
        reading: textContent.text,
        areaConnections: [],
        tigerFiveCount: '',
        focusForNextRound: []
      };
    }

    const usage = response.usage || {};
    const inputCost = (usage.input_tokens || 0) * 3 / 1_000_000; // $3 per 1M input tokens
    const outputCost = (usage.output_tokens || 0) * 15 / 1_000_000; // $15 per 1M output tokens
    const totalCost = inputCost + outputCost;

    return res.status(200).json({
      success: true,
      analysis,
      usage: {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        estimatedCost: `$${totalCost.toFixed(4)}`
      },
      rateLimitRemaining: MAX_PER_DAY - (rateLimitStore.get(clientKey)?.count || 0)
    });

  } catch (error) {
    console.error('API error:', error);

    if (error.status === 401) {
      return res.status(500).json({ error: 'Invalid API key configured.' });
    }
    if (error.status === 429) {
      return res.status(429).json({ error: 'Anthropic API rate limit hit. Try again in a minute.' });
    }
    if (error.status === 400) {
      return res.status(400).json({ error: `API rejected the request: ${error.message}` });
    }

    return res.status(500).json({
      error: 'Analysis failed.',
      details: error.message
    });
  } finally {
    inFlightRequests.delete(clientKey);
  }
}
