/**
 * seedRoomsUpdate.js
 *
 * Standalone script. Touches ONLY the Room, RoomCategory, and Amenity
 * collections — nothing else in the database is read or modified.
 *
 * What it does:
 *   1. Upserts the room categories: Deluxe, Executive, Suite
 *   2. Upserts the amenities/features referenced by the rooms below
 *   3. DELETES ALL existing rooms
 *   4. Creates exactly 3 new rooms: Deluxe, Executive, Suite (no images —
 *      upload photos yourself from the admin panel afterwards)
 *
 * Run from the `server/` directory:
 *   node src/scripts/seedRoomsUpdate.js
 *
 * Requires the Room model to have `view`, `bathroomCount`, and `sizeSqmt`
 * fields (already added to server/src/models/Room.js).
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../.env') });

import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import RoomCategory from '../models/RoomCategory.js';
import Amenity from '../models/Amenity.js';
import Room from '../models/Room.js';

async function run() {
  await connectDB();

  // 1. Categories
  const categoryDefs = [
    { name: 'Deluxe', slug: 'deluxe', description: 'Comfortable, well-appointed rooms with a city view.' },
    { name: 'Executive', slug: 'executive', description: 'Elevated rooms with a peaceful garden view.' },
    { name: 'Suite', slug: 'suite', description: 'Our most spacious accommodation with a separate living room.' },
  ];
  const categoryBySlug = {};
  for (const c of categoryDefs) {
    const doc = await RoomCategory.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
    categoryBySlug[c.slug] = doc;
  }

  // 2. Amenities / features used by the rooms below
  const amenityDefs = [
    { name: 'Wi-Fi' },
    { name: 'Air Conditioner' },
    { name: 'Study Room' },
    { name: 'Smoking Room' },
    { name: 'Iron/Ironing Board' },
    { name: 'Air Purifier' },
    { name: 'Living Room' },
    { name: 'Mineral Water – additional charge' },
  ];
  const amenityByName = {};
  for (const a of amenityDefs) {
    const doc = await Amenity.findOneAndUpdate({ name: a.name }, a, { upsert: true, new: true });
    amenityByName[a.name] = doc;
  }
  const amenityId = (name) => amenityByName[name]._id;

  // 3. Delete all existing rooms
  const deleted = await Room.deleteMany({});
  console.log(`[seedRoomsUpdate] deleted ${deleted.deletedCount} existing room(s)`);

  // 4. Create the exact 3 rooms
  const roomDefs = [
    {
      name: 'Deluxe',
      slug: 'deluxe',
      category: categoryBySlug.deluxe._id,
      description: 'A comfortable room with a king bed and city views.',
      shortDescription: 'Comfortable room with a king bed and city view.',
      price: 0,
      capacityAdults: 3,
      capacityChildren: 0,
      sizeSqft: 180,
      sizeSqmt: 17,
      bedType: '1 King Bed',
      bathroomCount: 1,
      view: 'City View',
      amenities: [
        amenityId('Study Room'),
        amenityId('Wi-Fi'),
        amenityId('Smoking Room'),
        amenityId('Iron/Ironing Board'),
        amenityId('Mineral Water – additional charge'),
      ],
      images: [],
      featured: true,
      totalUnits: 1,
      status: 'active',
    },
    {
      name: 'Executive',
      slug: 'executive',
      category: categoryBySlug.executive._id,
      description: 'A refined room with a king bed and a peaceful garden view.',
      shortDescription: 'Refined room with a king bed and garden view.',
      price: 0,
      capacityAdults: 3,
      capacityChildren: 0,
      sizeSqft: 180,
      sizeSqmt: 17,
      bedType: '1 King Bed',
      bathroomCount: 1,
      view: 'Garden View',
      amenities: [
        amenityId('Study Room'),
        amenityId('Wi-Fi'),
        amenityId('Air Purifier'),
        amenityId('Iron/Ironing Board'),
        amenityId('Smoking Room'),
        amenityId('Mineral Water – additional charge'),
      ],
      images: [],
      featured: true,
      totalUnits: 1,
      status: 'active',
    },
    {
      name: 'Suite',
      slug: 'suite',
      category: categoryBySlug.suite._id,
      description: 'A spacious suite with a king bed, a separate living room, and a city view.',
      shortDescription: 'Spacious suite with a separate living room and city view.',
      price: 0,
      capacityAdults: 4,
      capacityChildren: 0,
      sizeSqft: 350,
      sizeSqmt: 33,
      bedType: '1 King Bed',
      bathroomCount: 1,
      view: 'City View',
      amenities: [
        amenityId('Living Room'),
        amenityId('Wi-Fi'),
        amenityId('Air Conditioner'),
        amenityId('Iron/Ironing Board'),
        amenityId('Study Room'),
        amenityId('Mineral Water – additional charge'),
      ],
      images: [],
      featured: true,
      totalUnits: 1,
      status: 'active',
    },
  ];

  await Room.insertMany(roomDefs);
  console.log(`[seedRoomsUpdate] created ${roomDefs.length} new room(s): Deluxe, Executive, Suite`);

  await mongoose.disconnect();
  console.log('[seedRoomsUpdate] done.');
  process.exit(0);
}

run().catch((err) => {
  console.error('[seedRoomsUpdate] failed:', err);
  process.exit(1);
});