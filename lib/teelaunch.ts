// Teelaunch API client
// Docs: https://teelaunch.com/api/1

const BASE_URL = process.env.TEELAUNCH_API_URL || 'https://teelaunch.com/api/1'
const API_KEY = process.env.TEELAUNCH_API_KEY || ''

type TeelaunchAddress = {
  name: string
  address1: string
  address2?: string
  city: string
  state_code: string
  zip: string
  country_code: string
}

type TeelaunchOrderItem = {
  product_id: string
  variant_id: string
  quantity: number
  custom_text?: string
  artwork_url?: string
}

type TeelaunchOrderPayload = {
  external_id: string  // our order number
  shipping: TeelaunchAddress
  line_items: TeelaunchOrderItem[]
}

async function teelFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Teelaunch API error ${res.status}: ${body}`)
  }

  return res.json()
}

export async function submitOrder(
  orderNumber: string,
  address: {
    name: string
    line1: string
    line2?: string
    city: string
    state: string
    zip: string
    country: string
  },
  items: Array<{
    teelaunchProductId: string
    teelaunchVariantId: string
    quantity: number
    customText?: string
    artworkUrl?: string
  }>
) {
  const payload: TeelaunchOrderPayload = {
    external_id: orderNumber,
    shipping: {
      name: address.name,
      address1: address.line1,
      address2: address.line2,
      city: address.city,
      state_code: address.state,
      zip: address.zip,
      country_code: address.country,
    },
    line_items: items.map((item) => ({
      product_id: item.teelaunchProductId,
      variant_id: item.teelaunchVariantId,
      quantity: item.quantity,
      custom_text: item.customText,
      artwork_url: item.artworkUrl,
    })),
  }

  return teelFetch('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getOrderStatus(teelaunchOrderId: string) {
  return teelFetch(`/orders/${teelaunchOrderId}`)
}

export async function getProducts() {
  return teelFetch('/products')
}
