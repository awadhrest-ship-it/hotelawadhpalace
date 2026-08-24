import mongoose from 'mongoose';
import { imageSchema } from './shared/imageSchema.js';

// "Our Team" home-page cards
const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, default: '' },
    image: { type: imageSchema, required: true },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
    },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

teamMemberSchema.index({ order: 1 });

export default mongoose.model('TeamMember', teamMemberSchema);