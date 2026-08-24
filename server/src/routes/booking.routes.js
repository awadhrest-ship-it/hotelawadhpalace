import { Router } from 'express';
import { body } from 'express-validator';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { publicFormLimiter } from '../middleware/rateLimit.js';
import { assertValidDateRange, countOverlappingBookings, nightsBetween } from '../utils/availability.js';
import { generateBookingReference } from '../utils/reference.js';

const router = Router();

// ---------- PUBLIC: create booking ----------
router.post(
  '/',
  publicFormLimiter,
  [
    body('roomId').notEmpty(),
    body('checkIn').notEmpty(),
    body('checkOut').notEmpty(),
    body('guests.adults').isInt({ min: 1 }),
    body('guests.children').optional().isInt({ min: 0 }),
    body('guest.firstName').notEmpty(),
    body('guest.lastName').notEmpty(),
    body('guest.email').isEmail(),
    body('guest.phone').notEmpty(),
  ],
  validate,
  asyncHandler(async (req, res) => {
    const { roomId, checkIn, checkOut, guests, guest, notes } = req.body;

    const room = await Room.findOne({ _id: roomId, status: 'active' });
    if (!room) return res.status(404).json({ success: false, message: 'Room not found or unavailable' });

    const { inDate, outDate } = assertValidDateRange(checkIn, checkOut);

    const totalGuests = (guests?.adults || 0) + (guests?.children || 0);
    if (guests.adults > room.capacityAdults || totalGuests > room.capacityAdults + room.capacityChildren) {
      return res.status(422).json({ success: false, message: 'Guest count exceeds room capacity' });
    }

    // Optimistic conflict check, then re-verify after insert to guard the race window.
    const existingOverlap = await countOverlappingBookings(room._id, inDate, outDate);
    if (existingOverlap >= room.totalUnits) {
      return res.status(409).json({ success: false, message: 'Room is no longer available for these dates' });
    }

    const nights = nightsBetween(inDate, outDate);
    const totalAmount = Math.round(room.price * nights * 100) / 100; // server authoritative total

    const booking = await Booking.create({
      reference: generateBookingReference(),
      room: room._id,
      checkIn: inDate,
      checkOut: outDate,
      nights,
      guests,
      guest,
      pricePerNight: room.price,
      totalAmount,
      status: 'pending',
      notes: notes || '',
    });

    // Re-verify post-insert: if this insert pushed us over capacity, cancel it.
    const overlapAfter = await countOverlappingBookings(room._id, inDate, outDate);
    if (overlapAfter > room.totalUnits) {
      booking.status = 'cancelled';
      booking.notes = `${booking.notes} [auto-cancelled: overbooked race condition]`.trim();
      await booking.save();
      return res.status(409).json({ success: false, message: 'Room was just booked by someone else. Please try different dates.' });
    }

    const populated = await booking.populate({ path: 'room', populate: 'category' });
    res.status(201).json({ success: true, data: populated });
  })
);

router.get(
  '/reference/:reference',
  asyncHandler(async (req, res) => {
    const booking = await Booking.findOne({ reference: req.params.reference }).populate({
      path: 'room',
      populate: 'category',
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  })
);

// ---------- ADMIN ----------
router.get(
  '/',
  requireAuth,
  asyncHandler(async (req, res) => {
    const { status, from, to } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (from || to) {
      filter.checkIn = {};
      if (from) filter.checkIn.$gte = new Date(from);
      if (to) filter.checkIn.$lte = new Date(to);
    }
    const bookings = await Booking.find(filter)
      .populate({ path: 'room', populate: 'category' })
      .sort({ createdAt: -1 });
    res.json({ success: true, data: bookings });
  })
);

router.get(
  '/:id',
  requireAuth,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findById(req.params.id).populate({ path: 'room', populate: 'category' });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  })
);

router.put(
  '/:id/status',
  requireAuth,
  [body('status').isIn(['pending', 'confirmed', 'cancelled', 'checked-in', 'completed'])],
  validate,
  asyncHandler(async (req, res) => {
    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    ).populate({ path: 'room', populate: 'category' });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    res.json({ success: true, data: booking });
  })
);

export default router;
