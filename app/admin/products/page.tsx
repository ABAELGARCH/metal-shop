'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/admin/AuthProvider'
import { DataTable, Column } from '@/components/admin/DataTable'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { formatPrice } from '@/lib/cart-store'

type Product = {
  id: number
  name: string
  slug: string
  price: number
  published: boolean
  featured: boolean
  images: { url: string }[]
  category: { name: string } | null
  _count: { orderItems: number }
}

export default function AdminProductsPage() {
  const { authHeader } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = (q = '') => {
    setLoading(true)
    fetch(`/api/admin/products?search=${encodeURIComponent(q)}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setProducts(d.products); setLoading(false) })
  }

  useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const columns: Column<Product>[] = [
    {
      key: 'name',
      header: 'Product',
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images[0] ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded" />
          ) : (
            <div className="w-10 h-10 bg-brand-black rounded" />
          )}
          <div>
            <Link href={`/admin/products/${p.id}`} className="font-bold text-white hover:text-brand-yellow transition-colors">
              {p.name}
            </Link>
            <p className="text-brand-steel text-xs">{p.slug}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'category',
      header: 'Category',
      render: (p) => <span className="text-brand-steel">{p.category?.name ?? '—'}</span>,
    },
    {
      key: 'price',
      header: 'Price',
      render: (p) => <span className="font-bold text-brand-yellow">{formatPrice(p.price)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (p) => (
        <Badge variant={p.published ? 'green' : 'grey'}>
          {p.published ? 'Published' : 'Draft'}
        </Badge>
      ),
    },
    {
      key: 'orders',
      header: 'Orders',
      render: (p) => <span className="text-white">{p._count.orderItems}</span>,
    },
    {
      key: 'actions',
      header: '',
      render: (p) => (
        <Link href={`/admin/products/${p.id}`}>
          <Button variant="ghost" size="sm">Edit</Button>
        </Link>
      ),
    },
  ]

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black text-white">PRODUCTS</h1>
          <p className="text-brand-steel text-sm">{products.length} products</p>
        </div>
        <Link href="/admin/products/new">
          <Button>+ New Product</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && load(search)}
          className="bg-brand-charcoal border border-brand-steel-dark rounded px-4 py-2.5 text-white placeholder:text-brand-steel focus:outline-none focus:border-brand-yellow w-72"
        />
        <Button variant="secondary" size="sm" className="ml-2" onClick={() => load(search)}>
          Search
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={products}
        keyExtractor={(p) => p.id}
        loading={loading}
        emptyMessage="No products yet. Create your first product."
      />
    </div>
  )
}
