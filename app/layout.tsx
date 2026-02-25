import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'FORGE Metal Shop — Custom Steel Signs & Wall Art',
  description: 'Laser-cut steel signs personalized with your text. Built to last a lifetime. Cut from steel, built to last.',
  keywords: ['custom metal signs', 'laser cut steel', 'personalized metal art', 'custom wall art'],
  openGraph: {
    title: 'FORGE Metal Shop',
    description: 'Cut from steel. Built to last.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  )
}
