"use client";

import { create } from "zustand";

type CartStore = {
  count: number;

  setCount: (count: number) => void;

  increment: () => void;

  decrement: () => void;
};

export const useCartStore = create<CartStore>((set) => ({
  count: 0,

  setCount: (count) => set({ count }),

  increment: () =>
    set((state) => ({
      count: state.count + 1,
    })),

  decrement: () =>
    set((state) => ({
      count: Math.max(state.count - 1, 0),
    })),
}));
