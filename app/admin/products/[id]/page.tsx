'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/admin/AuthProvider'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'

type ProductData = {
  id: number
  name: string
  slug: string
  description: string
  price: number
  compareAtPrice: number | null
  published: boolean
  featured: boolean
  teelaunchProductId: string | null
  teelaunchVariantId: string | null
  customizationConfig: {
    zones: {
      id: string; label: string; x: number; y: number
      maxWidth: number; maxChars: number; font: string
      fontSize: number; color: string; defaultText: string; uppercase: boolean
    }[]
  }
  images: { id: number; url: string; isBase: boolean }[]
}

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { authHeader } = useAuth()
  const [product, setProduct] = useState<ProductData | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    fetch(`/api/admin/products/${id}`, { headers: authHeader() })
      .then((r) => r.json())
      .then((d) => { setProduct(d.product); setLoading(false) })
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!product) return
    setSaving(true)
    const res = await fetch(`/api/admin/products/${id}`, {
      method: 'PUT',
      headers: { ...authHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    })
    if (res.ok) {
      setMessage('Saved successfully')
      setTimeout(() => setMessage(null), 3000)
    } else {
      setMessage('Save failed')
    }
    setSaving(false)
  }

  const uploadImage = async (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('type', 'products')
    const res = await fetch('/api/admin/upload', { method: 'POST', headers: authHeader(), body: fd })
    const data = await res.json()
    if (data.url && product) {
      setProduct((p) => p ? ({
        ...p,
        images: [...p.images, { id: Date.now(), url: data.url, isBase: p.images.length === 0 }]
      }) : p)
    }
  }

  const updateZone = (idx: number, key: string, val: string | number | boolean) => {
    setProduct((p) => {
      if (!p) return p
      const zones = [...p.customizationConfig.zones]
      zones[idx] = { ...zones[idx], [key]: val }
      return { ...p, customizationConfig: { zones } }
    })
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-yellow" /></div>
  if (!product) return <div className="p-8 text-brand-steel">Product not found</div>

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => router.push('/admin/products')} className="text-brand-steel hover:text-white transition-colors">← Back</button>
        <h1 className="text-2xl font-black text-white">EDIT PRODUCT</h1>
        <div className="ml-auto flex items-center gap-3">
          {message && <span className="text-sm text-green-400">{message}</span>}
          <Button onClick={save} loading={saving}>Save changes</Button>
        </div>
      </div>

      <div className="flex flex-col gap-8">
        {/* Basic info */}
        <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
          <h2 className="font-bold text-white mb-4">PRODUCT INFO</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={product.name} onChange={(e) => setProduct({ ...product, name: e.target.value })} />
            <Input label="Slug" value={product.slug} onChange={(e) => setProduct({ ...product, slug: e.target.value })} />
            <Input label="Price (cents)" type="number" value={product.price} onChange={(e) => setProduct({ ...product, price: parseInt(e.target.value) })} helper="e.g. 4999 = $49.99" />
            <Input label="Compare At Price (cents)" type="number" value={product.compareAtPrice ?? ''} onChange={(e) => setProduct({ ...product, compareAtPrice: e.target.value ? parseInt(e.target.value) : null })} />
            <div className="sm:col-span-2">
              <label className="text-sm font-semibold text-brand-steel-light tracking-wider uppercase block mb-1">Description</label>
              <textarea
                value={product.description}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                rows={3}
                className="w-full rounded bg-brand-black border border-brand-steel-dark px-4 py-2.5 text-white focus:outline-none focus:border-brand-yellow"
              />
            </div>
          </div>

          <div className="flex gap-6 mt-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={product.published} onChange={(e) => setProduct({ ...product, published: e.target.checked })} className="accent-brand-yellow" />
              <span className="text-white text-sm">Published</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={product.featured} onChange={(e) => setProduct({ ...product, featured: e.target.checked })} className="accent-brand-yellow" />
              <span className="text-white text-sm">Featured</span>
            </label>
          </div>
        </section>

        {/* Customization zones */}
        <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
          <h2 className="font-bold text-white mb-4">TEXT ZONES (CANVAS CONFIG)</h2>
          {product.customizationConfig.zones.map((zone, idx) => (
            <div key={zone.id} className="border border-brand-steel-dark rounded p-4 mb-4">
              <h3 className="font-bold text-brand-yellow mb-3">Zone: {zone.id}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                <Input label="Label" value={zone.label} onChange={(e) => updateZone(idx, 'label', e.target.value)} />
                <Input label="X position" type="number" value={zone.x} onChange={(e) => updateZone(idx, 'x', parseInt(e.target.value))} />
                <Input label="Y position" type="number" value={zone.y} onChange={(e) => updateZone(idx, 'y', parseInt(e.target.value))} />
                <Input label="Max width (px)" type="number" value={zone.maxWidth} onChange={(e) => updateZone(idx, 'maxWidth', parseInt(e.target.value))} />
                <Input label="Max chars" type="number" value={zone.maxChars} onChange={(e) => updateZone(idx, 'maxChars', parseInt(e.target.value))} />
                <Input label="Font size" type="number" value={zone.fontSize} onChange={(e) => updateZone(idx, 'fontSize', parseInt(e.target.value))} />
                <Input label="Color" value={zone.color} onChange={(e) => updateZone(idx, 'color', e.target.value)} />
                <Input label="Default text" value={zone.defaultText} onChange={(e) => updateZone(idx, 'defaultText', e.target.value)} />
              </div>
            </div>
          ))}
        </section>

        {/* Teelaunch */}
        <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
          <h2 className="font-bold text-white mb-4">TEELAUNCH</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Teelaunch Product ID" value={product.teelaunchProductId ?? ''} onChange={(e) => setProduct({ ...product, teelaunchProductId: e.target.value })} />
            <Input label="Teelaunch Variant ID" value={product.teelaunchVariantId ?? ''} onChange={(e) => setProduct({ ...product, teelaunchVariantId: e.target.value })} />
          </div>
        </section>

        {/* Images */}
        <section className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6">
          <h2 className="font-bold text-white mb-4">IMAGES</h2>
          <div className="flex flex-wrap gap-4 mb-4">
            {product.images.map((img) => (
              <div key={img.id} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-24 h-24 object-cover rounded border border-brand-steel-dark" />
                {img.isBase && (
                  <span className="absolute bottom-1 left-1 bg-brand-yellow text-brand-black text-xs px-1 rounded">BASE</span>
                )}
              </div>
            ))}
          </div>
          <label className="cursor-pointer inline-flex items-center gap-2 border border-dashed border-brand-steel-dark rounded px-4 py-3 text-brand-steel hover:border-brand-yellow hover:text-brand-yellow transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Upload image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) uploadImage(file)
            }} />
          </label>
        </section>
      </div>
    </div>
  )
}
