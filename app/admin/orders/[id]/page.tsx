'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/admin/AuthProvider'
import { Badge, orderStatusVariant } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/cart-store'
import { OrderStatus } from '@prisma/client'

type OrderDetail = {
  id: number
  orderNumber: string
  status: string
  customerName: string
  customerEmail: string
  customerPhone: string | null
  shippingName: string
  shippingLine1: string
  shippingLine2: string | null
  shippingCity: string
  shippingState: string
  shippingZip: string
  shippingCountry: string
  subtotal: number
  shippingCost: number
  total: number
  stripePaymentIntentId: string | null
  teelaunchOrderId: string | null
  trackingNumber: string | null
  trackingCarrier: string | null
  trackingUrl: string | null
  notes: string | null
  createdAt: string
  items: {
    id: number
    productName: string
    quantity: number
    unitPrice: number
    customizationData: { zones: { id: string; text: string }[] }
    previewImageUrl: string | null
  }[]
  statusHistory: {
    id: number
    status: string
    note: string | null
    createdBy: string | null
    createdAt: string
  }[]
}

const NEXT_STATUSES: Record<string, string[]> = {
  PAID: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['FILE_GENERATED', 'PAID'],
  FILE_GENERATED: ['SUBMITTED_TO_PRINT', 'PROCESSING'],
  SUBMITTED_TO_PRINT: ['IN_PRODUCTION'],
  IN_PRODUCTION: ['SHIPPED'],
  SHIPPED: ['DELIVERED'],
  DELIVERED: [],
  CANCELLED: ['REFUNDED'],
  REFUNDED: [],
}

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { authHeader } = useAuth()
  const [order, setOrder] = useState<OrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = () => {
    setLoading(true)
    fetch(`/api/admin/orders/${id}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setOrder(d.order); setLoading(false) })
  }

  useEffect(() => { load() }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const updateStatus = async (newStatus: string) => {
    setUpdating(true)
    await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    })
    load()
    setUpdating(false)
  }

  const retryProcessing = async () => {
    setUpdating(true)
    await fetch(`/api/admin/orders/${id}/retry`, { method: 'POST', headers: authHeader() })
    setTimeout(load, 2000)
    setUpdating(false)
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow" /></div>
  if (!order) return <div className="p-8 text-brand-steel">Order not found</div>

  const nextStatuses = NEXT_STATUSES[order.status] ?? []

  return (
    <div className="p-8 max-w-5xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/admin/orders')} className="text-brand-steel hover:text-white transition-colors">← Back</button>
        <div>
          <h1 className="text-2xl font-black text-white">{order.orderNumber}</h1>
          <div className="flex items-center gap-3 mt-1">
            <Badge variant={orderStatusVariant(order.status)}>{order.status.replace(/_/g, ' ')}</Badge>
            <span className="text-brand-steel text-sm">{new Date(order.createdAt).toLocaleString()}</span>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-2 flex-wrap">
          {nextStatuses.map((s) => (
            <Button key={s} variant="secondary" size="sm" loading={updating} onClick={() => updateStatus(s)}>
              → {s.replace(/_/g, ' ')}
            </Button>
          ))}
          {['PAID', 'PROCESSING', 'FILE_GENERATED'].includes(order.status) && (
            <Button variant="ghost" size="sm" loading={updating} onClick={retryProcessing}>
              Retry automation
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Timeline */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Items */}
          <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
            <h2 className="font-bold text-white mb-4">ORDER ITEMS</h2>
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-4 mb-4 last:mb-0">
                {item.previewImageUrl?.startsWith('data:') || item.previewImageUrl?.startsWith('/') ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.previewImageUrl} alt={item.productName} className="w-20 h-20 object-cover rounded" />
                ) : (
                  <div className="w-20 h-20 bg-brand-black rounded" />
                )}
                <div>
                  <p className="font-bold text-white">{item.productName}</p>
                  {item.customizationData.zones.map((z) => (
                    <p key={z.id} className="text-brand-yellow font-bold tracking-widest text-sm">{z.text}</p>
                  ))}
                  <p className="text-brand-steel text-sm">Qty: {item.quantity} × {formatPrice(item.unitPrice)}</p>
                </div>
              </div>
            ))}
            <div className="border-t border-brand-steel-dark pt-4 flex flex-col gap-1 text-sm">
              <div className="flex justify-between">
                <span className="text-brand-steel">Subtotal</span>
                <span className="text-white">{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-brand-steel">Shipping</span>
                <span className="text-white">{formatPrice(order.shippingCost)}</span>
              </div>
              <div className="flex justify-between font-bold text-base">
                <span className="text-white">Total</span>
                <span className="text-brand-yellow">{formatPrice(order.total)}</span>
              </div>
            </div>
          </section>

          {/* Status timeline */}
          <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
            <h2 className="font-bold text-white mb-4">STATUS HISTORY</h2>
            <div className="flex flex-col gap-3">
              {order.statusHistory.map((event) => (
                <div key={event.id} className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-brand-yellow mt-2 flex-shrink-0" />
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant={orderStatusVariant(event.status)} className="text-xs">
                        {event.status.replace(/_/g, ' ')}
                      </Badge>
                      <span className="text-brand-steel text-xs">{event.createdBy}</span>
                    </div>
                    {event.note && <p className="text-brand-steel text-sm mt-0.5">{event.note}</p>}
                    <p className="text-brand-steel text-xs">{new Date(event.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right: Customer + Shipping + IDs */}
        <div className="flex flex-col gap-6">
          <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
            <h2 className="font-bold text-white mb-4">CUSTOMER</h2>
            <p className="text-white font-bold">{order.customerName}</p>
            <p className="text-brand-steel text-sm">{order.customerEmail}</p>
            {order.customerPhone && <p className="text-brand-steel text-sm">{order.customerPhone}</p>}
          </section>

          <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
            <h2 className="font-bold text-white mb-4">SHIPPING</h2>
            <p className="text-white">{order.shippingName}</p>
            <p className="text-brand-steel text-sm">{order.shippingLine1}</p>
            {order.shippingLine2 && <p className="text-brand-steel text-sm">{order.shippingLine2}</p>}
            <p className="text-brand-steel text-sm">{order.shippingCity}, {order.shippingState} {order.shippingZip}</p>
            <p className="text-brand-steel text-sm">{order.shippingCountry}</p>
          </section>

          <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
            <h2 className="font-bold text-white mb-4">PRODUCTION</h2>
            <div className="flex flex-col gap-2 text-sm">
              <div>
                <p className="text-brand-steel">Stripe PI</p>
                <p className="text-white font-mono text-xs break-all">{order.stripePaymentIntentId ?? '—'}</p>
              </div>
              <div>
                <p className="text-brand-steel">Teelaunch Order</p>
                <p className="text-white">{order.teelaunchOrderId ?? '—'}</p>
              </div>
              {order.trackingNumber && (
                <div>
                  <p className="text-brand-steel">Tracking</p>
                  <p className="text-brand-yellow font-bold">{order.trackingNumber}</p>
                  {order.trackingCarrier && <p className="text-brand-steel text-xs">{order.trackingCarrier}</p>}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
