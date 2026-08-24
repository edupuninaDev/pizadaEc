import { Product } from "@/app/types/product";
import Link from "next/link";

type Props = {
    product: Product;
};

export function ProductCard({ product }: Props) {
    const mainImage =
        product.images?.find((img) => img.isMain)?.imageUrl ??
        product.images?.[0]?.imageUrl;

    return (
        <Link href={`/producto/${product.slug}`} >
            <article className="rounded-2xl bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md">
                <div className="mb-4 flex h-52 items-center justify-center overflow-hidden rounded-xl bg-neutral-200">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={product.name}
                            className="h-full w-full object-cover"
                        />
                    ) : (
                        <span className="text-sm text-neutral-500">Sin imagen</span>
                    )}
                </div>

                <p className="text-xs uppercase tracking-wide text-neutral-400">
                    {product.category?.name}
                </p>

                <h2 className="mt-1 font-semibold">{product.name}</h2>

                <p className="mt-2 font-bold">${product.basePrice}</p>
            </article>
        </Link>
    );
}