import { Router } from 'express';
import GalleryCategory from '../models/GalleryCategory.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

// GET all categories (optionally filter with ?featured=true)
router.get('/', asyncHandler(async (req, res) => {
  const filter = req.query.featured === 'true' ? { featured: true } : {};
  const categories = await GalleryCategory.find(filter).sort({ order: 1, createdAt: -1 });
  res.json({ success: true, data: categories });
}));

// GET featured categories only
router.get('/featured', asyncHandler(async (req, res) => {
  const categories = await GalleryCategory.find({ featured: true }).sort({ order: 1 });
  res.json({ success: true, data: categories });
}));

// POST create category. Cover image is OPTIONAL — only upload it if one was sent.
router.post('/', requireAuth, upload.single('coverImage'), asyncHandler(async (req, res) => {
  if (!req.body.name || !req.body.name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  let coverImage = null;
  if (req.file) {
    assertValidImage(req.file);
    const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'gallery-categories');
    coverImage = { url, publicId, alt: req.body.name };
  }

  try {
    const category = await GalleryCategory.create({
      name: req.body.name.trim(),
      description: req.body.description || '',
      coverImage,
      featured: req.body.featured === 'true',
      order: parseInt(req.body.order) || 0,
    });
    res.status(201).json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: `A category named "${req.body.name}" already exists` });
    }
    throw err;
  }
}));

// PUT update category. Cover image is OPTIONAL — existing one is kept unless a new file is sent.
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
  } else if (req.body.removeCoverImage === 'true') {
    if (category.coverImage?.publicId) {
      await deleteFromCloudinary(category.coverImage.publicId);
    }
    category.coverImage = null;
  }

  if (req.body.name !== undefined && !req.body.name.trim()) {
    return res.status(400).json({ success: false, message: 'Category name is required' });
  }

  category.name = req.body.name ? req.body.name.trim() : category.name;
  category.description = req.body.description !== undefined ? req.body.description : category.description;
  category.featured = req.body.featured === 'true' ? true : req.body.featured === 'false' ? false : category.featured;
  category.order = req.body.order !== undefined ? parseInt(req.body.order) : category.order;

  try {
    await category.save();
    res.json({ success: true, data: category });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ success: false, message: `A category named "${req.body.name}" already exists` });
    }
    throw err;
  }
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