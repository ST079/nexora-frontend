import { config } from "@/config/config";
import axios from "axios";
import React from "react";

const fetchById = async (id) => {
  const response = await axios.get(`${config.apiUrl}/api/v1/products/${id}`);
  return response.data.productDetails;
};

export const generateMetadata = async ({ params }) => {
  const id = (await params).id;
  const product = await fetchById(id);
  console.log(product.name);
  return {
    title: product?.name ?? config.appName,
  };
};

const ProductDetailPage = async ({ params, searchParams }) => {
  const id = (await params).id;
  const query = await searchParams;

  const product = await fetchById(id);

  return (
    <section className="container-page">
      
      <div className="container mx-auto px-6">
        {product.name}, {product.brand}, {product.category}, {product.price}
      </div>
    </section>
  );
};

export default ProductDetailPage;
