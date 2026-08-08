import { getProducts } from "@/api/product";
import CategoryGrid from "@/components/CategoryGrid";
import FeaturedProducts from "@/components/FeaturedProducts";
import HomeHero from "@/components/HomeHero";
import Newsletter from "@/components/Newsletter";
import TrustStrip from "@/components/TrustStrip";

const HomePage = async () => {
  const products = await getProducts({ limit: 4 });

  return (
    <div className="bg-paper dark:bg-[#0e0f12] transition-colors duration-300">
      <HomeHero />
      <TrustStrip />
      <CategoryGrid />
      <FeaturedProducts products={products} />
      <Newsletter />
    </div>
  );
};

export default HomePage;
