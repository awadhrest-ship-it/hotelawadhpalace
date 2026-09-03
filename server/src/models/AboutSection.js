import mongoose from 'mongoose';

// "About Awadh Palace" home-page section text — singleton doc (key: 'main').
// This does NOT include the photo slider on the right (that's AboutImage /
// the "About Images" admin page, already editable) — only the heading,
// subheading, paragraph, the 4 icon boxes (Restaurants / Wellness & Spa /
// Free Wifi / Game Zone), and the "More About" button.
const aboutBoxSchema = new mongoose.Schema(
  {
    icon: { type: String, default: 'flaticon-room-service' },
    title: { type: String, required: true },
    text: { type: String, default: '' },
    order: { type: Number, default: 0 },
  },
  { _id: true }
);

const aboutSectionSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'main' },
    heading: { type: String, default: 'About Awadh Palace' },
    subheading: { type: String, default: 'We will be so proud to have you as our guest.' },
    text: {
      type: String,
      default:
        'From the moment you arrive, our team is dedicated to making your stay unforgettable — thoughtful service, comfortable rooms, and amenities designed around you.',
    },
    boxes: { type: [aboutBoxSchema], default: [] },
    buttonText: { type: String, default: 'More About' },
    buttonLink: { type: String, default: '/about' },
  },
  { timestamps: true }
);

export default mongoose.model('AboutSection', aboutSectionSchema);