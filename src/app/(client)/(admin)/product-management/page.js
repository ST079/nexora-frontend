import React from "react";
import ProductDashboard from "./_components/ProductDashboard";
import { getProducts, getTotalCount } from "@/api/product";
import { PRODUCT_MANAGEMENT_PAGE_SIZE } from "@/constants/pagination";

const ProductManagementPage = async () => {
  const response = await getTotalCount();

  return (
    <>
      <ProductDashboard totalItems={response.totalCount} />
    </>
  );
};

export default ProductManagementPage;
