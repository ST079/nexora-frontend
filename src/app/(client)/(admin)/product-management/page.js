import React from "react";
import ProductDashboard from "./_components/ProductDashboard";
import { getProducts } from "@/api/product";

const ProductManagementPage = async () => {
  const products = await getProducts();
  return (
    <>
      <ProductDashboard allProducts={products} />
    </>
  );
};

export default ProductManagementPage;
