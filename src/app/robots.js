import { config } from "@/config/config";

// Storefront pages are public; accounts, checkout and staff tools are not.
const robots = () => ({
  rules: {
    userAgent: "*",
    allow: "/",
    disallow: [
      "/dashboard",
      "/product-management",
      "/order-management",
      "/user-management",
      "/account",
      "/cart",
      "/checkout",
      "/orders",
      "/reset-password",
      "/forgot-password",
    ],
  },
  sitemap: new URL("/sitemap.xml", config.siteUrl).toString(),
});

export default robots;
