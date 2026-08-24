import { Router } from 'express';
import { body } from 'express-validator';
import TeamMember from '../models/TeamMember.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const items = await TeamMember.find({ active: true }).sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const items = await TeamMember.find().sort({ order: 1, createdAt: 1 });
  res.json({ success: true, data: items });
}));

router.post('/', requireAuth, upload.single('image'), [body('name').notEmpty()], validate,
  asyncHandler(async (req, res) => {
    assertValidImage(req.file);
    const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'team');
    const item = await TeamMember.create({
      name: req.body.name,
      role: req.body.role || '',
      socialLinks: {
        facebook: req.body.facebook || '',
        twitter: req.body.twitter || '',
        instagram: req.body.instagram || '',
      },
      image: { url, publicId, alt: req.body.name, order: 0 },
    });
    res.status(201).json({ success: true, data: item });
  }));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const { facebook, twitter, instagram, ...rest } = req.body;
  const update = { ...rest };
  if (facebook !== undefined || twitter !== undefined || instagram !== undefined) {
    update.socialLinks = { facebook: facebook || '', twitter: twitter || '', instagram: instagram || '' };
  }
  const item = await TeamMember.findByIdAndUpdate(req.params.id, update, { new: true, runValidators: true });
  if (!item) return res.status(404).json({ success: false, message: 'Team member not found' });
  res.json({ success: true, data: item });
}));

router.post('/:id/photo', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const item = await TeamMember.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Team member not found' });
  if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'team');
  item.image = { url, publicId, alt: item.name, order: 0 };
  await item.save();
  res.json({ success: true, data: item });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const item = await TeamMember.findById(req.params.id);
  if (!item) return res.status(404).json({ success: false, message: 'Team member not found' });
  if (item.image?.publicId) await deleteFromCloudinary(item.image.publicId);
  await item.deleteOne();
  res.json({ success: true });
}));

export default router;