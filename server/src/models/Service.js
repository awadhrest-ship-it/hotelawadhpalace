import mongoose from 'mongoose';

// "Our Services" home-page icon boxes (Free Wi-Fi, Meetings & Special Events, etc.)
const serviceSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'flaticon-wifi' },
    title: { type: String, required: true, trim: true },
    text: { type: String, default: '' },
    order: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

serviceSchema.index({ order: 1 });

export default mongoose.model('Service', serviceSchema);