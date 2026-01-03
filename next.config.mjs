/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development", // ডেভেলপমেন্ট মোডে PWA বন্ধ থাকবে
  workboxOptions: {
    disableDevLogs: true,
  },
});

const nextConfig = {
  // তোমার অন্য কনফিগ থাকলে এখানে থাকবে
};

module.exports = withPWA(nextConfig);