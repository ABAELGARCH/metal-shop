'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/admin/AuthProvider'
import { formatPrice } from '@/lib/cart-store'
import { Badge, orderStatusVariant } from '@/components/ui/Badge'

type DashboardData = {
  totalOrders: number
  monthOrders: number
  pendingOrders: number
  totalRevenue: number
  monthRevenue: number
  productCount: number
  recentOrders: {
    id: number
    orderNumber: string
    customerName: string
    status: string
    total: number
    createdAt: string
  }[]
}

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
      <p className="text-brand-steel text-sm font-semibold tracking-wider uppercase mb-1">{label}</p>
      <p className="text-3xl font-black text-white">{value}</p>
      {sub && <p className="text-brand-steel text-sm mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const { authHeader } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/admin/dashboard', { headers: authHeader() })
      .then((r) => r.json())
      .then(setData)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow" />
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">DASHBOARD</h1>
          <p className="text-brand-steel text-sm">Overview of your store</p>
        </div>
        <Link
          href="/"
          target="_blank"
          className="text-brand-steel hover:text-brand-yellow text-sm transition-colors"
        >
          View store →
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Revenue" value={formatPrice(data.totalRevenue)} />
        <StatCard label="This Month" value={formatPrice(data.monthRevenue)} sub={`${data.monthOrders} orders`} />
        <StatCard label="Pending Orders" value={String(data.pendingOrders)} sub="Need attention" />
        <StatCard label="Active Products" value={String(data.productCount)} />
      </div>

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-white">RECENT ORDERS</h2>
          <Link href="/admin/orders" className="text-brand-yellow text-sm hover:underline">
            View all →
          </Link>
        </div>

        <div className="rounded-lg border border-brand-steel-dark overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-charcoal border-b border-brand-steel-dark">
              <tr>
                {['Order', 'Customer', 'Status', 'Total', 'Date'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-brand-steel-light font-semibold tracking-wider uppercase text-xs">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-steel-dark/50">
              {data.recentOrders.map((order) => (
                <tr key={order.id} className="hover:bg-brand-charcoal/50 transition-colors">
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="text-brand-yellow font-bold hover:underline">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-white">{order.customerName}</td>
                  <td className="px-4 py-3">
                    <Badge variant={orderStatusVariant(order.status)}>
                      {order.status.replace(/_/g, ' ')}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-white font-bold">{formatPrice(order.total)}</td>
                  <td className="px-4 py-3 text-brand-steel">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
