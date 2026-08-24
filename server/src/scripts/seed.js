import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../../../.env') });

import { connectDB } from '../config/db.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';
import Admin from '../models/Admin.js';
import RoomCategory from '../models/RoomCategory.js';
import Amenity from '../models/Amenity.js';
import Room from '../models/Room.js';
import Testimonial from '../models/Testimonial.js';
import BlogPost from '../models/BlogPost.js';
import GalleryItem from '../models/GalleryItem.js';
import SiteSetting from '../models/SiteSetting.js';
import Service from '../models/Service.js';
import Partner from '../models/Partner.js';
import TeamMember from '../models/TeamMember.js';
import Specialization from '../models/Specialization.js';

async function seed() {
  await connectDB();

  // Admin
  const existingAdmin = await Admin.findOne({ email: env.seedAdmin.email.toLowerCase() });
  if (!existingAdmin) {
    const passwordHash = await Admin.hashPassword(env.seedAdmin.password);
    await Admin.create({
      name: 'Site Administrator',
      email: env.seedAdmin.email,
      passwordHash,
      role: 'superadmin',
    });
    console.log(`[seed] created admin ${env.seedAdmin.email}`);
  } else {
    console.log('[seed] admin already exists, skipping');
  }

  // Amenities
  const amenityNames = [
    { name: 'Free Wi-Fi', icon: 'flaticon-wifi' },
    { name: 'Air Conditioning', icon: 'flaticon-air-conditioner' },
    { name: 'Room Service', icon: 'flaticon-room-service' },
    { name: 'Mini Bar', icon: 'flaticon-bar' },
    { name: 'Flat-screen TV', icon: 'flaticon-television' },
    { name: 'Sea View', icon: 'flaticon-beach' },
  ];
  const amenities = [];
  for (const a of amenityNames) {
    const doc = await Amenity.findOneAndUpdate({ name: a.name }, a, { upsert: true, new: true });
    amenities.push(doc);
  }

  // Categories
  const categoryDefs = [
    { name: 'Classic', slug: 'classic', description: 'Comfortable and elegant rooms for every traveler.' },
    { name: 'Deluxe', slug: 'deluxe', description: 'Spacious rooms with premium furnishing.' },
    { name: 'Suite', slug: 'suite', description: 'Our most luxurious accommodations.' },
  ];
  const categories = [];
  for (const c of categoryDefs) {
    const doc = await RoomCategory.findOneAndUpdate({ slug: c.slug }, c, { upsert: true, new: true });
    categories.push(doc);
  }

  // Rooms with REAL template images
  const roomDefs = [
    {
      name: 'Classic Balcony Room',
      slug: 'classic-balcony-room',
      category: categories[0]._id,
      description: 'A cozy room with a private balcony overlooking the gardens, featuring warm wood tones and modern comforts.',
      shortDescription: 'Cozy room with a private balcony.',
      price: 120,
      capacityAdults: 2,
      capacityChildren: 1,
      sizeSqft: 320,
      bedType: 'Queen Bed',
      amenities: amenities.slice(0, 4).map((a) => a._id),
      images: [
        { url: '/assets/images/rooms/pic1.jpg', publicId: 'local/template/rooms/pic1', alt: 'Classic Balcony Room', order: 0 },
        { url: '/assets/images/rooms/pic2.jpg', publicId: 'local/template/rooms/pic2', alt: 'Classic Balcony Room 2', order: 1 },
      ],
      featured: true,
      totalUnits: 6,
    },
    {
      name: 'Superior Double Room',
      slug: 'superior-double-room',
      category: categories[0]._id,
      description: 'A generously sized double room designed for relaxation, with a workspace and rain shower bathroom.',
      shortDescription: 'Generously sized double room.',
      price: 145,
      capacityAdults: 2,
      capacityChildren: 1,
      sizeSqft: 350,
      bedType: 'Double Bed',
      amenities: amenities.slice(0, 5).map((a) => a._id),
      images: [
        { url: '/assets/images/rooms/pic3.jpg', publicId: 'local/template/rooms/pic3', alt: 'Superior Double Room', order: 0 },
        { url: '/assets/images/rooms/pic1.jpg', publicId: 'local/template/rooms/pic1b', alt: 'Superior Double Room 2', order: 1 },
      ],
      featured: true,
      totalUnits: 8,
    },
    {
      name: 'Deluxe Sea View Room',
      slug: 'deluxe-sea-view-room',
      category: categories[1]._id,
      description: 'Wake up to panoramic sea views in this deluxe room featuring premium amenities and a private terrace.',
      shortDescription: 'Deluxe room with panoramic sea views.',
      price: 210,
      capacityAdults: 3,
      capacityChildren: 1,
      sizeSqft: 420,
      bedType: 'King Bed',
      amenities: amenities.map((a) => a._id),
      images: [
        { url: '/assets/images/rooms/pic4.jpg', publicId: 'local/template/rooms/pic4', alt: 'Deluxe Sea View Room', order: 0 },
        { url: '/assets/images/rooms/pic5.jpg', publicId: 'local/template/rooms/pic5', alt: 'Deluxe Sea View Room 2', order: 1 },
      ],
      featured: true,
      totalUnits: 4,
    },
    {
      name: 'Presidential Suite',
      slug: 'presidential-suite',
      category: categories[2]._id,
      description: 'The pinnacle of luxury — a expansive suite with a separate living area, private dining, and butler service.',
      shortDescription: 'Expansive suite with private dining.',
      price: 450,
      capacityAdults: 4,
      capacityChildren: 2,
      sizeSqft: 900,
      bedType: 'King Bed + Sofa Bed',
      amenities: amenities.map((a) => a._id),
      images: [
        { url: '/assets/images/rooms/pic2.jpg', publicId: 'local/template/rooms/pic2b', alt: 'Presidential Suite', order: 0 },
        { url: '/assets/images/rooms/pic3.jpg', publicId: 'local/template/rooms/pic3b', alt: 'Presidential Suite 2', order: 1 },
      ],
      featured: false,
      totalUnits: 2,
    },
  ];

  for (const r of roomDefs) {
    await Room.findOneAndUpdate({ slug: r.slug }, r, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`[seed] created ${roomDefs.length} rooms`);

  // Testimonials with template images
  const testimonials = [
    {
      name: 'Amelia Carter',
      designation: 'Travel Blogger',
      message: 'An unforgettable stay — the staff went above and beyond and the rooms were immaculate.',
      rating: 5,
      photo: { url: '/assets/images/testimonials/pic1.jpg', publicId: 'local/template/testimonials/pic1', alt: 'Amelia Carter', order: 0 },
      published: true,
    },
    {
      name: 'James Whitfield',
      designation: 'Business Traveler',
      message: 'Perfect location, fast Wi-Fi, and a genuinely relaxing atmosphere after long meetings.',
      rating: 5,
      photo: { url: '/assets/images/testimonials/pic2.jpg', publicId: 'local/template/testimonials/pic2', alt: 'James Whitfield', order: 0 },
      published: true,
    },
    {
      name: 'Priya Nair',
      designation: 'Honeymooner',
      message: 'We celebrated our honeymoon here and every detail felt thoughtfully arranged.',
      rating: 5,
      photo: { url: '/assets/images/testimonials/pic3.jpg', publicId: 'local/template/testimonials/pic3', alt: 'Priya Nair', order: 0 },
      published: true,
    },
  ];
  for (const t of testimonials) {
    await Testimonial.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
  }
  console.log(`[seed] created ${testimonials.length} testimonials`);

  // Blog posts with template images
  const blogPosts = [
    {
      title: 'Top 5 Reasons to Visit Our Resort This Summer',
      slug: 'top-5-reasons-visit-resort-summer',
      excerpt: 'Discover why Sharan Resort is the perfect destination for your summer getaway.',
      content: '<p>Our resort offers world-class amenities, stunning views, and unparalleled hospitality. From our pristine beaches to our spa facilities, every detail is designed for your comfort.</p>',
      author: 'Admin',
      category: 'Travel Tips',
      coverImage: { url: '/assets/images/blog/pic1.jpg', publicId: 'local/template/blog/pic1', alt: 'Summer at Sharan', order: 0 },
      tags: ['summer', 'travel', 'resort'],
      published: true,
      publishedAt: new Date(),
    },
    {
      title: 'Wellness Guide: Relax and Rejuvenate',
      slug: 'wellness-guide-relax-rejuvenate',
      excerpt: 'Learn how to make the most of our spa and wellness facilities.',
      content: '<p>Our wellness center offers massages, yoga classes, and holistic treatments. Discover inner peace in our tranquil spa environment.</p>',
      author: 'Admin',
      category: 'Wellness',
      coverImage: { url: '/assets/images/blog/pic2.jpg', publicId: 'local/template/blog/pic2', alt: 'Spa and Wellness', order: 0 },
      tags: ['wellness', 'spa', 'relaxation'],
      published: true,
      publishedAt: new Date(),
    },
    {
      title: 'Local Cuisine: A Taste of Paradise',
      slug: 'local-cuisine-taste-paradise',
      excerpt: 'Explore the culinary delights available at our restaurants.',
      content: '<p>Our award-winning chefs craft dishes using locally sourced ingredients. Experience authentic flavors in a stunning oceanside setting.</p>',
      author: 'Admin',
      category: 'Dining',
      coverImage: { url: '/assets/images/blog/pic3.jpg', publicId: 'local/template/blog/pic3', alt: 'Fine Dining', order: 0 },
      tags: ['dining', 'cuisine', 'food'],
      published: true,
      publishedAt: new Date(),
    },
  ];
  for (const b of blogPosts) {
    await BlogPost.findOneAndUpdate({ slug: b.slug }, b, { upsert: true, new: true, setDefaultsOnInsert: true });
  }
  console.log(`[seed] created ${blogPosts.length} blog posts`);

  // Gallery with template images
  const galleryItems = [
    { title: 'Beachfront View', category: 'landscapes', image: { url: '/assets/images/gallery/pic1.jpg', publicId: 'local/template/gallery/pic1', alt: 'Beachfront View', order: 0 } },
    { title: 'Sunset Over Ocean', category: 'landscapes', image: { url: '/assets/images/gallery/pic2.jpg', publicId: 'local/template/gallery/pic2', alt: 'Sunset', order: 1 } },
    { title: 'Pool Area', category: 'amenities', image: { url: '/assets/images/gallery/pic3.jpg', publicId: 'local/template/gallery/pic3', alt: 'Swimming Pool', order: 2 } },
    { title: 'Dining Area', category: 'restaurants', image: { url: '/assets/images/gallery/pic4.jpg', publicId: 'local/template/gallery/pic4', alt: 'Restaurant', order: 3 } },
    { title: 'Garden Pathway', category: 'landscapes', image: { url: '/assets/images/gallery/pic5.jpg', publicId: 'local/template/gallery/pic5', alt: 'Garden', order: 4 } },
  ];
  for (const g of galleryItems) {
    await GalleryItem.create(g);
  }
  console.log(`[seed] created ${galleryItems.length} gallery items`);

  // Site settings
  await SiteSetting.findOneAndUpdate(
    { key: 'general' },
    {
      key: 'general',
      siteName: 'Sharan Resort & Hotel',
      phone: '+1 234 567 8900',
      email: 'info@sharanresort.test',
      address: '123 Ocean Drive, Paradise Coast',
      checkInTime: '12:00 PM',
      checkOutTime: '11:00 AM',
    },
    { upsert: true, new: true }
  );

  // Services ("Our Services" home-page grid)
  const serviceDefs = [
    { icon: 'flaticon-wifi', title: 'Free Wi-Fi Available', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 0 },
    { icon: 'flaticon-room-service', title: 'Meetings & Special Events', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 1 },
    { icon: 'flaticon-smartphone', title: 'Free Cancellation Anytime', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 2 },
    { icon: 'flaticon-business-cards', title: 'Best Price Guarantee', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 3 },
    { icon: 'flaticon-calendar', title: 'Book Now to Secure Availability', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 4 },
    { icon: 'flaticon-time-passing', title: 'Late Check-out on Request', text: 'Lorem ipsum dolor sit piscing sed diam nonmy.', order: 5 },
  ];
  for (const s of serviceDefs) {
    await Service.findOneAndUpdate({ title: s.title }, s, { upsert: true, new: true });
  }
  console.log(`[seed] created ${serviceDefs.length} services`);

  // Partners ("Our Partners" home-page logo grid) with template logos
  const partnerDefs = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6'].map((file, i) => ({
    name: `Partner ${i + 1}`,
    image: { url: `/assets/images/client-logo/${file}.png`, publicId: `local/template/client-logo/${file}`, alt: `Partner ${i + 1}`, order: i },
    order: i,
  }));
  for (const p of partnerDefs) {
    await Partner.findOneAndUpdate({ name: p.name }, p, { upsert: true, new: true });
  }
  console.log(`[seed] created ${partnerDefs.length} partners`);

  // Team ("Our Team" home-page cards) with template photos
  const teamDefs = [
    { name: 'Mariya Newman', role: 'Manager', image: { url: '/assets/images/our-team1/pic1.jpg', publicId: 'local/template/our-team1/pic1', alt: 'Mariya Newman', order: 0 }, order: 0 },
    { name: 'Pamela Smith', role: 'Housekeeping', image: { url: '/assets/images/our-team1/pic2.jpg', publicId: 'local/template/our-team1/pic2', alt: 'Pamela Smith', order: 0 }, order: 1 },
    { name: 'Michael Evens', role: 'Chief Reception Officer', image: { url: '/assets/images/our-team1/pic3.jpg', publicId: 'local/template/our-team1/pic3', alt: 'Michael Evens', order: 0 }, order: 2 },
  ];
  for (const t of teamDefs) {
    await TeamMember.findOneAndUpdate({ name: t.name }, t, { upsert: true, new: true });
  }
  console.log(`[seed] created ${teamDefs.length} team members`);

  // Specialization ("Our Specialization" section) — singleton with template defaults
  const existingSpecialization = await Specialization.findOne({ key: 'main' });
  if (!existingSpecialization) {
    await Specialization.create({
      key: 'main',
      heading: 'Discover a hotel that defines a new dimension of luxury.',
      text:
        'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Mauris fermentum dictum magna. ' +
        'Sed laoreet aliquam leo. Ut tellus dolor, dapibus eget, elementum vel, cursus eleifend, elit. ' +
        'Aenean auctor wisi et urna. Aliquam erat volutpat. Duis ac turpis.',
      counters: [
        { number: 406, label: 'International Guests', order: 0 },
        { number: 132, label: 'Five stars rating', order: 1 },
        { number: 207, label: 'Served Breakfast', order: 2 },
      ],
      features: [
        { icon: 'flaticon-hotel', title: 'Rooms', image: { url: '/assets/images/background/room.jpg', publicId: 'local/template/background/room', order: 0 }, order: 0 },
        { icon: 'flaticon-coffee-cup', title: 'Restaurant', image: { url: '/assets/images/background/appartment.jpg', publicId: 'local/template/background/appartment', order: 1 }, order: 1 },
        { icon: 'flaticon-cheers', title: 'Luxury Bars', image: { url: '/assets/images/background/architecture.jpg', publicId: 'local/template/background/architecture', order: 2 }, order: 2 },
        { icon: 'flaticon-seats-at-the-hall', title: 'Meeting Hall', image: { url: '/assets/images/background/interior.jpg', publicId: 'local/template/background/interior', order: 3 }, order: 3 },
      ],
    });
    console.log('[seed] created specialization section');
  }

  console.log('\n[seed] ✅ Database seeded successfully!');
  console.log(`[seed] Admin login: ${env.seedAdmin.email} / ${env.seedAdmin.password}`);
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('[seed] ❌ failed', err);
  process.exit(1);
});