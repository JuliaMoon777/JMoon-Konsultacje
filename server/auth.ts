import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Remove invisible Unicode characters that can accidentally appear when a
 * password is copied from a password manager or mobile device.
 */
function normalizeSecret(value: string): string {
  return value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
}

function getAdminPassword(): string | null {
  const password = process.env.ADMIN_REVIEW_PASSWORD;
  if (!password) return null;

  const normalized = normalizeSecret(password);
  return normalized || null;
}

function getTokenSecret(): string {
  const configured = process.env.TOKEN_SECRET || process.env.ADMIN_REVIEW_PASSWORD;
  if (!configured) {
    throw new Error(
      'Missing TOKEN_SECRET or ADMIN_REVIEW_PASSWORD environment variable.'
    );
  }

  const normalized = normalizeSecret(configured);
  if (!normalized) {
    throw new Error('Admin token secret is empty.');
  }

  return normalized;
}

export function verifyPassword(providedPassword: string): boolean {
  if (!providedPassword || typeof providedPassword !== 'string') {
    return false;
  }

  const configuredPassword = getAdminPassword();
  if (!configuredPassword) {
    console.error('[AUTH] ADMIN_REVIEW_PASSWORD is not configured.');
    return false;
  }

  const provided = normalizeSecret(providedPassword);
  if (!provided) return false;

  const providedBuffer = Buffer.from(provided, 'utf8');
  const configuredBuffer = Buffer.from(configuredPassword, 'utf8');

  if (providedBuffer.length !== configuredBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, configuredBuffer);
}

export function generateAdminToken(): string {
  const now = Date.now();
  const payload = JSON.stringify({
    role: 'admin',
    iat: now,
    exp: now + 7 * 24 * 60 * 60 * 1000,
  });

  const payloadB64 = Buffer.from(payload).toString('base64url');
  const signature = createHmac('sha256', getTokenSecret())
    .update(payloadB64)
    .digest('base64url');

  return `${payloadB64}.${signature}`;
}

export function verifyAdminToken(authHeader: string | undefined): boolean {
  if (!authHeader || typeof authHeader !== 'string') {
    return false;
  }

  const token = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token) return false;

  try {
    const [payloadB64, signature, extraPart] = token.split('.');
    if (!payloadB64 || !signature || extraPart !== undefined) {
      return false;
    }

    const expectedSignature = createHmac('sha256', getTokenSecret())
      .update(payloadB64)
      .digest('base64url');

    const providedBuffer = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expectedSignature, 'utf8');

    if (providedBuffer.length !== expectedBuffer.length) {
      return false;
    }

    if (!timingSafeEqual(providedBuffer, expectedBuffer)) {
      return false;
    }

    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    );

    if (
      payload?.role !== 'admin' ||
      typeof payload.exp !== 'number' ||
      Date.now() > payload.exp
    ) {
      return false;
    }

    return true;
  } catch (error) {
    console.warn('[AUTH] Invalid admin token:', error instanceof Error ? error.message : error);
    return false;
  }
}
