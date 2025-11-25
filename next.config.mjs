/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  // This matches the path structure in XAMPP: htdocs/mysystem/dist
  basePath: '/mysystem',
  assetPrefix: '/mysystem',
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
