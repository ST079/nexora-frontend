import { config } from "@/config/config";
import {
  DEFAULT_BRAND,
  DEFAULT_CATEGORY,
  DEFAULT_MAX_Price,
  DEFAULT_MIN_Price,
  DEFAULT_SORT,
} from "@/constants/defaults";
import axios from "axios";

export const getProducts = async (searchParams) => {
  const sort = (await searchParams)?.sort ?? DEFAULT_SORT;
  const min = (await searchParams)?.min ?? DEFAULT_MIN_Price;
  const max = (await searchParams)?.max ?? DEFAULT_MAX_Price;
  const category = (await searchParams)?.category ?? DEFAULT_CATEGORY;
  const brand =(await searchParams)?.brands ?? DEFAULT_BRAND;

  const response = await axios.get(
    `${config.apiUrl}/api/v1/products?sort=${sort}&min=${min}&max=${max}&category=${category}&brands=${brand}`,
  );

  return response.data;
};
