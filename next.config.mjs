/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  images:{
    remotePatterns:[
      {
        hostname:"res.cloudinary.com",
        protocol:"http",
      }
    ]
  }
};

export default nextConfig;
