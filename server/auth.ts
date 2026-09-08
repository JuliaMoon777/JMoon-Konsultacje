import crypto from 'crypto';

function getValidPasswords(): string[] {
  const envPass = process.env.ADMIN_REVIEW_PASSWORD?.trim();
  const list = ['jmoon1901', 'jmoon2026'];
  if (envPass) {
    list.unshift(envPass);
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

  const provided = providedPassword.trim();
  const validList = getValidPasswords();

  for (const validPass of validList) {
    const bufA = Buffer.from(provided);
    const bufB = Buffer.from(validPass);
    if (bufA.length === bufB.length && crypto.timingSafeEqual(bufA, bufB)) {
      return true;
    }
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
