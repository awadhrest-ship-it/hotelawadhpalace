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

// Page hero banners — the dark image behind each page's title + breadcrumb
// (About Us, Contact Us, Rooms & Suites, etc). One endpoint shared by every
// page, keyed by pageKey.
const PAGE_BANNER_KEYS = ['about', 'contact', 'gallery', 'rooms', 'roomDetail', 'blog', 'blogDetail'];

router.post('/page-banner/:pageKey/image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  const { pageKey } = req.params;
  if (!PAGE_BANNER_KEYS.includes(pageKey)) {
    return res.status(400).json({ success: false, message: `Unknown page key: ${pageKey}` });
  }
  assertValidImage(req.file);
  let settings = await SiteSetting.findOne({ key: 'general' });
  if (!settings) settings = await SiteSetting.create({ key: 'general' });
  if (!settings.pageBanners) settings.pageBanners = {};
  const existing = settings.pageBanners[pageKey];
  if (existing?.publicId) {
    await deleteFromCloudinary(existing.publicId);
  }
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'settings');
  settings.pageBanners[pageKey] = { url, publicId, alt: `${pageKey} page banner`, order: 0 };
  settings.markModified('pageBanners');
  await settings.save();
  res.json({ success: true, data: settings });
}));

export default router;