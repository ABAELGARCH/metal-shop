import Link from 'next/link'
import { formatPrice } from '@/lib/cart-store'

interface ProductCardProps {
  name: string
  slug: string
  price: number
  compareAtPrice?: number | null
  imageUrl?: string
  featured?: boolean
}

export function ProductCard({ name, slug, price, compareAtPrice, imageUrl, featured }: ProductCardProps) {
  return (
    <Link
      href={`/products/${slug}`}
      className="group block bg-brand-charcoal border border-brand-steel-dark rounded-lg overflow-hidden
        hover:border-brand-yellow transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-brand-yellow/10"
    >
      {/* Image */}
      <div className="aspect-[4/3] bg-brand-black overflow-hidden relative">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-brand-steel opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
        {featured && (
          <div className="absolute top-2 left-2 bg-brand-yellow text-brand-black text-xs font-bold px-2 py-0.5 rounded uppercase tracking-wider">
            Featured
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-bold text-white group-hover:text-brand-yellow transition-colors leading-tight">
          {name}
        </h3>
        <div className="flex items-baseline gap-2 mt-2">
          <span className="text-brand-yellow font-bold text-lg">{formatPrice(price)}</span>
          {compareAtPrice && (
            <span className="text-brand-steel text-sm line-through">{formatPrice(compareAtPrice)}</span>
          )}
        </div>
        <p className="text-brand-steel text-sm mt-1">Personalized · Laser-cut steel</p>
      </div>
    </Link>
  )
}
