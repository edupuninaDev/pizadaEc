import { api } from "../lib/api";
import { Product } from "../types/product";

export const ProductService = {
  findAll: async (): Promise<Product[]> => {
    const { data } = await api.get<Product[]>("/products");
    return data;
  },

  findBySlug: async (slug: string): Promise<Product> => {
    const { data } = await api.get<Product>(`/products/slug/${slug}`);
    return data;
  },
};
