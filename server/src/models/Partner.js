import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

// "Our Partners" home-page logo grid
const partnerSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Partner' },
    image: { type: imageSchema, required: true },
    link: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

partnerSchema.index({ order: 1 });

export default mongoose.model('Partner', partnerSchema);