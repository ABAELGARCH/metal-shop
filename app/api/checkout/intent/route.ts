import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'
import { CartItemSchema } from '@/lib/validations'

const IntentSchema = z.object({
  items: z.array(CartItemSchema),
  email: z.string().email(),
})

export async function POST(req: NextRequest) {
  const body = await req.json()
  const parsed = IntentSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const { items, email } = parsed.data

  // Server-side price validation — never trust client prices
  let subtotal = 0
  for (const item of items) {
    const product = await prisma.product.findUnique({
      where: { id: item.productId, published: true },
      select: { price: true },
    })
    if (!product) {
      return NextResponse.json({ error: `Product ${item.productId} not found` }, { status: 400 })
    }
    subtotal += product.price * item.quantity
  }

  // Fetch shipping cost from settings
  const shippingSetting = await prisma.setting.findUnique({ where: { key: 'shipping_cost' } })
  const shippingCost = shippingSetting ? parseInt(shippingSetting.value) : 999

  const total = subtotal + shippingCost

  const paymentIntent = await stripe.paymentIntents.create({
    amount: total,
    currency: 'usd',
    receipt_email: email,
    metadata: {
      items: JSON.stringify(items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }))),
    },
  })

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    total,
    subtotal,
    shippingCost,
  })
}
