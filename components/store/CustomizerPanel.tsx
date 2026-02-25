'use client'
import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { CustomizationConfig, CustomizationZone } from '@/lib/validations'
import { useCart, formatPrice } from '@/lib/cart-store'
import { Button } from '@/components/ui/Button'
import { TextPreviewCanvas } from '@/components/canvas/TextPreviewCanvas'

interface CustomizerPanelProps {
  productId: number
  productSlug: string
  productName: string
  price: number
  compareAtPrice?: number | null
  backgroundImageUrl: string
  config: CustomizationConfig
}

export function CustomizerPanel({
  productId,
  productSlug,
  productName,
  price,
  compareAtPrice,
  backgroundImageUrl,
  config,
}: CustomizerPanelProps) {
  const router = useRouter()
  const addItem = useCart((s) => s.addItem)
  const [capturePreview, setCapturePreview] = useState<(() => string) | null>(null)

  const initialValues = Object.fromEntries(
    config.zones.map((z) => [z.id, ''])
  )
  const [values, setValues] = useState<Record<string, string>>(initialValues)
  const [added, setAdded] = useState(false)

  const handleChange = useCallback((zoneId: string, raw: string, zone: CustomizationZone) => {
    let text = zone.uppercase ? raw.toUpperCase() : raw
    if (text.length > zone.maxChars) text = text.slice(0, zone.maxChars)
    setValues((prev) => ({ ...prev, [zoneId]: text }))
  }, [])

  const handleAddToCart = () => {
    const preview = capturePreview?.() ?? ''
    addItem({
      productId,
      productSlug,
      productName,
      unitPrice: price,
      quantity: 1,
      customizationData: {
        zones: config.zones.map((z) => ({ id: z.id, text: values[z.id] || z.defaultText })),
      },
      previewBase64: preview,
    })
    setAdded(true)
    setTimeout(() => {
      router.push('/cart')
    }, 800)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live preview */}
      <TextPreviewCanvas
        backgroundUrl={backgroundImageUrl}
        zones={config.zones}
        values={values}
        className="border border-brand-steel-dark"
        onReady={(fn) => setCapturePreview(() => fn)}
      />

      {/* Text inputs */}
      <div className="flex flex-col gap-4">
        {config.zones.map((zone) => (
          <div key={zone.id} className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-semibold text-brand-steel-light tracking-widest uppercase">
                {zone.label}
              </label>
              <span className="text-xs text-brand-steel">
                {(values[zone.id] || '').length}/{zone.maxChars}
              </span>
            </div>
            <input
              type="text"
              value={values[zone.id]}
              onChange={(e) => handleChange(zone.id, e.target.value, zone)}
              placeholder={zone.defaultText}
              maxLength={zone.maxChars}
              className="
                w-full rounded bg-brand-charcoal border border-brand-steel-dark
                px-4 py-3 text-white text-lg font-bold tracking-wider
                placeholder:text-brand-steel placeholder:font-normal placeholder:tracking-normal
                focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-brand-yellow
                transition-colors uppercase
              "
            />
          </div>
        ))}
      </div>

      {/* Price + CTA */}
      <div className="border-t border-brand-steel-dark pt-6 flex flex-col gap-4">
        <div className="flex items-baseline gap-3">
          <span className="text-4xl font-bold text-brand-yellow">
            {formatPrice(price)}
          </span>
          {compareAtPrice && (
            <span className="text-xl text-brand-steel line-through">
              {formatPrice(compareAtPrice)}
            </span>
          )}
        </div>

        <Button
          size="lg"
          onClick={handleAddToCart}
          loading={added}
          className="w-full tracking-widest"
        >
          {added ? 'ADDED — GOING TO CART...' : 'ADD TO CART'}
        </Button>

        <p className="text-center text-brand-steel text-sm">
          Free shipping on orders over $75 · Made to order
        </p>
      </div>
    </div>
  )
}
