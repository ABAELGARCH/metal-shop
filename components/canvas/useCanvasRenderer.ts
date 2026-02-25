'use client'
import { useCallback, useEffect, useRef } from 'react'
import { CustomizationZone } from '@/lib/validations'

type ZoneValues = Record<string, string>

export function useCanvasRenderer(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  backgroundUrl: string,
  zones: CustomizationZone[],
  values: ZoneValues,
  canvasWidth = 1200,
  canvasHeight = 800
) {
  const bgImageRef = useRef<HTMLImageElement | null>(null)
  const rafRef = useRef<number | null>(null)

  // Load background image once
  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      bgImageRef.current = img
      scheduleRender()
    }
    img.onerror = () => {
      // Draw a steel-texture placeholder if image fails
      bgImageRef.current = null
      scheduleRender()
    }
    img.src = backgroundUrl
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundUrl])

  // Pre-load fonts for the zones
  useEffect(() => {
    const fonts = [...new Set(zones.map((z) => z.font))]
    Promise.all(
      fonts.map((font) =>
        document.fonts.load(`bold 80px "${font}"`).catch(() => null)
      )
    ).then(() => scheduleRender())
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [zones])

  const render = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvasWidth
    canvas.height = canvasHeight

    // Background
    if (bgImageRef.current) {
      ctx.drawImage(bgImageRef.current, 0, 0, canvasWidth, canvasHeight)
    } else {
      // Placeholder gradient
      const grad = ctx.createLinearGradient(0, 0, canvasWidth, canvasHeight)
      grad.addColorStop(0, '#2C2C2C')
      grad.addColorStop(1, '#1A1A1A')
      ctx.fillStyle = grad
      ctx.fillRect(0, 0, canvasWidth, canvasHeight)

      // Metal texture dots
      ctx.fillStyle = 'rgba(255,255,255,0.02)'
      for (let x = 0; x < canvasWidth; x += 20) {
        for (let y = 0; y < canvasHeight; y += 20) {
          ctx.fillRect(x, y, 1, 1)
        }
      }
    }

    // Draw text zones
    for (const zone of zones) {
      const rawText = values[zone.id] || zone.defaultText
      const text = zone.uppercase ? rawText.toUpperCase() : rawText
      if (!text) continue

      ctx.save()

      // Font setup
      ctx.font = `bold ${zone.fontSize}px "${zone.font}", Impact, Arial Black, sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      // Scale down if text is too wide
      const measured = ctx.measureText(text)
      const scale = measured.width > zone.maxWidth
        ? zone.maxWidth / measured.width
        : 1

      ctx.translate(zone.x, zone.y)
      ctx.scale(scale, 1)

      // Shadow for depth
      ctx.shadowColor = 'rgba(0,0,0,0.8)'
      ctx.shadowBlur = 8
      ctx.shadowOffsetX = 3
      ctx.shadowOffsetY = 3

      // Fill
      ctx.fillStyle = zone.color
      ctx.fillText(text, 0, 0)

      // Subtle stroke for crispness
      ctx.strokeStyle = 'rgba(0,0,0,0.4)'
      ctx.lineWidth = 1 / scale
      ctx.strokeText(text, 0, 0)

      ctx.restore()
    }
  }, [canvasRef, canvasWidth, canvasHeight, zones, values])

  const scheduleRender = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    rafRef.current = requestAnimationFrame(render)
  }, [render])

  // Re-render when values change
  useEffect(() => {
    scheduleRender()
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current)
    }
  }, [scheduleRender])

  // Capture current canvas state as base64 PNG
  const capturePreview = useCallback((): string => {
    render()
    return canvasRef.current?.toDataURL('image/png', 0.92) ?? ''
  }, [render, canvasRef])

  return { capturePreview }
}
