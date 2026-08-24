import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from './config/env.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

import authRoutes from './routes/auth.routes.js';
import roomRoutes from './routes/room.routes.js';
import categoryRoutes from './routes/category.routes.js';
import amenityRoutes from './routes/amenity.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import contactRoutes from './routes/contact.routes.js';
import newsletterRoutes from './routes/newsletter.routes.js';
import blogRoutes from './routes/blog.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import testimonialRoutes from './routes/testimonial.routes.js';
import settingRoutes from './routes/setting.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import adminRoutes from './routes/admin.routes.js';
import heroRoutes from './routes/hero.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: false }));
  app.use(cors({ origin: env.clientUrl, credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));
  app.use(cookieParser());
  app.use(mongoSanitize());
  if (env.nodeEnv !== 'test') {
    app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
  }

  app.get('/api/health', (req, res) => res.json({ success: true, status: 'ok', env: env.nodeEnv }));

  app.use('/api/auth', authRoutes);
  app.use('/api/rooms', roomRoutes);
  app.use('/api/categories', categoryRoutes);
  app.use('/api/amenities', amenityRoutes);
  app.use('/api/bookings', bookingRoutes);
  app.use('/api/contact', contactRoutes);
  app.use('/api/newsletter', newsletterRoutes);
  app.use('/api/blog', blogRoutes);
  app.use('/api/gallery', galleryRoutes);
  app.use('/api/testimonials', testimonialRoutes);
  app.use('/api/settings', settingRoutes);
  app.use('/api/dashboard', dashboardRoutes);
  app.use('/api/admins', adminRoutes);
  app.use('/api/hero', heroRoutes);
  
  // Serve the built React app in production
  if (env.nodeEnv === 'production') {
    const clientDist = path.join(__dirname, '../../client/dist');
    app.use(express.static(clientDist));
    app.get('*', (req, res, next) => {
      if (req.path.startsWith('/api')) return next();
      res.sendFile(path.join(clientDist, 'index.html'));
    });
  }

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
