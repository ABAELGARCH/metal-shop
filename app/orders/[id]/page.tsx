'use client'
import { useState } from 'react'
import Link from 'next/link'
import { StoreHeader } from '@/components/store/StoreHeader'
import { Badge, orderStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { formatPrice } from '@/lib/cart-store'

type OrderData = {
  id: number
  orderNumber: string
  status: string
  customerName: string
  total: number
  trackingNumber: string | null
  trackingCarrier: string | null
  trackingUrl: string | null
  createdAt: string
  items: { productName: string; quantity: number; unitPrice: number }[]
  statusHistory: { status: string; createdAt: string; note: string | null }[]
}

const STATUS_STEPS = [
  'PAID', 'PROCESSING', 'FILE_GENERATED', 'SUBMITTED_TO_PRINT',
  'IN_PRODUCTION', 'SHIPPED', 'DELIVERED',
]

export default function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const [email, setEmail] = useState('')
  const [order, setOrder] = useState<OrderData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)

  const lookup = async () => {
    setLoading(true)
    setError(null)

    const resolvedParams = await params
    const res = await fetch(`/api/orders/${resolvedParams.id}?email=${encodeURIComponent(email)}`)
    const data = await res.json()

    if (res.ok) {
      setOrder(data.order)
    } else {
      setError("Order not found. Please check your email address.")
    }
    setSearched(true)
    setLoading(false)
  }

  const currentStepIdx = order ? STATUS_STEPS.indexOf(order.status) : -1

  return (
    <div className="min-h-screen">
      <StoreHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-black text-white mb-2">TRACK YOUR ORDER</h1>
        <p className="text-brand-steel mb-8">Enter your email address to look up your order.</p>

        {!order && (
          <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6 flex flex-col gap-4">
            <Input
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="the email you used at checkout"
            />
            {error && searched && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <Button onClick={lookup} loading={loading}>LOOKUP ORDER</Button>
          </div>
        )}

        {order && (
          <div className="flex flex-col gap-6">
            {/* Header */}
            <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-brand-steel text-sm">Order number</p>
                  <p className="text-2xl font-black text-brand-yellow">{order.orderNumber}</p>
                  <p className="text-white mt-1">{order.customerName}</p>
                  <p className="text-brand-steel text-sm">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <Badge variant={orderStatusVariant(order.status)} className="text-sm">
                  {order.status.replace(/_/g, ' ')}
                </Badge>
              </div>
            </div>

            {/* Progress tracker */}
            <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
              <h2 className="font-bold text-white mb-6">PROGRESS</h2>
              <div className="flex items-center gap-0">
                {STATUS_STEPS.map((step, idx) => {
                  const done = idx <= currentStepIdx
                  const current = idx === currentStepIdx
                  const isLast = idx === STATUS_STEPS.length - 1
                  return (
                    <div key={step} className="flex items-center flex-1 last:flex-none">
                      <div className="flex flex-col items-center">
                        <div className={`
                          w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                          ${done ? 'bg-brand-yellow text-brand-black' : 'bg-brand-charcoal border-2 border-brand-steel-dark text-brand-steel'}
                          ${current ? 'ring-2 ring-brand-yellow ring-offset-2 ring-offset-brand-black' : ''}
                        `}>
                          {done && !current ? '✓' : idx + 1}
                        </div>
                        <p className={`text-xs mt-1 text-center w-16 leading-tight ${done ? 'text-white' : 'text-brand-steel'}`}>
                          {step.replace(/_/g, ' ')}
                        </p>
                      </div>
                      {!isLast && (
                        <div className={`h-0.5 flex-1 mx-1 -mt-5 ${idx < currentStepIdx ? 'bg-brand-yellow' : 'bg-brand-steel-dark'}`} />
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tracking */}
            {order.trackingNumber && (
              <div className="bg-brand-yellow/10 border border-brand-yellow/30 rounded-lg p-5">
                <h2 className="font-bold text-brand-yellow mb-2">SHIPPED!</h2>
                <p className="text-white">Tracking: <span className="font-bold">{order.trackingNumber}</span></p>
                {order.trackingCarrier && <p className="text-brand-steel text-sm">via {order.trackingCarrier}</p>}
                {order.trackingUrl && (
                  <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer"
                    className="inline-block mt-2 text-brand-yellow hover:underline text-sm">
                    Track shipment →
                  </a>
                )}
              </div>
            )}

            {/* Items */}
            <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
              <h2 className="font-bold text-white mb-4">ITEMS</h2>
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between py-2 border-b border-brand-steel-dark last:border-0">
                  <div>
                    <p className="text-white font-bold">{item.productName}</p>
                    <p className="text-brand-steel text-sm">Qty: {item.quantity}</p>
                  </div>
                  <p className="font-bold text-brand-yellow">{formatPrice(item.unitPrice * item.quantity)}</p>
                </div>
              ))}
              <div className="flex justify-between pt-3 font-bold">
                <span className="text-white">Total</span>
                <span className="text-brand-yellow">{formatPrice(order.total)}</span>
              </div>
            </div>

            <Link href="/" className="text-brand-steel hover:text-brand-yellow transition-colors text-sm text-center">
              ← Back to shop
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
