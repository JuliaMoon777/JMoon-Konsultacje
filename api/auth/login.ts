import type { IncomingMessage, ServerResponse } from 'http';
import { verifyPassword, generateAdminToken } from '../../server/auth';

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

  if (method === 'OPTIONS') {
    return sendResponse(res, 200, { ok: true });
  }

  if (method !== 'POST') {
    return sendResponse(res, 405, {
      success: false,
      error: 'Metoda niedozwolona.',
    });
  }

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

  const token = generateAdminToken();
  return sendResponse(res, 200, {
    success: true,
    token,
  });
}
