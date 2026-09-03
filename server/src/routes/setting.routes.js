import { Router } from 'express';
import SiteSetting from '../models/SiteSetting.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  let settings = await SiteSetting.findOne({ key: 'general' });
  if (!settings) settings = await SiteSetting.create({ key: 'general' });
  res.json({ success: true, data: settings });
}));

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOneAndUpdate(
    { key: 'general' },
    { ...req.body, key: 'general' },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: settings });
}));

router.post('/testimonials-bg-image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  let settings = await SiteSetting.findOne({ key: 'general' });
  if (!settings) settings = await SiteSetting.create({ key: 'general' });
  if (settings.testimonialsBgImage?.publicId) {
    await deleteFromCloudinary(settings.testimonialsBgImage.publicId);
  }
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'settings');
  settings.testimonialsBgImage = { url, publicId, alt: 'Our Client Says background', order: 0 };
  await settings.save();
  res.json({ success: true, data: settings });
}));

export default router;