'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Cart } from '../types/cart';
import { CartService } from '../services/cart.service';

export default function CartPage() {
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);

    const loadCart = async () => {
        try {
            setLoading(true);
            const data = await CartService.getCart();
            setCart(data);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCart();
    }, []);

    const total = useMemo(() => {
        return (
            cart?.items.reduce((sum, item) => {
                const price = Number(item.variant.price ?? item.variant.product.basePrice);
                return sum + price * item.quantity;
            }, 0) ?? 0
        );
    }, [cart]);

    const handleRemove = async (itemId: string) => {
        await CartService.removeItem(itemId);
        await loadCart();
    };

    const handleQuantity = async (itemId: string, quantity: number) => {
        if (quantity < 1) return;

        await CartService.updateItem(itemId, quantity);
        await loadCart();
    };

    if (loading) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-10">
                <p>Cargando carrito...</p>
            </main>
        );
    }

    if (!cart || cart.items.length === 0) {
        return (
            <main className="mx-auto max-w-6xl px-6 py-10">
                <h1 className="text-3xl font-bold">Mi carrito</h1>
                <p className="mt-4 text-neutral-500">Tu carrito está vacío.</p>

                <Link
                    href="/tienda"
                    className="mt-6 inline-block rounded-xl bg-black px-6 py-3 text-white"
                >
                    Ir a la tienda
                </Link>
            </main>
        );
    }

    return (
        <main className="mx-auto max-w-6xl px-6 py-10">
            <h1 className="text-3xl font-bold">Mi carrito</h1>

            <section className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
                <div className="space-y-4">
                    {cart.items.map((item) => {
                        const product = item.variant.product;
                        const image =
                            product.images.find((img) => img.isMain)?.imageUrl ??
                            product.images[0]?.imageUrl;

                        const price = Number(item.variant.price ?? product.basePrice);
                        const subtotal = price * item.quantity;

                        return (
                            <article
                                key={item.id}
                                className="grid gap-4 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[120px_1fr_auto]"
                            >
                                <div className="relative h-28 overflow-hidden rounded-xl bg-neutral-100">
                                    {image && (
                                        <Image
                                            src={image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                        />
                                    )}
                                </div>

                                <div>
                                    <Link
                                        href={`/producto/${product.slug}`}
                                        className="font-semibold hover:underline"
                                    >
                                        {product.name}
                                    </Link>

                                    <p className="mt-1 text-sm text-neutral-500">
                                        Talla {item.variant.size.value} · {item.variant.color.name}
                                    </p>

                                    <p className="mt-2 font-semibold">${price.toFixed(2)}</p>

                                    <div className="mt-4 flex items-center gap-2">
                                        <button
                                            onClick={() => handleQuantity(item.id, item.quantity - 1)}
                                            className="rounded-lg border px-3 py-1"
                                        >
                                            -
                                        </button>

                                        <span className="w-8 text-center">{item.quantity}</span>

                                        <button
                                            onClick={() => handleQuantity(item.id, item.quantity + 1)}
                                            className="rounded-lg border px-3 py-1"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col items-end justify-between">
                                    <p className="font-bold">${subtotal.toFixed(2)}</p>

                                    <button
                                        onClick={() => handleRemove(item.id)}
                                        className="text-sm text-red-600"
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            </article>
                        );
                    })}
                </div>

                <aside className="h-fit rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="text-xl font-bold">Resumen</h2>

                    <div className="mt-4 flex justify-between">
                        <span>Subtotal</span>
                        <strong>${total.toFixed(2)}</strong>
                    </div>

                    <div className="mt-6 border-t pt-4">
                        <div className="flex justify-between text-lg">
                            <span>Total</span>
                            <strong>${total.toFixed(2)}</strong>
                        </div>
                    </div>

                    <button className="mt-6 w-full rounded-xl bg-black px-6 py-3 font-semibold text-white">
                        Finalizar compra
                    </button>
                </aside>
            </section>
        </main>
    );
}