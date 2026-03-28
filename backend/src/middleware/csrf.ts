import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

const CSRF_COOKIE = 'csrf_token';
const CSRF_HEADER = 'x-csrf-token';

/**
 * CSRF protection using double-submit cookie pattern.
 * - Sets a readable (non-HttpOnly) csrf_token cookie on every response
 * - Validates that state-changing requests (POST/PUT/DELETE/PATCH) include
 *   the same token in the X-CSRF-Token header
 * - Safe methods (GET/HEAD/OPTIONS) are exempt
 */
export function csrfProtection(req: Request, res: Response, next: NextFunction): void {
  // Ensure a CSRF token cookie exists
  if (!req.cookies?.[CSRF_COOKIE]) {
    const token = crypto.randomBytes(32).toString('hex');
    res.cookie(CSRF_COOKIE, token, {
      httpOnly: false, // JS needs to read this
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });
    // Also set on req so the check below works for the first request
    req.cookies = req.cookies || {};
    req.cookies[CSRF_COOKIE] = token;
  }

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
