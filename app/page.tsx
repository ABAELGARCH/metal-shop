import { prisma } from '@/lib/prisma'
import { StoreHeader } from '@/components/store/StoreHeader'
import { ProductCard } from '@/components/store/ProductCard'

export const dynamic = 'force-dynamic'

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; search?: string }>
}) {
  const { category, search } = await searchParams

  const products = await prisma.product.findMany({
    where: {
      published: true,
      ...(category && { category: { slug: category } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      }),
    },
    include: {
      images: { orderBy: { sortOrder: 'asc' }, take: 1 },
    },
    orderBy: [{ featured: 'desc' }, { sortOrder: 'asc' }],
  })

  const featured = products.filter((p) => p.featured)

  return (
    <div className="min-h-screen">
      <StoreHeader />

      {/* Hero */}
      <section className="relative bg-brand-charcoal border-b border-brand-steel-dark">
        <div className="absolute inset-0 opacity-5"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #F5A623 0px, #F5A623 1px, transparent 0px, transparent 50%)' ,
            backgroundSize: '20px 20px' }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <div className="inline-block bg-brand-yellow/10 border border-brand-yellow/30 text-brand-yellow text-xs font-bold tracking-widest px-4 py-2 rounded uppercase mb-6">
            Laser-Cut Steel · Made to Order
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-white leading-none mb-4 tracking-tight">
            CUT FROM STEEL.<br />
            <span className="text-brand-yellow">BUILT TO LAST.</span>
          </h1>
          <p className="text-brand-steel text-xl max-w-2xl mx-auto mb-10">
            Custom metal signs personalized with your name, message, or date.
            Powder-coated finish. Ships in 5–7 business days.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-bold text-white mb-8 tracking-wide">
          {search ? `Results for "${search}"` : category ? 'Collection' : 'All Products'}
        </h2>

        {products.length === 0 ? (
          <div className="text-center py-24 text-brand-steel">
            <p className="text-xl">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                name={product.name}
                slug={product.slug}
                price={product.price}
                compareAtPrice={product.compareAtPrice}
                imageUrl={product.images[0]?.url}
                featured={product.featured}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-brand-steel-dark bg-brand-charcoal mt-16 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-brand-steel text-sm">
          <p className="font-bold text-white mb-2">FORGE METAL SHOP</p>
          <p>Handcrafted metal products. Every piece made to order.</p>
          <p className="mt-4 text-xs">© {new Date().getFullYear()} Forge Metal Shop. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
