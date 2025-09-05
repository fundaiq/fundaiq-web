
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Enable Tailwind CSS v4 support
    optimizePackageImports: ['@headlessui/react', 'lucide-react'],
  },
}

module.exports = nextConfig