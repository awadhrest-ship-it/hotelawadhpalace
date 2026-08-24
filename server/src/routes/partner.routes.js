import { Router } from 'express';
import Partner from '../models/Partner.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await Partner.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const items = await Partner.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'partners');
  const item = await Partner.create({
    name: req.body.name || 'Partner',
    link: req.body.link || '',
    image: { url, publicId, alt: req.body.name || 'Partner', order: 0 },
  });
  res.status(201).json({ success: true, data: item });
}));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Partner.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Partner not found' });
  res.json({ success: true, data: item });
}));

router.post('/:id/image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const item = await Partner.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Partner not found' });
  if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'partners');
  item.image = { url, publicId, alt: item.name, order: 0 };
  await item.save();
  res.json({ success: true, data: item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Partner.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Partner not found' });
  if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
  await item.deleteOne();
  res.json({ success: true });
}));

export default router;