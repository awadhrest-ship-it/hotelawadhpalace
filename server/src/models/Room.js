import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'RoomCategory', required: true },
    description: { type: String, required: true },
    shortDescription: { type: String, default: '' },
    price: { type: Number, required: true, min: 0 }, // per night, authoritative
    capacityAdults: { type: Number, required: true, min: 1 },
    capacityChildren: { type: Number, default: 0, min: 0 },
    sizeSqft: { type: Number },
    sizeSqmt: { type: Number },
    bedType: { type: String, default: '' },
    bathroomCount: { type: Number, default: 1, min: 0 },
    view: { type: String, default: '' }, // e.g. "City View", "Garden View"
    amenities: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Amenity' }],
    images: [imageSchema],
    featured: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['active', 'inactive', 'maintenance'],
      default: 'active',
    },
    totalUnits: { type: Number, default: 1, min: 1 }, // number of physical rooms of this type
  },
  { timestamps: true }
);

roomSchema.index({ status: 1, featured: 1 });

export default mongoose.model('Room', roomSchema);