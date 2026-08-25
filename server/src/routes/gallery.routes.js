import { Router } from 'express';
import GalleryItem from '../models/GalleryItem.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = category ? { category } : {};
  const items = await GalleryItem.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.body.category) {
    return res.status(400).json({ success: false, message: 'Please select a category for this image' });
  }
  assertValidImage(req.file);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'gallery');
  const item = await GalleryItem.create({
    title: req.body.title || '',
    category: req.body.category,
    image: { url, publicId, alt: req.body.title || '', order: 0 },
  });
  res.status(201).json({ success: true, data: item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await GalleryItem.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Item not found' });
  await deleteFromCloudinary(item.image.publicId);
  await item.deleteOne();
  res.json({ success: true });
}));

export default router;