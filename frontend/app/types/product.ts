export type ProductImage = {
  id: string;
  imageUrl: string;
  isMain: boolean;
};

export type ProductVariant = {
  id: string;
  sku: string;
  price: string | null;
  stock: number;
  isActive: boolean;
  size: {
    id: string;
    value: string;
  };
  color: {
    id: string;
    name: string;
    hexCode: string | null;
  };
};

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  brand: string | null;
  basePrice: string;
  gender: string | null;
  isFeatured: boolean;
  isActive: boolean;
  images: ProductImage[];
  variants: ProductVariant[];
  category?: {
    id: string;
    name: string;
  };
};
