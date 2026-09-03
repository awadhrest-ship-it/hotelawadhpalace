import { Router } from 'express';
import AboutSection from '../models/AboutSection.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Defaults mirror what's currently hardcoded on the homepage, so nothing
// changes visually until an admin edits something.
async function getOrCreate() {
  let doc = await AboutSection.findOne({ key: 'main' });
  if (!doc) {
    doc = await AboutSection.create({
      key: 'main',
      boxes: [
        { icon: 'flaticon-seats-at-the-hall', title: 'Club', text: 'A lively space designed for good times, great company, and unforgettable evenings.', order: 0 },
        { icon: 'flaticon-hotel', title: 'Rooftop', text: 'Enjoy the open sky, refreshing ambience, and beautiful evenings.', order: 1 },
        { icon: 'flaticon-cheers', title: 'Bar', text: 'Raise a glass to good times, great music, and an inviting atmosphere.', order: 2 },
        { icon: 'flaticon-room-service', title: 'Restaurant', text: 'A world of flavours, under one roof.', order: 3 },
      ],
    });
  }
  return doc;
}

router.get('/', asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  res.json({ success: true, data: doc });
}));

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const doc = await getOrCreate();
  if (req.body.heading !== undefined) doc.heading = req.body.heading;
  if (req.body.subheading !== undefined) doc.subheading = req.body.subheading;
  if (req.body.text !== undefined) doc.text = req.body.text;
  if (req.body.buttonText !== undefined) doc.buttonText = req.body.buttonText;
  if (req.body.buttonLink !== undefined) doc.buttonLink = req.body.buttonLink;
  if (Array.isArray(req.body.boxes)) doc.boxes = req.body.boxes;
  await doc.save();
  res.json({ success: true, data: doc });
}));

export default router;