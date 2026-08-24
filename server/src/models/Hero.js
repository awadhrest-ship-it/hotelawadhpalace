import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

const heroSchema = new mongoose.Schema(
  {
    image: { type: imageSchema, required: true },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

heroSchema.index({ order: 1 });

export default mongoose.model('Hero', heroSchema);