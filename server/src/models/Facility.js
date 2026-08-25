import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

// Powers the homepage "Our Rooms & Suites" tabbed section. Each doc is one
// non-room tab (Restaurant, Bar, Rooftop, Garden, Dome, ...). The "Rooms"
// tab itself is NOT stored here — it stays wired to the existing Room /
// RoomCategory data so the room carousel keeps working exactly as before.
// `key` is a stable machine slug used by the frontend to tell tabs apart;
// `tabLabel` is what's shown on the tab button; `name`/`tagline`/
// `description`/`image` are the venue's own details shown when its tab
// is active.
const facilitySchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true, lowercase: true },
    tabLabel: { type: String, required: true, trim: true },
    name: { type: String, required: true, trim: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: imageSchema },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

facilitySchema.index({ order: 1 });

export default mongoose.model('Facility', facilitySchema);