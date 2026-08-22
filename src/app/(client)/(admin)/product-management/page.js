import React from "react";
import ProductDashboard from "./_components/ProductDashboard";
import { getTotalCount } from "@/api/product";

const ProductManagementPage = async () => {
  const response = await getTotalCount();

  return (
    <>
      <ProductDashboard totalItems={response.totalCount} />
    </>
  );
};

export default ProductManagementPage;
