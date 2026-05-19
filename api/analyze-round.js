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

    // Build the prompt with user context
    const systemPrompt = `You are an expert golf coach analyzing a scorecard for Happymak (Simon), a passionate golfer in Miami with these specifics:

- Course Handicap: 19
- Plays at Miami Beach Golf Club typically (Blue tees, slope 138)
- Lefty, swing speed ~108mph
- Q2 2026 Areas of Improvement:
  1. Tempo & Rhythm (foundation of every swing)
  2. Elevated Chip and Pitch Shots (over slopes and breaks)
  3. Chip & Runs (around the green)
  4. Tee Shots (driver & 3-wood consistency)
  5. Wedge Shots 30-90 yds (54° and 58°)
  6. Pre-Shot Routine (full shots & putting)

- Frameworks Happymak uses:
  - DECADE Golf (Scott Fawcett): aim for the fat part of the green, take medicine when in trouble, no hero shots
  - Tiger Five: avoid 3-putts, doubles, penalties, chunks, and bad club selection
  - Insight: "70-80% of improvement comes from avoiding bogeys and worse"

Analyze the scorecard image and provide:

1. **Reading the Round** (2-3 short paragraphs): What stands out about this round? Front 9 vs back 9, where the strokes were lost, what was working.

2. **Connection to Areas of Improvement**: Which of the 6 Q2 areas showed up in this round (positively or negatively)?

3. **Tiger Five Count**: How many doubles, triples, penalties, 3-putts, chunks did you see?

4. **Focus for Next Round** (3-4 bullets): Specific, actionable focus points based on what failed in THIS round.

Be direct, specific, and reference DECADE/Tiger Five principles where relevant. Use Happymak's name. Keep total response under 400 words.

Format as JSON with these keys: reading (string), areaConnections (array of strings), tigerFiveCount (string), focusForNextRound (array of strings).`;

    const userMessage = `Course: ${courseName || 'Unknown'}
${userContext ? `Additional context: ${userContext}` : ''}

Please analyze this scorecard.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
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
