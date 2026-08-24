import { Router } from 'express';
import { body } from 'express-validator';
import Testimonial from '../models/Testimonial.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await Testimonial.find({ published: true }).sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const items = await Testimonial.find().sort({ createdAt: -1 });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, [body('name').notEmpty(), body('message').notEmpty()], validate,
  asyncHandler(async (req, res) => {
    const item = await Testimonial.create(req.body);
    res.status(201).json({ success: true, data: item });
  }));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  res.json({ success: true, data: item });
}));

router.post('/:id/photo', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const item = await Testimonial.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  if (item.photo?.publicId) await deleteFromCloudinary(item.photo.publicId);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'testimonials');
  item.photo = { url, publicId, alt: item.name, order: 0 };
  await item.save();
  res.json({ success: true, data: item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Testimonial.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Testimonial not found' });
  if (item.photo?.publicId) await deleteFromCloudinary(item.photo.publicId);
  await item.deleteOne();
  res.json({ success: true });
}));

export default router;
