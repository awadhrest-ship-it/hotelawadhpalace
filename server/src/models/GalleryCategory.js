import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

const galleryCategorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String, default: '' },
    coverImage: { type: imageSchema, required: true },
    featured: { type: Boolean, default: false },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model('GalleryCategory', galleryCategorySchema);