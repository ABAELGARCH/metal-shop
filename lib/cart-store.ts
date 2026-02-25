import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: number
  productSlug: string
  productName: string
  unitPrice: number
  quantity: number
  customizationData: { zones: { id: string; text: string }[] }
  previewBase64?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (productId: number) => void
  updateQuantity: (productId: number, quantity: number) => void
  clear: () => void
  total: () => number
  count: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        set((state) => {
          const existing = state.items.findIndex((i) => i.productId === item.productId)
          if (existing >= 0) {
            const items = [...state.items]
            items[existing] = { ...items[existing], ...item }
            return { items }
          }
          return { items: [...state.items, item] }
        })
      },

      removeItem: (productId) => {
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) }))
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity } : i
          ),
        }))
      },

      clear: () => set({ items: [] }),

      total: () => get().items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0),

      count: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
    }),
    { name: 'metal-shop-cart' }
  )
)

export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}
