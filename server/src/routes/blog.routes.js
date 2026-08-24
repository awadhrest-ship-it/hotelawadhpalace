import { Router } from 'express';
import { body } from 'express-validator';
import BlogPost from '../models/BlogPost.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { validate } from '../middleware/validate.js';
import { requireAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { assertValidImage, uploadBufferToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';

const router = Router();

router.get('/', asyncHandler(async (req, res) => {
  const { category } = req.query;
  const filter = { published: true };
  if (category) filter.category = category;
  const posts = await BlogPost.find(filter).sort({ publishedAt: -1 });
  res.json({ success: true, data: posts });
}));

router.get('/:slug', asyncHandler(async (req, res) => {
  const post = await BlogPost.findOne({ slug: req.params.slug, published: true });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}));

router.get('/admin/all', requireAuth, asyncHandler(async (req, res) => {
  const posts = await BlogPost.find().sort({ createdAt: -1 });
  res.json({ success: true, data: posts });
}));

router.post('/', requireAuth, [body('title').notEmpty(), body('slug').notEmpty(), body('content').notEmpty()], validate,
  asyncHandler(async (req, res) => {
    const post = await BlogPost.create(req.body);
    res.status(201).json({ success: true, data: post });
  }));

router.put('/:id', requireAuth, asyncHandler(async (req, res) => {
  const post = await BlogPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  res.json({ success: true, data: post });
}));

router.post('/:id/cover', requireAuth, upload.single('image'), asyncHandler(async (req, res) => {
  assertValidImage(req.file);
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.coverImage?.publicId) await deleteFromCloudinary(post.coverImage.publicId);
  const { secure_url: url, public_id: publicId } = await uploadBufferToCloudinary(req.file.buffer, 'blog');
  post.coverImage = { url, publicId, alt: post.title, order: 0 };
  await post.save();
  res.json({ success: true, data: post });
}));

router.delete('/:id', requireAuth, asyncHandler(async (req, res) => {
  const post = await BlogPost.findById(req.params.id);
  if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
  if (post.coverImage?.publicId) await deleteFromCloudinary(post.coverImage.publicId);
  await post.deleteOne();
  res.json({ success: true });
}));

export default router;
