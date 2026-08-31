import { Router } from 'express';
import AboutImage from '../models/AboutImage.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// PUBLIC: get active "About" images (Home page slider + About page photo)
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const images = await AboutImage.find({ active: true }).sort({ order: 1 });
    res.json({ success: true, data: images });
  })
);

// ADMIN: upload a new About image
router.post(
  '/',
  requireAuth,
  upload.single('image'),
  asyncHandler(async (req, res) => {
    assertValidImage(req.file);
    const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'about');
    const maxOrder = await AboutImage.findOne().sort({ order: -1 });
    const nextOrder = (maxOrder?.order || 0) + 1;
    const aboutImage = await AboutImage.create({
      image: { url, publicId, alt: req.body.alt || 'About Awadh Palace', order: nextOrder },
      order: nextOrder,
      active: true,
    });
    res.status(201).json({ success: true, data: aboutImage });
  })
);

// ADMIN: get all About images
router.get(
  '/admin/all',
  requireAuth,
  asyncHandler(async (req, res) => {
    const images = await AboutImage.find().sort({ order: 1 });
    res.json({ success: true, data: images });
  })
);

// ADMIN: update an About image (active flag, order, alt text)
router.put(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const update = {};
    if (req.body.active !== undefined) update.active = req.body.active;
    if (req.body.order !== undefined) update.order = req.body.order;
    if (req.body.alt !== undefined) update['image.alt'] = req.body.alt;

    const aboutImage = await AboutImage.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    if (!aboutImage) return res.status(404).json({ success: false, message: 'About image not found' });
    res.json({ success: true, data: aboutImage });
  })
);

// ADMIN: delete an About image
router.delete(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const aboutImage = await AboutImage.findById(req.params.id);
    if (!aboutImage) return res.status(404).json({ success: false, message: 'About image not found' });
    await deleteFromCloudinary(aboutImage.image.publicId);
    await aboutImage.deleteOne();
    res.json({ success: true });
  })
);

export default router;