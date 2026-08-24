import { Router } from 'express';
import { body } from 'express-validator';
import Service from '../models/Service.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await Service.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const items = await Service.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, [body('title').notEmpty()], validate, asyncHandler(async (req, res) => {
  const item = await Service.create(req.body);
  res.status(201).json({ success: true, data: item });
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true, data: item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Service.findByIdAndDelete(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Service not found' });
  res.json({ success: true });
}));

export default router;