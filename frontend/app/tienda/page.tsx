import { ProductCard } from "../components/products/product-card";
import { ProductService } from "../services/product.service";

export default async function TiendaPage() {
  const products = await ProductService.findAll();

  return (
    <main className="min-h-screen bg-neutral-50 px-6 py-10">
      <h1 className="mb-8 text-3xl font-bold">Tienda PizadaEc</h1>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>
    </main>
  );
}