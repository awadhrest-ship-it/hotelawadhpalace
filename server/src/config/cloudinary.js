import { v2 as cloudinary } from 'cloudinary';
import { env } from './env.js';

cloudinary.config({
  cloud_name: env.cloudinary.cloudName,
  api_key: env.cloudinary.apiKey,
  api_secret: env.cloudinary.apiSecret,
  secure: true,
});

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
const MAX_BYTES = 20 * 1024 * 1024; // 20MB

export function assertValidImage(file) {
  if (!file) throw Object.assign(new Error('No file provided'), { status: 400 });
  if (!ALLOWED_MIME.includes(file.mimetype)) {
    throw Object.assign(new Error('Unsupported image type'), { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    throw Object.assign(new Error('Image exceeds 20MB limit'), { status: 400 });
  }
}

/**
 * Uploads a buffer (memory storage) to Cloudinary. No temp files are ever
 * written to disk — the buffer is streamed directly.
 */
export function uploadBufferToCloudinary(buffer, folder) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: `sharan-hotel/${folder}`, resource_type: 'image' },
      (err, result) => {
        if (err) return reject(err);
        resolve({ secure_url: result.secure_url, public_id: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

export async function deleteFromCloudinary(publicId) {
  if (!publicId) return;
  await cloudinary.uploader.destroy(publicId);
}

export default cloudinary;