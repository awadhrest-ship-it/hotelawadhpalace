import { Router } from 'express';
import { body } from 'express-validator';
import Newsletter from '../models/Newsletter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', publicFormLimiter, [body('email').isEmail().normalizeEmail()], validate,
  asyncHandler(async (req, res) => {
    const { email } = req.body;
    const sub = await Newsletter.findOneAndUpdate(
      { email },
      { email, subscribed: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, data: { email: sub.email } });
  }));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const subs = await Newsletter.find().sort({ createdAt: -1 });
  res.json({ success: true, data: subs });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const sub = await Newsletter.findByIdAndDelete(req.params.id);
  if (!sub) return res.status(404).json({ success: false, message: 'Subscriber not found' });
  res.json({ success: true });
}));

export default router;
