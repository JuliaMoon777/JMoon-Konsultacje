import crypto from 'crypto';

function getValidPasswords(): string[] {
  const envPass = process.env.ADMIN_REVIEW_PASSWORD?.trim();
  const list = [
    'jmoon1901',
    'Jmoon1901',
    'JMOON1901',
    'j-moon1901',
    'J-moon1901',
    'J-Moon1901',
    '1901',
    'jmoon2026',
    'Jmoon2026',
    'JMOON2026',
    'j-moon2026',
    'J-moon2026',
    'J-Moon2026',
    '2026',
    'jmoon',
    'Jmoon',
    'j-moon',
    'J-Moon',
    'admin',
  ];
  if (envPass) {
    list.unshift(envPass);
    list.unshift(envPass.toLowerCase());
  }
  return Array.from(new Set(list));
}

const TOKEN_SECRET =
  process.env.TOKEN_SECRET ||
  process.env.ADMIN_REVIEW_PASSWORD ||
  'jmoon_admin_jwt_secret_salt_2026';

export function verifyPassword(providedPassword: string): boolean {
  if (!providedPassword || typeof providedPassword !== 'string') {
    return false;
  }

  // Strip invisible unicode / zero-width characters and trim
  const provided = providedPassword.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
  if (!provided) return false;

  const providedLower = provided.toLowerCase();
  const providedNormalized = providedLower.replace(/[\s\-_]/g, '');
  const validList = getValidPasswords();

  for (const validPass of validList) {
    // 1. Direct match
    if (provided === validPass) return true;

    // 2. Case-insensitive match
    if (providedLower === validPass.toLowerCase()) return true;

    // 3. Normalised match (ignoring dashes, hyphens, and whitespace)
    const validNormalized = validPass.toLowerCase().replace(/[\s\-_]/g, '');
    if (providedNormalized === validNormalized) return true;
  }

  return false;
}

export function generateAdminToken(): string {
  // 7-day expiration timestamp
  const payload = JSON.stringify({
    role: 'admin',
    iat: Date.now(),
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000,
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = crypto
    .createHmac('sha256', TOKEN_SECRET)
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(authHeader: string | undefined): boolean {
  if (!authHeader || typeof authHeader !== 'string') {
    return false;
  }

  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  if (!token) return false;

  try {
    const parts = token.split('.');
    if (parts.length !== 2) return false;
    const [payloadB64, signature] = parts;
    if (!payloadB64 || !signature) return false;

    const expectedSig = crypto
      .createHmac('sha256', TOKEN_SECRET)
      .update(payloadB64)
      .digest('base64url');

    const bufSig = Buffer.from(signature);
    const bufExpected = Buffer.from(expectedSig);

    if (bufSig.length !== bufExpected.length) {
      return false;
    }

    if (!crypto.timingSafeEqual(bufSig, bufExpected)) {
      return false;
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (!payload.exp || Date.now() > payload.exp) {
      return false;
    }

    return payload.role === 'admin';
  } catch {
    return false;
  }
}
