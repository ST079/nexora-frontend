import { config } from "@/config/config";
import { getProducts } from "@/api/product";
import {
  ABOUT_ROUTE,
  CONTACT_ROUTE,
  HOME_ROUTE,
  PRODUCTS_ROUTE,
} from "@/constants/routes";

// Rebuilt at most hourly so new listings show up without a redeploy.
export const revalidate = 3600;

const MAX_PRODUCTS = 1000;

const url = (path) => new URL(path, config.siteUrl).toString();

const sitemap = async () => {
  const pages = [
    { url: url(HOME_ROUTE), changeFrequency: "daily", priority: 1 },
    { url: url(PRODUCTS_ROUTE), changeFrequency: "daily", priority: 0.9 },
    { url: url(ABOUT_ROUTE), changeFrequency: "monthly", priority: 0.4 },
    { url: url(CONTACT_ROUTE), changeFrequency: "monthly", priority: 0.4 },
  ];

  // If the API is down, still serve the static pages.
  let products = [];
  try {
    products = await getProducts({ limit: MAX_PRODUCTS, offset: 0 });
  } catch {
    products = [];
  }

  return [
    ...pages,
    ...(Array.isArray(products) ? products : []).map((p) => ({
      url: url(`${PRODUCTS_ROUTE}/${p._id}`),
      lastModified: p.updatedAt ?? p.createdAt,
      changeFrequency: "weekly",
      priority: 0.7,
    })),
  ];
};

export default sitemap;
