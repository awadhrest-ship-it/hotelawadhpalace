import { Router } from 'express';
import { body } from 'express-validator';
import Amenity from '../models/Amenity.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const amenities = await Amenity.find().sort({ name: 1 });
  res.json({ success: true, data: amenities });
}));

router.post('/', requireAuth, [body('name').notEmpty()], validate, asyncHandler(async (req, res) => {
  const amenity = await Amenity.create(req.body);
  res.status(201).json({ success: true, data: amenity });
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
  res.json({ success: true, data: amenity });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const amenity = await Amenity.findByIdAndDelete(req.params.id);
  if (!amenity) return res.status(404).json({ success: false, message: 'Amenity not found' });
  res.json({ success: true });
}));

export default router;
