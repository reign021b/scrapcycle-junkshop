/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.pinimg.com",
      },
      {
        protocol: "https",
        hostname: "alfljqjdwlomzepvepun.supabase.co",
      },
    ],
  },
};

export default nextConfig;
