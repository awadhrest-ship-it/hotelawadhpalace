import { Router } from 'express';
import { body } from 'express-validator';
import Admin from '../models/Admin.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, requireRole('superadmin'), asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json({ success: true, data: admins.map((a) => a.toSafeJSON()) });
}));

router.post('/', requireAuth, requireRole('superadmin'), [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
], validate, asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await Admin.findOne({ email: email.toLowerCase() });
  if (existing) return res.status(409).json({ success: false, message: 'Email already in use' });
  const passwordHash = await Admin.hashPassword(password);
  const admin = await Admin.create({ name, email, passwordHash, role: role || 'manager' });
  res.status(201).json({ success: true, data: admin.toSafeJSON() });
}));

router.put('/:id', requireAuth, requireRole('superadmin'), asyncHandler(async (req, res) => {
  const { name, role, active } = req.body;
  const admin = await Admin.findByIdAndUpdate(req.params.id, { name, role, active }, { new: true });
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.json({ success: true, data: admin.toSafeJSON() });
}));

router.delete('/:id', requireAuth, requireRole('superadmin'), asyncHandler(async (req, res) => {
  if (req.admin.id === req.params.id) {
    return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
  }
  const admin = await Admin.findByIdAndDelete(req.params.id);
  if (!admin) return res.status(404).json({ success: false, message: 'Admin not found' });
  res.json({ success: true });
}));

export default router;
