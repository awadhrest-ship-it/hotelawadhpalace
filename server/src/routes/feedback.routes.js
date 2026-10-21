import { Router } from 'express';
import { body } from 'express-validator';
import mongoose from 'mongoose';
import Feedback from '../models/Feedback.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

const optionalStar = (field) =>
  body(field).optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5').toInt();

// ---- Public: guest submits feedback ---------------------------------------
router.post('/', publicFormLimiter, [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').optional({ checkFalsy: true }).trim().isEmail().withMessage('Enter a valid email').normalizeEmail(),
  body('phone').optional({ checkFalsy: true }).trim().isLength({ max: 30 }),
  body('city').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('roomType').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('stayDate').optional({ checkFalsy: true }).isISO8601().withMessage('Enter a valid stay date').toDate(),
  body('ratings.overall').isInt({ min: 1, max: 5 }).withMessage('Please give an overall rating').toInt(),
  optionalStar('ratings.cleanliness'),
  optionalStar('ratings.service'),
  optionalStar('ratings.comfort'),
  optionalStar('ratings.food'),
  optionalStar('ratings.value'),
  body('message').trim().notEmpty().withMessage('Please tell us about your stay').isLength({ max: 2000 }),
  body('wouldRecommend').optional({ checkFalsy: true }).isIn(['yes', 'no']),
  body('allowDisplay').optional().toBoolean(),
], validate, asyncHandler(async (req, res) => {
  // Honeypot: real guests never see/fill this field, bots usually do.
  // Pretend it worked so the bot doesn't retry.
  if (req.body.website) return res.status(201).json({ success: true });

  const { name, email, phone, city, roomType, stayDate, ratings = {}, message, wouldRecommend, allowDisplay } = req.body;

  // Only keep the star categories the guest actually filled in.
  const cleanRatings = { overall: ratings.overall };
  ['cleanliness', 'service', 'comfort', 'food', 'value'].forEach((k) => {
    if (ratings[k]) cleanRatings[k] = ratings[k];
  });

  const item = await Feedback.create({
    name, email, phone, city, roomType, stayDate,
    ratings: cleanRatings,
    message,
    wouldRecommend: wouldRecommend || '',
    allowDisplay: Boolean(allowDisplay),
  });
  res.status(201).json({ success: true, data: { id: item._id } });
}));

// ---- Public: feedback the admin chose to feature --------------------------
// Never exposes email / phone.
router.get('/featured', asyncHandler(async (req, res) => {
  const items = await Feedback.find({ featured: true })
    .select('name city roomType stayDate ratings.overall message createdAt featuredAt')
    .sort({ featuredAt: -1, createdAt: -1 })
    .limit(12);
  res.json({ success: true, data: items });
}));

// ---- Admin ----------------------------------------------------------------
router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { status, featured } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (featured === 'true') filter.featured = true;
  if (featured === 'false') filter.featured = false;
  const items = await Feedback.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}));

const checkId = (req, res, next) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(404).json({ success: false, message: 'Feedback not found' });
  }
  next();
};

router.put('/:id/featured', requireAuth, checkId, [body('featured').isBoolean().toBoolean()], validate,
  asyncHandler(async (req, res) => {
    const featured = req.body.featured;
    const item = await Feedback.findByIdAndUpdate(
      req.params.id,
      { featured, featuredAt: featured ? new Date() : null },
      { new: true }
    );
    if (!item) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: item });
  }));

router.put('/:id/status', requireAuth, checkId, [body('status').isIn(['new', 'read', 'archived'])], validate,
  asyncHandler(async (req, res) => {
    const item = await Feedback.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!item) return res.status(404).json({ success: false, message: 'Feedback not found' });
    res.json({ success: true, data: item });
  }));

router.delete('/:id', requireAuth, checkId, asyncHandler(async (req, res) => {
  const item = await Feedback.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Feedback not found' });
  res.json({ success: true });
}));

export default router;