import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

// Images shown in the "About Awadh Palace" slider on the homepage (and, as
// the first active image, the About page's photo). Fully managed from the
// admin panel, mirroring the Hero model's pattern.
const aboutImageSchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

aboutImageSchema.index({ order: 1 });

export default mongoose.model('AboutImage', aboutImageSchema);