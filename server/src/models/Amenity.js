import mongoose from 'mongoose';

const amenitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, unique: true },
    icon: { type: String, default: 'flaticon-room-service' },
  },
  { timestamps: true }
);

export default mongoose.model('Amenity', amenitySchema);
