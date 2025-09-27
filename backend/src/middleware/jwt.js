// backend/src/middleware/jwt.js
import { expressjwt } from 'express-jwt';

const { JWT_SECRET } = process.env;

export const requireAuth = expressjwt({
  // ensure the secret is present
  secret: () => {
    if (!JWT_SECRET) throw new Error('JWT_SECRET not set');
    return JWT_SECRET;
  },
  algorithms: ['HS256'], // <-- fix: HS256
  getToken: (req) => {
    // Expect "Authorization: Bearer <token>"
    const auth = req.headers.authorization || '';
    const [scheme, token] = auth.split(' ');
    if (scheme === 'Bearer' && token) return token;

    // (optional) support cookie if you set one
    if (req.cookies?.token) return req.cookies.token;

    return null;
  },
});

// Optional: centralized handler so 401s are clean JSON
export function authErrorHandler(err, req, res, next) {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'invalid or missing token' });
  }
  return next(err);
}
