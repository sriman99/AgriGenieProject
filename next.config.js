/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'images.unsplash.com',
      'plus.unsplash.com',
      'source.unsplash.com',
      'images.pexels.com',
      'res.cloudinary.com'
    ],
  },
  experimental: {
    serverActions: true,
  },
};

module.exports = nextConfig; 