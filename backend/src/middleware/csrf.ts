import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

function ensureCsrfCookie(req: Request, res: Response): string {
  if (req.cookies?.[CSRF_COOKIE]) {
    return req.cookies[CSRF_COOKIE];
  }
  const token = crypto.randomBytes(32).toString('hex');
  res.cookie(CSRF_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/',
  });
  req.cookies = req.cookies || {};
  req.cookies[CSRF_COOKIE] = token;
  return token;
}

/** GET endpoint handler — returns the CSRF token in the response body so cross-origin frontends can read it. */
export function csrfTokenEndpoint(req: Request, res: Response): void {
  const token = ensureCsrfCookie(req, res);
  res.json({ csrfToken: token });
}

/**
 * CSRF protection using double-submit cookie pattern.
 * Cross-origin frontends fetch the token via GET /api/auth/csrf-token,
 * then send it back as the X-CSRF-Token header on state-changing requests.
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  ensureCsrfCookie(req, res);

  // Safe methods don't need CSRF validation
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    next();
    return;
  }

  // Skip CSRF for Stripe webhooks (they use their own signature verification)
  if (req.path.includes('/webhook')) {
    next();
    return;
  }

  // Skip CSRF for public quiz endpoints — cross-origin cookies unreliable on mobile/Safari,
  // and these endpoints have no user session or financial data (just analytics + email collection)
  if (req.path === '/quiz/results' || req.path === '/quiz/share-email') {
    next();
    return;
  }

  // Validate CSRF token
  const headerToken = req.headers[CSRF_HEADER] as string;
  const cookieToken = req.cookies?.[CSRF_COOKIE];

  if (!headerToken || !cookieToken || headerToken !== cookieToken) {
    res.status(403).json({
      success: false,
      message: 'CSRF token validation failed',
      code: 'CSRF_INVALID',
    });
    return;
  }

  next();
}
