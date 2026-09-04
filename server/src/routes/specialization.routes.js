import { Router } from 'express';
import Specialization from '../models/Specialization.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// Default content mirrors the reference template exactly, so the section
// renders correctly even before an admin has customised anything.
const DEFAULT_TEXT =
  'At Hotel Awadh Palace, luxury is woven into every detail — from beautifully appointed rooms and ' +
  'warm Awadhi hospitality to attentive service that anticipates your every need. Our team takes pride ' +
  'in crafting a stay that feels effortless, elegant, and entirely your own, whether you are here to ' +
  'unwind, celebrate, or do business in comfort.';

// Default image for the About page's "By The Numbers" section background,
// matching the path that used to be hardcoded in About.jsx.
const DEFAULT_NUMBERS_BG = { url: '/assets/images/background/bg-2.jpg', publicId: 'seed-numbers-bg', order: 0 };

async function getOrCreate() {
  let doc = await Specialization.findOne({ key: 'main' });
  if (!doc) {
    doc = await Specialization.create({
      key: 'main',
      text: DEFAULT_TEXT,
      counters: [
        { number: 406, label: 'International Guests', order: 0 },
        { number: 132, label: 'Five stars rating', order: 1 },
        { number: 207, label: 'Served Breakfast', order: 2 },
      ],
      features: [
        { icon: 'flaticon-hotel', title: 'Rooms', image: { url: '/assets/images/background/room.jpg', publicId: 'seed-room', order: 0 }, order: 0 },
        { icon: 'flaticon-coffee-cup', title: 'Restaurant', image: { url: '/assets/images/background/appartment.jpg', publicId: 'seed-restaurant', order: 1 }, order: 1 },
        { icon: 'flaticon-cheers', title: 'Luxury Bars', image: { url: '/assets/images/background/architecture.jpg', publicId: 'seed-bars', order: 2 }, order: 2 },
        { icon: 'flaticon-seats-at-the-hall', title: 'Meeting Hall', image: { url: '/assets/images/background/interior.jpg', publicId: 'seed-meeting', order: 3 }, order: 3 },
      ],
      numbersBackground: DEFAULT_NUMBERS_BG,
    });
  } else if (!doc.numbersBackground || !doc.numbersBackground.url) {
    // Backfill for documents created before numbersBackground existed.
    doc.numbersBackground = DEFAULT_NUMBERS_BG;
    await doc.save();
  }
  return doc;
}

router.get('/', asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  res.json({ success: true, data: doc });
}));

router.get('/admin', requireAuth, asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  res.json({ success: true, data: doc });
}));

// Update heading/text and replace the whole counters array.
router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  if (req.body.heading !== undefined) doc.heading = req.body.heading;
  if (req.body.text !== undefined) doc.text = req.body.text;
  if (Array.isArray(req.body.counters)) doc.counters = req.body.counters;
  await doc.save();
  res.json({ success: true, data: doc });
}));

// Update one feature tile's icon/title.
router.put('/features/:featureId', requireAuth, asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  const feature = doc.features.id(req.params.featureId);
  if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
  if (req.body.title !== undefined) feature.title = req.body.title;
  if (req.body.icon !== undefined) feature.icon = req.body.icon;
  await doc.save();
  res.json({ success: true, data: doc });
}));

// Replace one feature tile's background image.
router.post('/features/:featureId/image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const doc = await getOrCreate();
  const feature = doc.features.id(req.params.featureId);
  if (!feature) return res.status(404).json({ success: false, message: 'Feature not found' });
  if (feature.image?.publicId && !feature.image.publicId.startsWith('seed-')) {
    await deleteFromCloudinary(feature.image.publicId);
  }
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'specialization');
  feature.image = { url, publicId, alt: feature.title, order: feature.order };
  await doc.save();
  res.json({ success: true, data: doc });
}));

// Replace the About page "By The Numbers" section background image.
router.post('/numbers-background/image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const doc = await getOrCreate();
  if (doc.numbersBackground?.publicId && !doc.numbersBackground.publicId.startsWith('seed-')) {
    await deleteFromCloudinary(doc.numbersBackground.publicId);
  }
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'specialization');
  doc.numbersBackground = { url, publicId, alt: 'By The Numbers section background', order: 0 };
  await doc.save();
  res.json({ success: true, data: doc });
}));

export default router;