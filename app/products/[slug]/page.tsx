import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { StoreHeader } from '@/components/store/StoreHeader'
import { CustomizerPanel } from '@/components/store/CustomizerPanel'
import { CustomizationConfigSchema } from '@/lib/validations'
import { formatPrice } from '@/lib/cart-store'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({ where: { slug, published: true } })
  if (!product) return {}
  return {
    title: `${product.name} — FORGE Metal Shop`,
    description: product.description,
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug, published: true },
    include: { images: { orderBy: { sortOrder: 'asc' } }, category: true },
  })

  if (!product) notFound()

  const configParsed = CustomizationConfigSchema.safeParse(product.customizationConfig)
  if (!configParsed.success) {
    throw new Error(`Invalid customization config for product ${product.slug}`)
  }

  const baseImage = product.images.find((i) => i.isBase) ?? product.images[0]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
  const backgroundImageUrl = baseImage
    ? `${baseUrl}${baseImage.url}`
    : '/placeholder/product-bg.jpg'

  return (
    <div className="min-h-screen">
      <StoreHeader />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* Breadcrumb */}
        <nav className="text-sm text-brand-steel mb-8 flex items-center gap-2">
          <a href="/" className="hover:text-brand-yellow transition-colors">Home</a>
          <span>/</span>
          {product.category && (
            <>
              <a href={`/?category=${product.category.slug}`} className="hover:text-brand-yellow transition-colors">
                {product.category.name}
              </a>
              <span>/</span>
            </>
          )}
          <span className="text-white">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Left: Customizer + Preview (canvas renders here) */}
          <div>
            <CustomizerPanel
              productId={product.id}
              productSlug={product.slug}
              productName={product.name}
              price={product.price}
              compareAtPrice={product.compareAtPrice}
              backgroundImageUrl={backgroundImageUrl}
              config={configParsed.data}
            />
          </div>

          {/* Right: Product info */}
          <div className="flex flex-col gap-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white leading-tight mb-3">
                {product.name}
              </h1>
              {product.description && (
                <p className="text-brand-steel text-lg leading-relaxed">{product.description}</p>
              )}
            </div>

            {/* Features */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: '⚡', label: 'Ships in 5–7 days' },
                { icon: '🔩', label: 'Laser-cut steel' },
                { icon: '🎨', label: 'Powder-coated finish' },
                { icon: '📏', label: 'Custom dimensions' },
              ].map((f) => (
                <div key={f.label} className="flex items-center gap-3 bg-brand-charcoal rounded-lg p-4 border border-brand-steel-dark">
                  <span className="text-2xl">{f.icon}</span>
                  <span className="text-sm font-medium text-white">{f.label}</span>
                </div>
              ))}
            </div>

            {/* Guarantee */}
            <div className="bg-brand-yellow/10 border border-brand-yellow/20 rounded-lg p-5">
              <h3 className="font-bold text-brand-yellow mb-2 tracking-wide">LIFETIME GUARANTEE</h3>
              <p className="text-brand-steel text-sm">
                Every piece is built to last. If it rusts, bends, or fades — we replace it. No questions asked.
              </p>
            </div>

            {/* Gallery thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-3 flex-wrap">
                {product.images.map((img) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={img.id}
                    src={`${baseUrl}${img.url}`}
                    alt={img.altText || product.name}
                    className="w-20 h-20 object-cover rounded border border-brand-steel-dark hover:border-brand-yellow transition-colors cursor-pointer"
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
