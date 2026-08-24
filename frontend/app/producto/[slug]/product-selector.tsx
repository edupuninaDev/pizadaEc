'use client';

import { CartService } from '@/app/services/cart.service';
import { useCartStore } from '@/app/store/cart.store';
import { Product } from '@/app/types/product';
import { useMemo, useState } from 'react';

type Props = {
    product: Product;
};

export function ProductSelector({ product }: Props) {
    const increment = useCartStore(
        (state) => state.increment,
    );

    const [loading, setLoading] = useState(false);

    const [selectedVariantId, setSelectedVariantId] = useState(
        product.variants[0]?.id,
    );

    const selectedVariant = useMemo(
        () =>
            product.variants.find(
                (variant) => variant.id === selectedVariantId,
            ),
        [product.variants, selectedVariantId],
    );

    const addToCart = async () => {
        if (!selectedVariant) return;

        try {
            setLoading(true);
            await CartService.addItem(selectedVariant.id, 1);
            increment();
            alert('Producto agregado');
        } catch (error) {
            alert('Debes iniciar sesión para agregar productos al carrito');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="mb-2 font-semibold">Variantes</h3>

                <div className="flex flex-wrap gap-3">
                    {product.variants.map((variant) => (
                        <button
                            key={variant.id}
                            onClick={() => setSelectedVariantId(variant.id)}
                            className={`rounded-xl border px-4 py-2 transition ${selectedVariantId === variant.id
                                ? 'border-black bg-black text-white'
                                : 'border-neutral-300 bg-white'
                                }`}
                        >
                            {variant.size.value} · {variant.color.name}
                        </button>
                    ))}
                </div>
            </div>

            {selectedVariant && (
                <div className="rounded-xl border bg-white p-4">
                    <p>
                        <strong>SKU:</strong> {selectedVariant.sku}
                    </p>

                    <p>
                        <strong>Stock:</strong> {selectedVariant.stock}
                    </p>

                    <p>
                        <strong>Precio:</strong> $
                        {selectedVariant.price ?? product.basePrice}
                    </p>
                </div>
            )}

            <button
                onClick={addToCart}
                disabled={loading}
                className="w-full rounded-xl bg-black px-6 py-4 font-semibold text-white"
            >
                {loading ? 'Agregando...' : 'Agregar al carrito'}
            </button>
        </div>
    );
}