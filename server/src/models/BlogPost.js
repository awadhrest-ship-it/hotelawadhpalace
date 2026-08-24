import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

const blogPostSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    excerpt: { type: String, default: '' },
    content: { type: String, required: true },
    coverImage: imageSchema,
    author: { type: String, default: 'Admin' },
    category: { type: String, default: 'General' },
    tags: [{ type: String }],
    published: { type: Boolean, default: true },
    publishedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('BlogPost', blogPostSchema);
