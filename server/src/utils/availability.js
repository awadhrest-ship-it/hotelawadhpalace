import Booking from '../models/Booking.js';

/**
 * Counts how many confirmed/pending bookings for `roomId` overlap the given
 * [checkIn, checkOut) range. Overlap test: existing.checkIn < newCheckOut AND
 * existing.checkOut > newCheckIn.
 */
export async function countOverlappingBookings(roomId, checkIn, checkOut, excludeBookingId = null) {
  const query = {
    room: roomId,
    status: { $in: ['pending', 'confirmed', 'checked-in'] },
    checkIn: { $lt: checkOut },
    checkOut: { $gt: checkIn },
  };
  if (excludeBookingId) query._id = { $ne: excludeBookingId };
  return Booking.countDocuments(query);
}

export function nightsBetween(checkIn, checkOut) {
  const ms = new Date(checkOut).setHours(0, 0, 0, 0) - new Date(checkIn).setHours(0, 0, 0, 0);
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function assertValidDateRange(checkIn, checkOut) {
  const inDate = new Date(checkIn);
  const outDate = new Date(checkOut);
  if (Number.isNaN(inDate.getTime()) || Number.isNaN(outDate.getTime())) {
    throw Object.assign(new Error('Invalid check-in/check-out date'), { status: 400 });
  }
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (inDate < today) {
    throw Object.assign(new Error('Check-in date cannot be in the past'), { status: 400 });
  }
  if (outDate <= inDate) {
    throw Object.assign(new Error('Check-out date must be after check-in date'), { status: 400 });
  }
  return { inDate, outDate };
}
