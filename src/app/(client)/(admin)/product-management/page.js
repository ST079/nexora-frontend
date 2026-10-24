import { Suspense } from "react";
import ProductDashboard from "./_components/ProductDashboard";
import Loader from "@/components/Loader";

export const metadata = { title: "Product management" };

// The dashboard reads the signed-in user, so counts are fetched client-side
// (a server fetch here has no token and always counted the whole catalog).
const ProductManagementPage = () => (
  <Suspense fallback={<Loader label="Loading products" />}>
    <ProductDashboard />
  </Suspense>
);

export default ProductManagementPage;
