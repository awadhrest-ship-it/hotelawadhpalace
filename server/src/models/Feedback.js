import mongoose from 'mongoose';

const star = { type: Number, min: 1, max: 5 };

const feedbackSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, trim: true, lowercase: true, default: '' },
    phone: { type: String, trim: true, default: '' },
    city: { type: String, trim: true, default: '' },
    roomType: { type: String, trim: true, default: '' },
    stayDate: { type: Date },

    ratings: {
      overall: { ...star, required: true },
      cleanliness: star,
      service: star,
      comfort: star,
      food: star,
      bar: star,
      value: star,
    },

    message: { type: String, required: true, trim: true, maxlength: 2000 },
    wouldRecommend: { type: String, enum: ['yes', 'no', ''], default: '' },

    // Guest ticked "you may show my feedback on your website".
    allowDisplay: { type: Boolean, default: false },

    // Admin-side controls.
    status: { type: String, enum: ['new', 'read', 'archived'], default: 'new' },
    featured: { type: Boolean, default: false },
    featuredAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model('Feedback', feedbackSchema);