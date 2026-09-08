import type { IncomingMessage, ServerResponse } from 'http';
import { verifyPassword, generateAdminToken, verifyAdminToken } from '../server/auth';

interface VercelRequest extends IncomingMessage {
  body: any;
  query: Record<string, string | string[]>;
}

interface VercelResponse extends ServerResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const { password } = req.body || {};
    if (!password || typeof password !== 'string') {
      return res.status(400).json({ success: false, error: 'Wprowadź kod dostępu.' });
    }

    const isValid = verifyPassword(password.trim());
    if (!isValid) {
      return res.status(401).json({ success: false, error: 'Nieprawidłowy kod dostępu.' });
    }

    const token = generateAdminToken();
    return res.status(200).json({ success: true, token });
  }

  if (req.method === 'GET') {
    const authHeader = req.headers.authorization;
    const isValid = verifyAdminToken(authHeader);
    return res.status(200).json({ valid: isValid });
  }

  res.status(405).json({ error: 'Method not allowed' });
}
