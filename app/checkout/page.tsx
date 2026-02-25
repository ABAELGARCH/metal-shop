'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { useCart, formatPrice } from '@/lib/cart-store'
import { StoreHeader } from '@/components/store/StoreHeader'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({
  clientSecret,
  total,
  shippingCost,
  onSuccess,
}: {
  clientSecret: string
  total: number
  shippingCost: number
  onSuccess: (orderId: number, orderNumber: string) => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const { items, clear } = useCart()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    customerEmail: '',
    customerName: '',
    shippingName: '',
    shippingLine1: '',
    shippingLine2: '',
    shippingCity: '',
    shippingState: '',
    shippingZip: '',
    shippingCountry: 'US',
  })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setLoading(true)
    setError(null)

    // Confirm payment with Stripe
    const { error: stripeError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: window.location.origin + '/checkout/success' },
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setLoading(false)
      return
    }

    if (paymentIntent?.status === 'succeeded') {
      // Create order in DB
      const res = await fetch('/api/checkout/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          paymentIntentId: paymentIntent.id,
          items,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        clear()
        onSuccess(data.orderId, data.orderNumber)
      } else {
        setError('Order creation failed. Please contact support.')
      }
    }

    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Contact */}
      <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
        <h2 className="font-bold text-white text-lg mb-4 tracking-wider">CONTACT</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input label="Full name" value={form.customerName} onChange={set('customerName')} required />
          <Input label="Email" type="email" value={form.customerEmail} onChange={set('customerEmail')} required />
        </div>
      </div>

      {/* Shipping */}
      <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
        <h2 className="font-bold text-white text-lg mb-4 tracking-wider">SHIPPING ADDRESS</h2>
        <div className="flex flex-col gap-4">
          <Input label="Full name" value={form.shippingName} onChange={set('shippingName')} required />
          <Input label="Address line 1" value={form.shippingLine1} onChange={set('shippingLine1')} required />
          <Input label="Address line 2 (optional)" value={form.shippingLine2} onChange={set('shippingLine2')} />
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div className="col-span-2 sm:col-span-1">
              <Input label="City" value={form.shippingCity} onChange={set('shippingCity')} required />
            </div>
            <Input label="State" value={form.shippingState} onChange={set('shippingState')} required />
            <Input label="ZIP code" value={form.shippingZip} onChange={set('shippingZip')} required />
          </div>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
        <h2 className="font-bold text-white text-lg mb-4 tracking-wider">PAYMENT</h2>
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 text-red-400 text-sm">
          {error}
        </div>
      )}

      <Button type="submit" size="lg" loading={loading} className="w-full tracking-widest">
        PAY {formatPrice(total)}
      </Button>
    </form>
  )
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, total } = useCart()
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [pricing, setPricing] = useState({ total: 0, shippingCost: 0 })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (items.length === 0) {
      router.replace('/cart')
      return
    }

    fetch('/api/checkout/intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items, email: '' }),
    })
      .then((r) => r.json())
      .then((data) => {
        setClientSecret(data.clientSecret)
        setPricing({ total: data.total, shippingCost: data.shippingCost })
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSuccess = (orderId: number, orderNumber: string) => {
    router.push(`/checkout/success?orderId=${orderId}&orderNumber=${orderNumber}`)
  }

  return (
    <div className="min-h-screen">
      <StoreHeader />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black text-white mb-8">CHECKOUT</h1>

        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-yellow" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              {clientSecret && (
                <Elements
                  stripe={stripePromise}
                  options={{
                    clientSecret,
                    appearance: {
                      theme: 'night',
                      variables: {
                        colorPrimary: '#F5A623',
                        colorBackground: '#2C2C2C',
                        colorText: '#FFFFFF',
                        colorDanger: '#EF4444',
                        borderRadius: '4px',
                      },
                    },
                  }}
                >
                  <CheckoutForm
                    clientSecret={clientSecret}
                    total={pricing.total}
                    shippingCost={pricing.shippingCost}
                    onSuccess={handleSuccess}
                  />
                </Elements>
              )}
            </div>

            {/* Summary sidebar */}
            <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6 h-fit">
              <h2 className="font-bold text-white text-lg mb-4 tracking-wider">ORDER SUMMARY</h2>
              {items.map((item) => (
                <div key={item.productId} className="flex gap-3 mb-4">
                  {item.previewBase64 ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.previewBase64} alt={item.productName} className="w-14 h-14 object-cover rounded" />
                  ) : (
                    <div className="w-14 h-14 bg-brand-black rounded" />
                  )}
                  <div>
                    <p className="text-white text-sm font-bold">{item.productName}</p>
                    {item.customizationData.zones.map((z) => (
                      <p key={z.id} className="text-brand-yellow text-xs font-bold tracking-wider">{z.text}</p>
                    ))}
                    <p className="text-brand-steel text-sm">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              <div className="border-t border-brand-steel-dark pt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-brand-steel">Subtotal</span>
                  <span className="text-white">{formatPrice(total())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-brand-steel">Shipping</span>
                  <span className="text-white">{formatPrice(pricing.shippingCost)}</span>
                </div>
                <div className="flex justify-between font-bold text-base border-t border-brand-steel-dark pt-2">
                  <span className="text-white">Total</span>
                  <span className="text-brand-yellow">{formatPrice(pricing.total)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
