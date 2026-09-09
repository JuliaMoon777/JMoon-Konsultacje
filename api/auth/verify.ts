import type { IncomingMessage, ServerResponse } from 'http';
import { verifyAdminToken } from '../../server/auth.js';

export default async function handler(req: IncomingMessage, res: any) {
  const method = (req.method || 'GET').toUpperCase();
  if (method === 'OPTIONS') {
    res.statusCode = 200;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ ok: true }));
    return;
  }

  const authHeader = req.headers['authorization'];
  const isValid = verifyAdminToken(authHeader);

  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(200).json({ valid: isValid });
  }
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ valid: isValid }));
}
