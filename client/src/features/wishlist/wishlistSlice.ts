import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api from '../../lib/api'
import { Product } from '../cart/cartSlice'

interface WishlistState {
  items: Product[]
  isLoading: boolean
  error: string | null
}

const initialState: WishlistState = {
  items: [],
  isLoading: false,
  error: null
}

// Async thunks
export const fetchWishlist = createAsyncThunk(
  'wishlist/fetchWishlist',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/wishlist')
      return response.data.items
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch wishlist')
    }
  }
)

export const addToWishlist = createAsyncThunk(
  'wishlist/addToWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      const response = await api.post('/wishlist/add', { productId })
      return response.data.product
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to wishlist')
    }
  }
)

export const removeFromWishlist = createAsyncThunk(
  'wishlist/removeFromWishlist',
  async (productId: string, { rejectWithValue }) => {
    try {
      await api.delete(`/wishlist/remove/${productId}`)
      return productId
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove from wishlist')
    }
  }
)

export const clearWishlist = createAsyncThunk(
  'wishlist/clearWishlist',
  async (_, { rejectWithValue }) => {
    try {
      await api.delete('/wishlist/clear')
      return []
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to clear wishlist')
    }
  }
)

// Slice
const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch wishlist
      .addCase(fetchWishlist.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchWishlist.fulfilled, (state, action) => {
        state.isLoading = false
        state.items = action.payload
      })
      .addCase(fetchWishlist.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Add to wishlist
      .addCase(addToWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(addToWishlist.fulfilled, (state, action) => {
        const existingItem = state.items.find(item => item._id === action.payload._id)
        if (!existingItem) {
          state.items.push(action.payload)
        }
      })
      .addCase(addToWishlist.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Remove from wishlist
      .addCase(removeFromWishlist.pending, (state) => {
        state.error = null
      })
      .addCase(removeFromWishlist.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item._id !== action.payload)
      })
      .addCase(removeFromWishlist.rejected, (state, action) => {
        state.error = action.payload as string
      })
      // Clear wishlist
      .addCase(clearWishlist.fulfilled, (state) => {
        state.items = []
      })
  }
})

export const { clearError } = wishlistSlice.actions
export default wishlistSlice.reducer
