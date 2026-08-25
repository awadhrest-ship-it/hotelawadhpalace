import { Router } from 'express';
import { body } from 'express-validator';
import Facility from '../models/Facility.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// Seeds the non-room tabs the first time this is requested, so the
// homepage section renders correctly out of the box. An admin can rename,
// re-image, reorder, deactivate, delete, or add to these later — this only
// runs when the collection is empty.
const DEFAULTS = [
  {
    key: 'restaurant',
    tabLabel: 'Restaurant',
    name: 'Swaad',
    tagline: 'Multi-cuisine Fine Dining',
    description:
      'Savour authentic Awadhi flavours alongside a curated multi-cuisine menu, served in an elegant dining room by a team dedicated to every detail of your meal.',
    image: { url: '/assets/images/background/appartment.jpg', publicId: 'seed-facility-restaurant', order: 0 },
    order: 1,
  },
  {
    key: 'bar',
    tabLabel: 'Bar',
    name: "90's Bar",
    tagline: 'Retro Vibes, Craft Cocktails',
    description:
      "Step back in time at the 90's Bar — nostalgic decor, a curated cocktail list, and a relaxed soundtrack that make it the perfect spot to unwind.",
    image: { url: '/assets/images/background/architecture.jpg', publicId: 'seed-facility-bar', order: 0 },
    order: 2,
  },
  {
    key: 'rooftop',
    tabLabel: 'Rooftop',
    name: 'Highlife and Club',
    tagline: 'Skyline Views & Nightlife',
    description:
      'Head up to Highlife and Club for panoramic skyline views, live music nights, and a buzzing atmosphere that carries on well after sundown.',
    image: { url: '/assets/images/background/interior.jpg', publicId: 'seed-facility-rooftop', order: 0 },
    order: 3,
  },
  {
    key: 'garden',
    tabLabel: 'Garden',
    name: 'The Garden',
    tagline: 'Lush Outdoor Retreat',
    description:
      'A landscaped green retreat right at the heart of the property — ideal for a quiet morning walk, an outdoor breakfast, or an intimate evening gathering.',
    image: { url: '/assets/images/background/room.jpg', publicId: 'seed-facility-garden', order: 0 },
    order: 4,
  },
  {
    key: 'dome',
    tabLabel: 'Dome',
    name: 'The Dome Area',
    tagline: 'Unique Events Space',
    description:
      'Our signature Dome Area offers a striking, one-of-a-kind setting for celebrations, private dinners, and events your guests will remember.',
    image: { url: '/assets/images/background/bg-dot.jpg', publicId: 'seed-facility-dome', order: 0 },
    order: 5,
  },
];

async function ensureSeeded() {
  const count = await Facility.countDocuments();
  if (count === 0) {
    await Facility.insertMany(DEFAULTS);
  }
}

// PUBLIC: active facility tabs, in order.
router.get('/', asyncHandler(async (req, res) => {
  await ensureSeeded();
  const items = await Facility.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

// ADMIN: every facility, including inactive ones.
router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  await ensureSeeded();
  const items = await Facility.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

// ADMIN: create a new tab (e.g. a future "Spa" tab).
router.post(
  '/',
  requireAuth,
  [body('key').trim().notEmpty(), body('tabLabel').trim().notEmpty(), body('name').trim().notEmpty()],
  validate,
  asyncHandler(async (req, res) => {
    const { key, tabLabel, name, tagline, description, order, active } = req.body;
    const item = await Facility.create({
      key: key.toLowerCase(),
      tabLabel,
      name,
      tagline: tagline || '',
      description: description || '',
      order: order ?? 0,
      active: active ?? true,
    });
    res.status(201).json({ success: true, data: item });
  })
);

// ADMIN: update a tab's text fields / order / active state.
router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const allowed = ['key', 'tabLabel', 'name', 'tagline', 'description', 'order', 'active'];
  const updates = {};
  for (const field of allowed) {
    if (req.body[field] !== undefined) updates[field] = req.body[field];
  }
  if (updates.key) updates.key = updates.key.toLowerCase();
  const item = await Facility.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Facility not found' });
  res.json({ success: true, data: item });
}));

// ADMIN: replace a tab's image.
router.post('/:id/image', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const item = await Facility.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Facility not found' });
  if (item.image?.publicId && !item.image.publicId.startsWith('seed-')) {
    await deleteFromCloudinary(item.image.publicId);
  }
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'facilities');
  item.image = { url, publicId, alt: item.name, order: 0 };
  await item.save();
  res.json({ success: true, data: item });
}));

// ADMIN: delete a tab.
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await Facility.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Facility not found' });
  if (item.image?.publicId && !item.image.publicId.startsWith('seed-')) {
    await deleteFromCloudinary(item.image.publicId);
  }
  await item.deleteOne();
  res.json({ success: true });
}));

export default router;