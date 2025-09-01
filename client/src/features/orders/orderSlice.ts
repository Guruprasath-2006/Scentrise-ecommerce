import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'

export interface OrderItem {
  product: {
    _id: string
    title: string
    brand: string
    images: { url: string }[]
    slug: string
  }
  qty: number
  priceAtPurchase: number
}

export interface OrderStatus {
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  timestamp: string
  message: string
  location?: string
}

export interface Order {
  _id: string
  orderId: string
  items: OrderItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  statusHistory: OrderStatus[]
  estimatedDelivery: string
  trackingId?: string
  payment: {
    provider: 'razorpay' | 'stripe' | 'cod'
    status: 'pending' | 'captured' | 'failed'
  }
  shippingAddress: {
    label: string
    line1: string
    line2?: string
    city: string
    state: string
    pincode: string
    phone: string
  }
  createdAt: string
  updatedAt: string
}

export interface TrackingInfo {
  orderId: string
  trackingId?: string
  status: string
  statusHistory: OrderStatus[]
  estimatedDelivery: string
  itemCount: number
  shippingCity: string
  createdAt: string
}

interface OrderState {
  orders: Order[]
  currentOrder: Order | null
  trackingInfo: TrackingInfo | null
  isLoading: boolean
  error: string | null
  pagination: {
    current: number
    total: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const initialState: OrderState = {
  orders: [],
  currentOrder: null,
  trackingInfo: null,
  isLoading: false,
  error: null,
  pagination: {
    current: 1,
    total: 1,
    hasNext: false,
    hasPrev: false
  }
}

// Create order
export const createOrder = createAsyncThunk(
  'orders/create',
  async (orderData: {
    items: { productId: string; qty: number }[]
    addressId: string
    provider: 'razorpay' | 'stripe' | 'cod'
  }, { rejectWithValue }) => {
    try {
      const response = await api.post('/orders', orderData)
      return response.data.order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create order')
    }
  }
)

// Get user orders
export const getUserOrders = createAsyncThunk(
  'orders/getUserOrders',
  async (params: { page?: number; limit?: number } = {}, { rejectWithValue }) => {
    try {
      const { page = 1, limit = 10 } = params
      const response = await api.get(`/orders?page=${page}&limit=${limit}`)
      return response.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch orders')
    }
  }
)

// Get order by ID
export const getOrderById = createAsyncThunk(
  'orders/getById',
  async (orderId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/${orderId}`)
      return response.data.order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch order')
    }
  }
)

// Track order (public)
export const trackOrder = createAsyncThunk(
  'orders/track',
  async (trackingId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/orders/track/${trackingId}`)
      return response.data.order
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Order not found')
    }
  }
)

// Cancel order
export const cancelOrder = createAsyncThunk(
  'orders/cancel',
  async ({ orderId, reason }: { orderId: string; reason?: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/orders/${orderId}/cancel`, { reason })
      return { orderId, message: response.data.message }
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel order')
    }
  }
)

const orderSlice = createSlice({
  name: 'orders',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    clearTrackingInfo: (state) => {
      state.trackingInfo = null
    },
    clearCurrentOrder: (state) => {
      state.currentOrder = null
    }
  },
  extraReducers: (builder) => {
    // Create order
    builder
      .addCase(createOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(createOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
        state.orders.unshift(action.payload)
      })
      .addCase(createOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get user orders
    builder
      .addCase(getUserOrders.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getUserOrders.fulfilled, (state, action) => {
        state.isLoading = false
        state.orders = action.payload.orders
        state.pagination = action.payload.pagination
      })
      .addCase(getUserOrders.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Get order by ID
    builder
      .addCase(getOrderById.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(getOrderById.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentOrder = action.payload
      })
      .addCase(getOrderById.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })

    // Track order
    builder
      .addCase(trackOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(trackOrder.fulfilled, (state, action) => {
        state.isLoading = false
        state.trackingInfo = action.payload
      })
      .addCase(trackOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
        state.trackingInfo = null
      })

    // Cancel order
    builder
      .addCase(cancelOrder.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.isLoading = false
        // Update order status in the list
        const orderIndex = state.orders.findIndex(order => order._id === action.payload.orderId)
        if (orderIndex !== -1) {
          state.orders[orderIndex].status = 'cancelled'
        }
        // Update current order if it's the same
        if (state.currentOrder && state.currentOrder._id === action.payload.orderId) {
          state.currentOrder.status = 'cancelled'
        }
      })
      .addCase(cancelOrder.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  }
})

export const { clearError, clearTrackingInfo, clearCurrentOrder } = orderSlice.actions
export default orderSlice.reducer
