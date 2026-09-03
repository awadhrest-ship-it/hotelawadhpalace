import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

// "Our Specialization" home-page section — singleton doc (key: 'main'),
// with an editable heading/text, 3 stat counters, and 4 hover feature
// tiles (Rooms / Restaurant / Luxury Bars / Meeting Hall), each of which
// swaps the section's full-bleed background image on hover, exactly like
// the reference template's bg-changer + hover_tab() behaviour.
const counterSchema = new mongoose.Schema(
  {
    number: { type: Number, required: true },
    label: { type: String, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const featureSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'flaticon-hotel' },
    title: { type: String, required: true },
    image: { type: imageSchema, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const specializationSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    heading: { type: String, default: 'Discover a hotel that defines a new dimension of luxury.' },
    text: { type: String, default: '' },
    counters: { type: [counterSchema], default: [] },
    features: { type: [featureSchema], default: [] },
    // Background image for the About page's "By The Numbers" section
    // (same stat counters, shown again on /about). Not required so old
    // documents created before this field existed still load fine —
    // specialization.routes.js backfills it on read.
    numbersBackground: { type: imageSchema, required: false },
  },
  { timestamps: true }
);

export default mongoose.model('Specialization', specializationSchema);