import { Router } from 'express';
import { body } from 'express-validator';
import ContactEnquiry from '../models/ContactEnquiry.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.post('/', publicFormLimiter, [
  body('name').notEmpty().trim(),
  body('email').isEmail().normalizeEmail(),
  body('message').notEmpty().trim(),
  body('phone').optional().trim(),
  body('subject').optional().trim(),
], validate, asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;
  const enquiry = await ContactEnquiry.create({ name, email, phone, subject, message });
  res.status(201).json({ success: true, data: { id: enquiry._id } });
}));

router.get('/', requireAuth, asyncHandler(async (req, res) => {
  const { status } = req.query;
  const filter = status ? { status } : {};
  const enquiries = await ContactEnquiry.find(filter).sort({ createdAt: -1 });
  res.json({ success: true, data: enquiries });
}));

router.put('/:id/status', requireAuth, [body('status').isIn(['new', 'read', 'responded', 'archived'])], validate,
  asyncHandler(async (req, res) => {
    const enquiry = await ContactEnquiry.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
    if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
    res.json({ success: true, data: enquiry });
  }));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const enquiry = await ContactEnquiry.findByIdAndDelete(req.params.id);
  if (!enquiry) return res.status(404).json({ success: false, message: 'Enquiry not found' });
  res.json({ success: true });
}));

export default router;
