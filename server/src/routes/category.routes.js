import { Router } from 'express';
import { body } from 'express-validator';
import RoomCategory from '../models/RoomCategory.js';
import Room from '../models/Room.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const categories = await RoomCategory.find().sort({ name: 1 });
  res.json({ success: true, data: categories });
}));

router.post('/', requireAuth, [body('name').notEmpty(), body('slug').notEmpty()], validate,
  asyncHandler(async (req, res) => {
    const category = await RoomCategory.create(req.body);
    res.status(201).json({ success: true, data: category });
  }));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const category = await RoomCategory.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true, data: category });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const inUse = await Room.countDocuments({ category: req.params.id });
  if (inUse > 0) {
    return res.status(409).json({ success: false, message: 'Category is in use by existing rooms' });
  }
  const category = await RoomCategory.findByIdAndDelete(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
  res.json({ success: true });
}));

export default router;
