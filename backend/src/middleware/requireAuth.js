import { User, toPublicUser } from '../models/userModel.js';
import { verifyAuthToken } from '../utils/auth.js';

function unauthorized(message = 'Unauthorized') {
  const err = new Error(message);
  err.statusCode = 401;
  return err;
}

export async function requireAuth(req, res, next) {
  try {
    const authorization = req.get('Authorization') || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) throw unauthorized();

    const payload = verifyAuthToken(token);
    const user = await User.findByPk(payload.sub);

    if (!user || !user.isActive) throw unauthorized();

    req.user = toPublicUser(user);
    next();
  } catch (err) {
    next(unauthorized(err.message === 'Unauthorized' ? err.message : 'Invalid token'));
  }
}

export async function optionalAuth(req, res, next) {
  try {
    const authorization = req.get('Authorization') || '';
    const [scheme, token] = authorization.split(' ');

    if (scheme !== 'Bearer' || !token) return next();

    const payload = verifyAuthToken(token);
    const user = await User.findByPk(payload.sub);

    if (user && user.isActive) req.user = toPublicUser(user);

    next();
  } catch {
    next();
  }
}

export function requireRole(role) {
  return function requireRoleMiddleware(req, res, next) {
    if (!req.user || req.user.role !== role) {
      const err = new Error('Forbidden');
      err.statusCode = 403;
      return next(err);
    }

    next();
  };
}
