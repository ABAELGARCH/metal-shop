'use client'
import Link from 'next/link'
import { useState } from 'react'
import { useCart } from '@/lib/cart-store'
import { CartDrawer } from './CartDrawer'

export function StoreHeader() {
  const count = useCart((s) => s.count())
  const [cartOpen, setCartOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 bg-brand-black/95 backdrop-blur border-b border-brand-steel-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 bg-brand-yellow rounded flex items-center justify-center group-hover:scale-110 transition-transform">
              <span className="text-brand-black font-black text-base leading-none">F</span>
            </div>
            <div>
              <span className="font-black text-white tracking-widest text-lg">FORGE</span>
              <span className="text-brand-steel text-xs block -mt-1 tracking-wider">METAL SHOP</span>
            </div>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-brand-steel hover:text-white transition-colors text-sm font-medium tracking-wide">
              Shop
            </Link>
            <Link href="/?category=metal-signs" className="text-brand-steel hover:text-white transition-colors text-sm font-medium tracking-wide">
              Metal Signs
            </Link>
            <Link href="/?category=wall-art" className="text-brand-steel hover:text-white transition-colors text-sm font-medium tracking-wide">
              Wall Art
            </Link>
          </nav>

          {/* Cart */}
          <button
            onClick={() => setCartOpen(true)}
            className="relative flex items-center gap-2 text-brand-steel hover:text-white transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-brand-yellow text-brand-black text-xs font-bold rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </button>
        </div>
      </header>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  )
}
