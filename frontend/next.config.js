/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ skip all ESLint rules
  },
  typescript: {
    ignoreBuildErrors: true,  // ✅ skip type checking too (optional)
  },
  
  
  // Sass support (optional)
  sassOptions: {
    includePaths: ['./src/styles'],
  },
};

module.exports = nextConfig;

