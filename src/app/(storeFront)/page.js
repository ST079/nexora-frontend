import { getProducts } from "@/api/product";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import HomeHero from "@/components/HomeHero";
import HowItWorks from "@/components/HowItWorks";
import Newsletter from "@/components/Newsletter";
import TrustStrip from "@/components/TrustStrip";

// The home page is prerendered. Without this it kept the products from build
// time forever; now it refreshes in the background every five minutes.
export const revalidate = 300;

const HomePage = async () => {
  // A slow or unreachable API should not take the home page down with it:
  // the hero and categories still render, the product row just hides.
  const products = await getProducts({ limit: 8 }).catch(() => []);
  const list = Array.isArray(products) ? products : [];

  return (
    <div className="overflow-x-clip">
      <HomeHero products={list} />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedProducts products={list} />
      <HowItWorks />
      <Newsletter />
    </div>
  );
};

export default HomePage;
