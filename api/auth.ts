import type { IncomingMessage, ServerResponse } from 'http';
import { verifyPassword, generateAdminToken, verifyAdminToken } from '../server/auth.js';

interface VercelRequest extends IncomingMessage {
  body?: any;
}

interface VercelResponse extends ServerResponse {
  status?: (code: number) => VercelResponse;
  json?: (data: any) => void;
}

function sendResponse(res: VercelResponse, statusCode: number, data: any) {
  if (typeof res.status === 'function' && typeof res.json === 'function') {
    return res.status(statusCode).json(data);
  }
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

async function parseBody(req: VercelRequest): Promise<any> {
  if (req.body !== undefined && req.body !== null) {
    if (typeof req.body === 'string') {
      try {
        return JSON.parse(req.body);
      } catch {
        return {};
      }
    }
    return req.body;
  }

  return new Promise((resolve) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
    });
    req.on('end', () => {
      if (!raw || raw.trim() === '') {
        resolve({});
        return;
      }
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve({});
      }
    });
    req.on('error', () => {
      resolve({});
    });
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const method = (req.method || 'GET').toUpperCase();

  // OPTIONS for CORS preflight
  if (method === 'OPTIONS') {
    return sendResponse(res, 200, { ok: true });
  }

  // POST /api/auth or /api/auth/login
  if (method === 'POST') {
    const body = await parseBody(req);
    const { password } = body || {};

    if (!password || typeof password !== 'string') {
      return sendResponse(res, 400, {
        success: false,
        error: 'Wprowadź kod dostępu.',
      });
    }

    const isValid = verifyPassword(password.trim());
    if (!isValid) {
      return sendResponse(res, 401, {
        success: false,
        error: 'Nieprawidłowy kod dostępu.',
      });
    }

    try {
      const token = generateAdminToken();
      return sendResponse(res, 200, {
        success: true,
        token,
      });
    } catch (error) {
      console.error('[AUTH API] Could not generate admin token:', error);
      return sendResponse(res, 500, {
        success: false,
        error: 'Błąd konfiguracji autoryzacji.',
      });
    }
  }

  // GET /api/auth (verify)
  if (method === 'GET') {
    const authHeader = req.headers['authorization'];
    const isValid = verifyAdminToken(authHeader);
    return sendResponse(res, 200, { valid: isValid });
  }

  return sendResponse(res, 405, { error: 'Metoda niedozwolona.' });
}
