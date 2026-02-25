'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/admin/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

function slugify(str: string) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

export default function NewProductPage() {
  const router = useRouter()
  const { authHeader } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    price: 4999,
    compareAtPrice: '',
    published: false,
    featured: false,
    customizationConfig: {
      zones: [
        {
          id: 'line1',
          label: 'Your Text',
          x: 600,
          y: 400,
          maxWidth: 700,
          maxChars: 20,
          font: 'Impact',
          fontSize: 80,
          color: '#F5A623',
          defaultText: 'YOUR TEXT',
          uppercase: true,
        },
      ],
    },
  })

  const set = (k: string, v: unknown) => setForm((f) => ({ ...f, [k]: v }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const body = {
      ...form,
      price: Number(form.price),
      compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
    }

    const res = await fetch('/api/admin/products', {
      method: 'POST',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })

    if (res.ok) {
      const data = await res.json()
      router.push(`/admin/products/${data.product.id}`)
    } else {
      const data = await res.json()
      setError(JSON.stringify(data.error))
      setSaving(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/admin/products')} className="text-brand-steel hover:text-white transition-colors">← Back</button>
        <h1 className="text-2xl font-black text-white">NEW PRODUCT</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6 flex flex-col gap-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => {
              set('name', e.target.value)
              if (!form.slug) set('slug', slugify(e.target.value))
            }}
            required
          />
          <Input
            label="Slug"
            value={form.slug}
            onChange={(e) => set('slug', slugify(e.target.value))}
            required
          />
          <Input
            label="Price (cents)"
            type="number"
            value={form.price}
            onChange={(e) => set('price', e.target.value)}
            helper="e.g. 4999 = $49.99"
            required
          />
          <Input
            label="Compare At Price (cents, optional)"
            type="number"
            value={form.compareAtPrice}
            onChange={(e) => set('compareAtPrice', e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-semibold text-brand-steel-light tracking-wider uppercase block mb-1">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => set('description', e.target.value)}
            rows={3}
            className="w-full rounded bg-brand-black border border-brand-steel-dark px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
          />
        </div>

        <div className="flex gap-6">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.published} onChange={(e) => set('published', e.target.checked)} className="accent-brand-yellow" />
            <span className="text-white text-sm">Publish immediately</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.featured} onChange={(e) => set('featured', e.target.checked)} className="accent-brand-yellow" />
            <span className="text-white text-sm">Featured</span>
          </label>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <Button type="submit" loading={saving} className="w-full tracking-widest">
          CREATE PRODUCT
        </Button>
      </form>
    </div>
  )
}
