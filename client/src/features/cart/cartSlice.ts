import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Product {
  _id: string
  title: string
  slug: string
  brand: string
  gender: 'men' | 'women' | 'unisex'
  family: 'citrus' | 'floral' | 'woody' | 'oriental' | 'fresh' | 'gourmand'
  notes: string[]
  description: string
  price: number
  mrp: number
  images: {
    url: string
    publicId?: string
  }[]
  stock: number
  ratingAvg: number
  ratingCount: number
  isFeatured: boolean
  createdAt: string
}

export interface CartItem {
  product: Product
  qty: number
}

export interface CartTotals {
  subtotal: number
  shipping: number
  tax: number
  total: number
}

export interface Address {
  _id?: string
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
}

interface CartState {
  items: CartItem[]
  shippingAddress: Address | null
  totals: CartTotals
}

const initialState: CartState = {
  items: JSON.parse(localStorage.getItem('cart') || '[]'),
  shippingAddress: JSON.parse(localStorage.getItem('shippingAddress') || 'null'),
  totals: {
    subtotal: 0,
    shipping: 0,
    tax: 0,
    total: 0,
  },
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<{ product: Product; qty: number }>) => {
      const { product, qty } = action.payload
      const existingItem = state.items.find(item => item.product._id === product._id)

      if (existingItem) {
        existingItem.qty = Math.min(existingItem.qty + qty, product.stock)
      } else {
        state.items.push({ product, qty: Math.min(qty, product.stock) })
      }

      cartSlice.caseReducers.computeTotals(state)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },

    removeFromCart: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item.product._id !== action.payload)
      cartSlice.caseReducers.computeTotals(state)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },

    changeQuantity: (state, action: PayloadAction<{ productId: string; qty: number }>) => {
      const { productId, qty } = action.payload
      const item = state.items.find(item => item.product._id === productId)

      if (item) {
        if (qty <= 0) {
          state.items = state.items.filter(item => item.product._id !== productId)
        } else {
          item.qty = Math.min(qty, item.product.stock)
        }
      }

      cartSlice.caseReducers.computeTotals(state)
      localStorage.setItem('cart', JSON.stringify(state.items))
    },

    clearCart: (state) => {
      state.items = []
      state.totals = {
        subtotal: 0,
        shipping: 0,
        tax: 0,
        total: 0,
      }
      localStorage.removeItem('cart')
    },

    setShippingAddress: (state, action: PayloadAction<Address | null>) => {
      state.shippingAddress = action.payload
      localStorage.setItem('shippingAddress', JSON.stringify(action.payload))
    },

    computeTotals: (state) => {
      const subtotal = state.items.reduce((total, item) => {
        return total + (item.product.price * item.qty)
      }, 0)

      const shipping = subtotal < 999 ? 49 : 0
      const tax = Math.round(subtotal * 0.18) // 18% GST
      const total = subtotal + shipping + tax

      state.totals = {
        subtotal,
        shipping,
        tax,
        total,
      }
    },
  },
})

// Compute totals on initial load
const computeInitialTotals = () => {
  const items = JSON.parse(localStorage.getItem('cart') || '[]')
  const subtotal = items.reduce((total: number, item: CartItem) => {
    return total + (item.product.price * item.qty)
  }, 0)

  const shipping = subtotal < 999 ? 49 : 0
  const tax = Math.round(subtotal * 0.18)
  const total = subtotal + shipping + tax

  return { subtotal, shipping, tax, total }
}

// Update initial state with computed totals
initialState.totals = computeInitialTotals()

export const {
  addToCart,
  removeFromCart,
  changeQuantity,
  clearCart,
  setShippingAddress,
  computeTotals,
} = cartSlice.actions

export default cartSlice.reducer
