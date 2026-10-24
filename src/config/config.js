export const config = {
  appName: process.env.NEXT_PUBLIC_APP_NAME,
  apiUrl: process.env.NEXT_PUBLIC_API_URL,
  stripeKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
  // Public origin of the storefront, used for canonical URLs, Open Graph
  // and the sitemap. Set it in production.
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  // Shown before checkout only; the backend's DELIVERY_CHARGE sets the
  // amount actually charged, so keep the two in step.
  deliveryCharge: Number(process.env.NEXT_PUBLIC_DELIVERY_CHARGE) || 200,
};
