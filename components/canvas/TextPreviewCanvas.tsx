'use client'
import { useRef } from 'react'
import { useCanvasRenderer } from './useCanvasRenderer'
import { CustomizationZone } from '@/lib/validations'

interface TextPreviewCanvasProps {
  backgroundUrl: string
  zones: CustomizationZone[]
  values: Record<string, string>
  className?: string
  onReady?: (capturePreview: () => string) => void
}

export function TextPreviewCanvas({
  backgroundUrl,
  zones,
  values,
  className = '',
  onReady,
}: TextPreviewCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null!)
  const { capturePreview } = useCanvasRenderer(canvasRef, backgroundUrl, zones, values)

  // Expose capturePreview to parent via callback
  if (onReady) onReady(capturePreview)

  return (
    <div className={`relative overflow-hidden rounded-lg bg-brand-charcoal ${className}`}>
      <canvas
        ref={canvasRef}
        className="w-full h-auto block"
      />
      <div className="absolute top-2 right-2">
        <span className="text-xs text-brand-steel bg-black/50 px-2 py-0.5 rounded">
          PREVIEW
        </span>
      </div>
    </div>
  )
}
