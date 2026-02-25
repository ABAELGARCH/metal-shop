'use client'
import { useRouter } from 'next/navigation'
import { useCart, formatPrice } from '@/lib/cart-store'
import { Button } from '@/components/ui/Button'

interface CartDrawerProps {
  open: boolean
  onClose: () => void
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const router = useRouter()
  const { items, removeItem, updateQuantity, total, count } = useCart()

  const handleCheckout = () => {
    onClose()
    router.push('/checkout')
  }

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 z-40 animate-fade-in"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`
          fixed top-0 right-0 h-full w-full max-w-md bg-brand-charcoal border-l border-brand-steel-dark
          z-50 flex flex-col transition-transform duration-300
          ${open ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-brand-steel-dark">
          <h2 className="text-xl font-bold text-white">
            CART{' '}
            {count() > 0 && (
              <span className="ml-2 bg-brand-yellow text-brand-black text-sm px-2 py-0.5 rounded-full">
                {count()}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-brand-steel hover:text-white transition-colors p-1"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
          {items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-brand-steel gap-4">
              <svg className="w-16 h-16 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-lg">Your cart is empty</p>
              <Button variant="ghost" size="sm" onClick={onClose}>Continue shopping</Button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.productId}
                className="flex gap-4 bg-brand-black rounded-lg p-4 border border-brand-steel-dark"
              >
                {/* Preview thumbnail */}
                {item.previewBase64 ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.previewBase64}
                    alt={item.productName}
                    className="w-20 h-20 object-cover rounded flex-shrink-0"
                  />
                ) : (
                  <div className="w-20 h-20 bg-brand-charcoal rounded flex-shrink-0 flex items-center justify-center">
                    <span className="text-brand-steel text-xs">No preview</span>
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white truncate">{item.productName}</p>
                  {item.customizationData.zones.map((z) => (
                    <p key={z.id} className="text-brand-yellow text-sm font-bold tracking-wider">
                      {z.text}
                    </p>
                  ))}
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        className="w-7 h-7 rounded bg-brand-charcoal border border-brand-steel-dark text-white hover:border-brand-yellow transition-colors"
                      >
                        −
                      </button>
                      <span className="text-white w-6 text-center">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        className="w-7 h-7 rounded bg-brand-charcoal border border-brand-steel-dark text-white hover:border-brand-yellow transition-colors"
                      >
                        +
                      </button>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-brand-yellow">
                        {formatPrice(item.unitPrice * item.quantity)}
                      </span>
                      <button
                        onClick={() => removeItem(item.productId)}
                        className="text-brand-steel hover:text-red-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-brand-steel-dark flex flex-col gap-4">
            <div className="flex justify-between text-lg">
              <span className="text-brand-steel">Subtotal</span>
              <span className="font-bold text-white">{formatPrice(total())}</span>
            </div>
            <Button size="lg" onClick={handleCheckout} className="w-full tracking-widest">
              CHECKOUT
            </Button>
          </div>
        )}
      </div>
    </>
  )
}
