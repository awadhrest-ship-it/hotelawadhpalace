import mongoose from 'mongoose';

// Cloudinary-backed image reference used across models.
export const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String, required: true },
    alt: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);
