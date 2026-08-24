import { Router } from 'express';
import Hero from '../models/Hero.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// PUBLIC: get active hero images
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const heroes = await Hero.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: heroes });
  })
);

// ADMIN: upload hero image
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    assertValidImage(req.file);
    const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'hero');
    const maxOrder = await Hero.findOne().sort({ order: -1 });
    const hero = await Hero.create({
      image: { url, publicId, alt: req.body.alt || 'Hero image', order: (maxOrder?.image?.order || 0) + 1 },
      title: req.body.title || '',
      subtitle: req.body.subtitle || '',
      order: (maxOrder?.image?.order || 0) + 1,
      active: true,
    });
    res.status(201).json({ success: true, data: hero });
  })
);

// ADMIN: get all hero images
router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const heroes = await Hero.find().sort({ order: 1 });
    res.json({ success: true, data: heroes });
  })
);

// ADMIN: update hero
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const hero = await Hero.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    res.json({ success: true, data: hero });
  })
);

// ADMIN: delete hero
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const hero = await Hero.findById(req.params.id);
    if (!hero) return res.status(404).json({ success: false, message: 'Hero not found' });
    await deleteFromCloudinary(hero.image.publicId);
    await hero.deleteOne();
    res.json({ success: true });
  })
);

export default router;