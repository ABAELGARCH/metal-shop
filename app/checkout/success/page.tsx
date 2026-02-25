import Link from 'next/link'
import { StoreHeader } from '@/components/store/StoreHeader'

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string; orderNumber?: string }>
}) {
  const { orderId, orderNumber } = await searchParams

  return (
    <div className="min-h-screen">
      <StoreHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-24 text-center">
        {/* Icon */}
        <div className="w-24 h-24 bg-brand-yellow/10 border-2 border-brand-yellow rounded-full flex items-center justify-center mx-auto mb-8">
          <svg className="w-12 h-12 text-brand-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-black text-white mb-4">ORDER CONFIRMED</h1>
        {orderNumber && (
          <p className="text-brand-yellow font-bold text-xl mb-2">{orderNumber}</p>
        )}
        <p className="text-brand-steel text-lg mb-8">
          Your custom metal piece is now in production. We&apos;ll email you when it ships.
        </p>

        <div className="bg-brand-charcoal border border-brand-steel-dark rounded-lg p-6 mb-8 text-left">
          <h2 className="font-bold text-white mb-4">WHAT HAPPENS NEXT</h2>
          <div className="flex flex-col gap-4">
            {[
              { step: '01', label: 'Design file generated', desc: 'Your custom DXF file is created.' },
              { step: '02', label: 'Production starts', desc: 'Sent to our steel fabrication partner.' },
              { step: '03', label: 'Quality check', desc: 'Inspected before packaging.' },
              { step: '04', label: 'Ships to you', desc: 'Tracking number sent by email.' },
            ].map((s) => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="text-brand-yellow font-black text-lg w-8 flex-shrink-0">{s.step}</span>
                <div>
                  <p className="font-bold text-white">{s.label}</p>
                  <p className="text-brand-steel text-sm">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {orderId && (
          <p className="text-brand-steel text-sm mb-6">
            Track your order:{' '}
            <Link href={`/orders/${orderId}`} className="text-brand-yellow hover:underline">
              View order status
            </Link>
          </p>
        )}

        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-brand-yellow text-brand-black font-bold px-8 py-3 rounded hover:bg-brand-yellow-dark transition-colors tracking-widest"
        >
          CONTINUE SHOPPING
        </Link>
      </div>
    </div>
  )
}
