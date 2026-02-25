'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/admin/AuthProvider'
import { DataTable, Column } from '@/components/admin/DataTable'
import { Badge, orderStatusVariant } from '@/components/ui/Badge'
import { formatPrice } from '@/lib/cart-store'

type Order = {
  id: number
  orderNumber: string
  status: string
  customerName: string
  customerEmail: string
  total: number
  createdAt: string
  teelaunchOrderId: string | null
  trackingNumber: string | null
  _count: { items: number }
}

const STATUSES = [
  '', 'PAID', 'PROCESSING', 'FILE_GENERATED', 'SUBMITTED_TO_PRINT',
  'IN_PRODUCTION', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'PAYMENT_FAILED',
]

export default function AdminOrdersPage() {
  const { authHeader } = useAuth()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)

  const load = (s = status, q = search) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (s) params.set('status', s)
    if (q) params.set('search', q)
    fetch(`/api/admin/orders?${params}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setOrders(d.orders); setTotal(d.total); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const columns: Column<Order>[] = [
    {
      key: 'order',
      header: 'Order',
      render: (o) => (
        <Link href={`/admin/orders/${o.id}`} className="font-bold text-brand-yellow hover:underline">
          {o.orderNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: 'Customer',
      render: (o) => (
        <div>
          <p className="text-white">{o.customerName}</p>
          <p className="text-brand-steel text-xs">{o.customerEmail}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => (
        <Badge variant={orderStatusVariant(o.status)}>
          {o.status.replace(/_/g, ' ')}
        </Badge>
      ),
    },
    {
      key: 'total',
      header: 'Total',
      render: (o) => <span className="font-bold text-white">{formatPrice(o.total)}</span>,
    },
    {
      key: 'tracking',
      header: 'Tracking',
      render: (o) => (
        <span className="text-brand-steel text-sm">
          {o.trackingNumber ?? (o.teelaunchOrderId ? 'In production' : '—')}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (o) => (
        <span className="text-brand-steel text-sm">
          {new Date(o.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">ORDERS</h1>
          <p className="text-brand-steel text-sm">{total} orders total</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by order # or customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(status, search)}
          className="bg-brand-charcoal border border-brand-steel-dark rounded px-4 py-2.5 text-white placeholder:text-brand-steel focus:outline-none focus:border-brand-yellow w-72"
        />
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); load(e.target.value, search) }}
          className="bg-brand-charcoal border border-brand-steel-dark rounded px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s || 'All statuses'}</option>
          ))}
        </select>
      </div>

      <DataTable
        columns={columns}
        data={orders}
        keyExtractor={(o) => o.id}
        loading={loading}
        emptyMessage="No orders yet."
      />
    </div>
  )
}
