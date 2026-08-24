export type CartItem = {
  id: string;
  quantity: number;
  variant: {
    id: string;
    price: string | null;
    stock: number;
    size: {
      value: string;
    };
    color: {
      name: string;
      hexCode: string | null;
    };
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: string;
      images: {
        imageUrl: string;
        isMain: boolean;
      }[];
    };
  };
};

export type Cart = {
  id: string;
  userId: string;
  items: CartItem[];
};
