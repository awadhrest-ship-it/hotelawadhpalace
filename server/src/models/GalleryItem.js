import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

const galleryItemSchema = new mongoose.Schema(
  {
    title: { type: String, default: '' },
    category: { type: String, default: 'general' },
    image: { type: imageSchema, required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('GalleryItem', galleryItemSchema);
