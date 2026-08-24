import { Router } from 'express';
import { body } from 'express-validator';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import { requireAuth, signToken, setAuthCookie, clearAuthCookie } from '../middleware/auth.js';

const router = Router();

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 6 }).withMessage('Password is required'),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email, active: true });
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const match = await admin.comparePassword(password);
    if (!match) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    admin.lastLoginAt = new Date();
    await admin.save();
    const token = signToken(admin);
    setAuthCookie(res, token);
    res.json({ success: true, data: admin.toSafeJSON() });
  })
);

router.post('/logout', requireAuth, (req, res) => {
  clearAuthCookie(res);
  res.json({ success: true });
});

router.get(
  '/me',
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ success: true, data: req.admin.toSafeJSON() });
  })
);

export default router;
