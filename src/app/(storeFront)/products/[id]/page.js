import { cache } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import ProductDetailClient from "@/components/ProductDetailClient";
import { getProductById } from "@/api/product";
import { PRODUCTS_ROUTE } from "@/constants/routes";
import SimilarProducts from "@/components/SimilarProducts";
import { productImage } from "@/utils/format";
import { FALLBACK_IMG } from "@/constants/defaults";

// generateMetadata and the page both need the product; `cache` makes that
// one request. The API answers 404 for a missing product and 400 for a
// malformed id; both mean "no such product", anything else is a real error.
const loadProduct = cache(async (id) => {
  try {
    return await getProductById(id);
  } catch (error) {
    if ([400, 404].includes(error?.response?.status)) return null;
    throw error;
  }
});

const summarise = (text = "", max = 155) => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > max ? `${clean.slice(0, max - 1).trimEnd()}…` : clean;
};

export const generateMetadata = async ({ params }) => {
  const { id } = await params;
  const product = await loadProduct(id);
  if (!product) return { title: "Product not found", robots: { index: false } };

  const description =
    summarise(product.description) ||
    `Buy ${product.name}${product.brand ? ` by ${product.brand}` : ""} on Nexora.`;
  const image = productImage(product);
  const images = image && image !== FALLBACK_IMG ? [{ url: image, alt: product.name }] : [];

  return {
    title: product.name,
    description,
    alternates: { canonical: `${PRODUCTS_ROUTE}/${product._id}` },
    openGraph: { title: product.name, description, images },
    twitter: { card: images.length ? "summary_large_image" : "summary" },
  };
};

const ProductDetailPage = async ({ params }) => {
  const { id } = await params;
  const product = await loadProduct(id);

  if (!product) notFound();

  // Lets search engines show price and availability in results.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description || undefined,
    brand: product.brand ? { "@type": "Brand", name: product.brand } : undefined,
    category: product.category || undefined,
    image: (product.imageUrls ?? []).filter(Boolean),
    sku: String(product._id),
    offers: {
      "@type": "Offer",
      priceCurrency: "NPR",
      price: product.price,
      availability:
        product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <section className="container-page min-h-screen pb-16 pt-6 lg:pt-10">
      <script
        type="application/ld+json"
        // Escape "<" so a product description can't close the script tag.
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex min-w-0 items-center gap-1 text-sm text-slate">
          <li>
            <Link href={PRODUCTS_ROUTE} className="btn-ghost -ml-3 gap-1 px-3 py-1.5">
              <ChevronLeft size={15} /> Shop
            </Link>
          </li>
          {product.category && (
            <>
              <li aria-hidden className="text-slate-light">/</li>
              <li className="min-w-0">
                <Link
                  href={`${PRODUCTS_ROUTE}?category=${encodeURIComponent(product.category)}`}
                  className="btn-ghost block truncate px-3 py-1.5"
                >
                  {product.category}
                </Link>
              </li>
            </>
          )}
          <li aria-hidden className="hidden text-slate-light sm:block">/</li>
          <li aria-current="page" className="hidden min-w-0 truncate px-3 font-medium text-ink sm:block">
            {product.name}
          </li>
        </ol>
      </nav>

      <ProductDetailClient product={product} />
      <SimilarProducts category={product.category} currentProductId={product._id} />
    </section>
  );
};

export default ProductDetailPage;
