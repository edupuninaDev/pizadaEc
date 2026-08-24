import { api } from "../lib/api";
import { Cart } from "../types/cart";

export const CartService = {
  getCart: async (): Promise<Cart> => {
    const { data } = await api.get<Cart>("/cart");
    return data;
  },

  addItem: async (variantId: string, quantity: number) => {
    const { data } = await api.post("/cart/items", {
      variantId,
      quantity,
    });

    return data;
  },

  updateItem: async (itemId: string, quantity: number) => {
    const { data } = await api.patch(`/cart/items/${itemId}`, {
      quantity,
    });

    return data;
  },

  removeItem: async (itemId: string) => {
    const { data } = await api.delete(`/cart/items/${itemId}`);
    return data;
  },
};
