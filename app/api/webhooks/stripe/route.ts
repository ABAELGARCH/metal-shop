import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { processOrder } from '@/lib/order-processor'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Stripe webhook signature failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  // Return 200 immediately — do async work after
  const response = NextResponse.json({ received: true })

  if (event.type === 'payment_intent.succeeded') {
    const pi = event.data.object as { id: string }
    const order = await prisma.order.findUnique({
      where: { stripePaymentIntentId: pi.id },
      select: { id: true },
    })

    if (order) {
      // Trigger automation without blocking the response
      setImmediate(() => processOrder(order.id))
    }
  }

  if (event.type === 'payment_intent.payment_failed') {
    const pi = event.data.object as { id: string }
    await prisma.order.updateMany({
      where: { stripePaymentIntentId: pi.id },
      data: { status: 'PAYMENT_FAILED' },
    })
  }

  return response
}

// Disable body parsing — Stripe needs raw body for signature verification
export const config = {
  api: { bodyParser: false },
}
