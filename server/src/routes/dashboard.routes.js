import { Router } from 'express';
import Booking from '../models/Booking.js';
import Room from '../models/Room.js';
import ContactEnquiry from '../models/ContactEnquiry.js';
import Newsletter from '../models/Newsletter.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/summary', requireAuth, asyncHandler(async (req, res) => {
  const [totalRooms, activeRooms, totalBookings, pendingBookings, confirmedBookings,
    newEnquiries, subscribers, revenueAgg] = await Promise.all([
    Room.countDocuments(),
    Room.countDocuments({ status: 'active' }),
    Booking.countDocuments(),
    Booking.countDocuments({ status: 'pending' }),
    Booking.countDocuments({ status: 'confirmed' }),
    ContactEnquiry.countDocuments({ status: 'new' }),
    Newsletter.countDocuments({ subscribed: true }),
    Booking.aggregate([
      { $match: { status: { $in: ['confirmed', 'checked-in', 'completed'] } } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  const recentBookings = await Booking.find().populate('room').sort({ createdAt: -1 }).limit(5);

  res.json({
    success: true,
    data: {
      totalRooms,
      activeRooms,
      totalBookings,
      pendingBookings,
      confirmedBookings,
      newEnquiries,
      subscribers,
      totalRevenue: revenueAgg[0]?.total || 0,
      recentBookings,
    },
  });
}));

export default router;
