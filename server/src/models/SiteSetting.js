import mongoose from 'mongoose';

const siteSettingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true }, // singleton row keyed 'general'
    siteName: { type: String, default: 'Hotel Awadh Palace' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' },
    address: { type: String, default: '' },
    socialLinks: {
      facebook: { type: String, default: '' },
      twitter: { type: String, default: '' },
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    checkInTime: { type: String, default: '12:00 PM' },
    checkOutTime: { type: String, default: '11:00 AM' },
  },
  { timestamps: true }
);

export default mongoose.model('SiteSetting', siteSettingSchema);