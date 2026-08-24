import multer from 'multer';

const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter(req, file, cb) {
    if (!/^image\/(jpeg|png|webp|avif)$/.test(file.mimetype)) {
      return cb(Object.assign(new Error('Only jpeg/png/webp/avif images are allowed'), { status: 400 }));
    }
    cb(null, true);
  },
});
