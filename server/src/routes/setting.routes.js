import { Router } from 'express';
import SiteSetting from '../models/SiteSetting.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  let settings = await SiteSetting.findOne({ key: 'general' });
  if (!settings) settings = await SiteSetting.create({ key: 'general' });
  res.json({ success: true, data: settings });
}));

router.put('/', requireAuth, asyncHandler(async (req, res) => {
  const settings = await SiteSetting.findOneAndUpdate(
    { key: 'general' },
    { ...req.body, key: 'general' },
    { new: true, upsert: true, runValidators: true }
  );
  res.json({ success: true, data: settings });
}));

export default router;
