import { Router } from 'express';
import GalleryCategory from '../models/GalleryCategory.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// GET all categories
router.get('/', asyncHandler(async (req, res) => {
  const categories = await GalleryCategory.find().sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: categories });
}));

// GET featured categories only
router.get('/featured', asyncHandler(async (req, res) => {
  const categories = await GalleryCategory.find({ featured: true }).sort({ order: 1 });
  res.json({ success: true, data: categories });
}));

// POST create category
router.post('/', requireAuth, upload.single('coverImage'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'gallery-categories');
  
  const category = await GalleryCategory.create({
    name: req.body.name,
    description: req.body.description || '',
    coverImage: { url, publicId, alt: req.body.name },
    featured: req.body.featured === 'true',
    order: parseInt(req.body.order) || 0,
  });
  
  res.status(201).json({ success: true, data: category });
}));

// PUT update category
router.put('/:id', requireAuth, upload.single('coverImage'), asyncHandler(async (req, res) => {
  let category = await GalleryCategory.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  // If new cover image is uploaded, delete old and upload new
  if (req.file) {
    assertValidImage(req.file);
    if (category.coverImage?.publicId) {
      await deleteFromCloudinary(category.coverImage.publicId);
    }
    const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'gallery-categories');
    category.coverImage = { url, publicId, alt: req.body.name || category.name };
  }

  category.name = req.body.name || category.name;
  category.description = req.body.description !== undefined ? req.body.description : category.description;
  category.featured = req.body.featured === 'true' ? true : req.body.featured === 'false' ? false : category.featured;
  category.order = req.body.order !== undefined ? parseInt(req.body.order) : category.order;

  await category.save();
  res.json({ success: true, data: category });
}));

// DELETE category
router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const category = await GalleryCategory.findById(req.params.id);
  if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

  if (category.coverImage?.publicId) {
    await deleteFromCloudinary(category.coverImage.publicId);
  }

  await category.deleteOne();
  res.json({ success: true });
}));

export default router;