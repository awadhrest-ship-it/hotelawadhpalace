import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, unique: true },
    room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
    checkIn: { type: Date, required: true },
    checkOut: { type: Date, required: true },
    nights: { type: Number, required: true, min: 1 },
    guests: {
      adults: { type: Number, required: true, min: 1 },
      children: { type: Number, default: 0, min: 0 },
    },
    guest: {
      firstName: { type: String, required: true, trim: true },
      lastName: { type: String, required: true, trim: true },
      email: { type: String, required: true, trim: true, lowercase: true },
      phone: { type: String, required: true, trim: true },
      specialRequests: { type: String, default: '' },
    },
    pricePerNight: { type: Number, required: true }, // snapshot of room price at booking time
    totalAmount: { type: Number, required: true }, // server-calculated, never trust client
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'checked-in', 'completed'],
      default: 'pending',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

bookingSchema.index({ room: 1, checkIn: 1, checkOut: 1 });
bookingSchema.index({ status: 1 });

export default mongoose.model('Booking', bookingSchema);
