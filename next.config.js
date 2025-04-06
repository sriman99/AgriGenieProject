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
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
  transpilePackages: ['@supabase/node-fetch', 'node-fetch'],
  
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Don't resolve 'node-fetch' module on the client to avoid this error
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'node-fetch': false,
      };
    }
    return config;
  },
};

export default nextConfig; 