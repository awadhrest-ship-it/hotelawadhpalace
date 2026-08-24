import mongoose from 'mongoose';

const contactEnquirySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    subject: { type: String, trim: true, default: '' },
    message: { type: String, required: true },
    status: { type: String, enum: ['new', 'read', 'responded', 'archived'], default: 'new' },
  },
  { timestamps: true }
);

export default mongoose.model('ContactEnquiry', contactEnquirySchema);
