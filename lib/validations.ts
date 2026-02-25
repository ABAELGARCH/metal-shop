import { z } from 'zod'

export const CustomizationZoneSchema = z.object({
  id: z.string(),
  label: z.string(),
  x: z.number(),
  y: z.number(),
  maxWidth: z.number(),
  maxChars: z.number().int().positive(),
  font: z.string().default('Impact'),
  fontSize: z.number().positive().default(80),
  color: z.string().default('#F5A623'),
  defaultText: z.string(),
  uppercase: z.boolean().default(true),
})

export const CustomizationConfigSchema = z.object({
  zones: z.array(CustomizationZoneSchema).min(1),
})

export const CartItemSchema = z.object({
  productId: z.number().int().positive(),
  productSlug: z.string(),
  productName: z.string(),
  unitPrice: z.number().int().positive(),
  quantity: z.number().int().positive().max(10),
  customizationData: z.object({
    zones: z.array(z.object({ id: z.string(), text: z.string() })),
  }),
  previewBase64: z.string().optional(),
})

export const CheckoutFormSchema = z.object({
  customerEmail: z.string().email(),
  customerName: z.string().min(2).max(100),
  customerPhone: z.string().optional(),
  shippingName: z.string().min(2).max(100),
  shippingLine1: z.string().min(5).max(200),
  shippingLine2: z.string().optional(),
  shippingCity: z.string().min(2).max(100),
  shippingState: z.string().min(2).max(100),
  shippingZip: z.string().min(3).max(20),
  shippingCountry: z.string().length(2).default('US'),
  items: z.array(CartItemSchema).min(1),
})

export const ProductAdminSchema = z.object({
  name: z.string().min(2).max(200),
  slug: z.string().min(2).max(200).regex(/^[a-z0-9-]+$/),
  description: z.string().optional(),
  price: z.number().int().positive(),
  compareAtPrice: z.number().int().positive().optional(),
  published: z.boolean().default(false),
  featured: z.boolean().default(false),
  categoryId: z.number().int().positive().optional(),
  dxfTemplateId: z.number().int().positive().optional(),
  teelaunchProductId: z.string().optional(),
  teelaunchVariantId: z.string().optional(),
  customizationConfig: CustomizationConfigSchema,
})

export type CartItem = z.infer<typeof CartItemSchema>
export type CheckoutForm = z.infer<typeof CheckoutFormSchema>
export type CustomizationConfig = z.infer<typeof CustomizationConfigSchema>
export type CustomizationZone = z.infer<typeof CustomizationZoneSchema>
