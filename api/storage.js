// ============================================================
// /api/storage.js
// GET/POST endpoint for Upstash Redis (auto backup of app state)
// Uses KV_REST_API_URL and KV_REST_API_TOKEN env vars auto-injected
// by Upstash integration in Vercel.
// ============================================================

import { Redis } from '@upstash/redis';

const MAX_VALUE_SIZE_BYTES = 9 * 1024 * 1024; // 9MB safety limit

// Initialize once at module level
let redis;
function getRedis() {
  if (redis) return redis;
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  redis = new Redis({ url, token });
  return redis;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const client = getRedis();
  if (!client) {
    return res.status(503).json({
      error: 'Storage not configured',
      hint: 'Connect an Upstash Redis database to this Vercel project.'
    });
  }

  try {
    if (req.method === 'GET') {
      const key = req.query.key;
      if (!key) return res.status(400).json({ error: 'Missing key parameter' });
      if (typeof key !== 'string' || key.length > 200) {
        return res.status(400).json({ error: 'Invalid key' });
      }
      const value = await client.get(key);
      return res.status(200).json({ key, value: value || null });
    }

    if (req.method === 'POST') {
      let body = req.body;
      if (typeof body === 'string') body = JSON.parse(body);

      const { key, value } = body || {};
      if (!key) return res.status(400).json({ error: 'Missing key' });
      if (typeof key !== 'string' || key.length > 200) {
        return res.status(400).json({ error: 'Invalid key' });
      }

      const serialized = JSON.stringify(value);
      if (serialized.length > MAX_VALUE_SIZE_BYTES) {
        return res.status(413).json({
          error: `Data too large (${(serialized.length / 1024 / 1024).toFixed(1)}MB). Max ${MAX_VALUE_SIZE_BYTES / 1024 / 1024}MB.`
        });
      }

      await client.set(key, value);
      return res.status(200).json({ success: true, key });
    }

    return res.status(405).json({ error: 'Method not allowed' });

  } catch (error) {
    console.error('Storage error:', error);
    return res.status(500).json({
      error: 'Storage operation failed',
      details: error.message
    });
  }
}
