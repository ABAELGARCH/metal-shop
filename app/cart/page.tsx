'use client'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useCart, formatPrice } from '@/lib/cart-store'
import { StoreHeader } from '@/components/store/StoreHeader'
import { Button } from '@/components/ui/Button'

export default function CartPage() {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, count } = useCart()

  if (count() === 0) {
    return (
      <div className="min-h-screen">
        <StoreHeader />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-24 text-center">
          <h1 className="text-4xl font-black text-white mb-4">YOUR CART IS EMPTY</h1>
          <p className="text-brand-steel mb-8">Time to craft something legendary.</p>
          <Link href="/">
            <Button>SHOP NOW</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <StoreHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black text-white mb-8">YOUR CART</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-6 bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6"
              >
                {item.previewBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewBase64} alt={item.productName}
                    className="w-28 h-28 object-cover rounded flex-shrink-0" />
                ) : (
                  <div className="w-28 h-28 bg-brand-black rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-brand-steel text-sm">No preview</span>
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold text-white text-lg">{item.productName}</h3>
                  {item.customizationData.zones.map((z) => (
                    <p key={z.id} className="text-brand-yellow font-bold tracking-widest">
                      {z.text}
                    </p>
                  ))}

                  <div className="flex items-center justify-between mt-4">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-8 h-8 rounded border border-brand-steel-dark text-white hover:border-brand-yellow transition-colors"
                      >−</button>
                      <span className="text-white w-8 text-center font-bold">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-8 h-8 rounded border border-brand-steel-dark text-white hover:border-brand-yellow transition-colors"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-brand-yellow text-xl">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-brand-steel hover:text-red-400 transition-colors text-sm"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6 h-fit">
            <h2 className="font-bold text-white text-xl mb-6">ORDER SUMMARY</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-steel">Subtotal ({count()} items)</span>
                <span className="text-white">{formatPrice(total())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-steel">Shipping</span>
                <span className="text-white">Calculated at checkout</span>
              </div>
              <div className="border-t border-brand-steel-dark pt-3 flex justify-between font-bold text-lg">
                <span className="text-white">Estimated Total</span>
                <span className="text-brand-yellow">{formatPrice(total())}</span>
              </div>
            </div>
            <Button
              className="w-full mt-6 tracking-widest"
              size="lg"
              onClick={() => router.push('/checkout')}
            >
              CHECKOUT
            </Button>
            <Link href="/" className="block text-center mt-4 text-brand-steel hover:text-white text-sm transition-colors">
              ← Continue shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
