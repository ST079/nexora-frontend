"use client";

import ErrorView from "@/components/ErrorView";
import { PRODUCTS_ROUTE } from "@/constants/routes";

const ProductError = ({ error, unstable_retry, reset }) => (
  <ErrorView
    error={error}
    retry={unstable_retry ?? reset}
    title="We couldn't load this product"
    description="The product details didn't come through. Check your connection and try again."
    backHref={PRODUCTS_ROUTE}
    backLabel="Browse products"
  />
);

export default ProductError;
