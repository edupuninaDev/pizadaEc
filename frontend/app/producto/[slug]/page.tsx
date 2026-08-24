import { ProductService } from '@/app/services/product.service';
import Image from 'next/image';
import { ProductSelector } from './product-selector';

type Props = {
    params: Promise<{
        slug: string;
    }>;
};

export default async function ProductDetailPage({ params }: Props) {
    const { slug } = await params;

    const product = await ProductService.findBySlug(slug);

    const mainImage =
        product.images.find((img) => img.isMain)?.imageUrl ??
        product.images[0]?.imageUrl;

    return (
        <main className="min-h-screen bg-neutral-50 px-6 py-10">
            <section className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-2">
                <div className="overflow-hidden rounded-3xl bg-white shadow-sm">
                    {mainImage ? (
                        <Image
                            src={mainImage}
                            alt={product.name}
                            width={700}
                            height={700}
                            className="h-[520px] w-full object-cover"
                        />
                    ) : (
                        <div className="flex h-[520px] items-center justify-center text-neutral-500">
                            Sin imagen
                        </div>
                    )}
                </div>

                <div>
                    <p className="text-sm uppercase tracking-wide text-neutral-500">
                        {product.category?.name}
                    </p>

                    <h1 className="mt-2 text-4xl font-bold">{product.name}</h1>
                    <p className="mt-3 text-neutral-600">{product.description}</p>
                    <p className="mt-6 text-3xl font-bold">${product.basePrice}</p>

                    <div className="mt-8">
                        <ProductSelector product={product} />
                    </div>
                </div>

            </section>
        </main >
    );
}