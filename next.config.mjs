/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Uploads are stored as Cloudinary `secure_url`s (https). http stays
    // allowed for any older records saved before that.
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "http", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
