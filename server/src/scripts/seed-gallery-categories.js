import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { connectDB } from '../config/db.js';
import mongoose from 'mongoose';
import GalleryCategory from '../models/GalleryCategory.js';

// Cover photo is optional — these are seeded WITHOUT one.
// Add a cover photo any time from Admin → Gallery Categories → Edit.
const categoryDefs = [
  { name: 'Reception', order: 0 },
  { name: 'Bar', order: 1 },
  { name: 'Rooms', order: 2 },
  { name: 'Studio', order: 3 },
  { name: 'Wedding', order: 4 },
  { name: 'Birthday', order: 5 },
  { name: 'Food & Catering', order: 6 },
  { name: 'Parties', order: 7 },
  { name: 'Events', order: 8 },
];

async function seed() {
  await connectDB();

  let created = 0;
  let skipped = 0;

  for (const def of categoryDefs) {
    const existing = await GalleryCategory.findOne({ name: def.name });
    if (existing) {
      skipped += 1;
      continue;
    }
    await GalleryCategory.create({
      name: def.name,
      description: '',
      coverImage: null,
      featured: false,
      order: def.order,
    });
    created += 1;
  }

  console.log(`[seed-gallery-categories] created ${created} categor${created === 1 ? 'y' : 'ies'}, skipped ${skipped} that already existed`);
  console.log('[seed-gallery-categories] ✅ done — add cover photos from Admin → Gallery Categories whenever you like');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed-gallery-categories] ❌ failed', err);
  process.exit(1);
});