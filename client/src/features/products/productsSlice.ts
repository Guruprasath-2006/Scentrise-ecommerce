import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../lib/api'
import { Product } from '../cart/cartSlice'

export interface ProductFilters {
  q?: string
  gender?: string
  family?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

interface ProductsState {
  products: Product[]
  featuredProducts: Product[]
  currentProduct: Product | null
  filters: ProductFilters
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
}

const initialState: ProductsState = {
  products: [],
  featuredProducts: [],
  currentProduct: null,
  filters: {
    page: 1,
    limit: 12,
    sort: '-createdAt',
  },
  pagination: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (filters: ProductFilters = {}, { rejectWithValue }) => {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })

      console.log('Fetching products with URL:', `/products?${params.toString()}`)
      const response = await api.get(`/products?${params.toString()}`)
      console.log('Products response:', response.data)
      
      return {
        products: response.data.data,
        pagination: response.data.pagination,
      }
    } catch (error: any) {
      console.error('Products fetch error:', error)
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch products')
    }
  }
)

export const fetchFeaturedProducts = createAsyncThunk(
  'products/fetchFeaturedProducts',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Fetching featured products...')
      const response = await api.get('/products?isFeatured=true&limit=8')
      console.log('Featured products response:', response.data)
      return response.data.data
    } catch (error: any) {
      console.error('Featured products fetch error:', error)
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch featured products')
    }
  }
)

export const fetchProductBySlug = createAsyncThunk(
  'products/fetchProductBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/products/${slug}`)
      return response.data.data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Product not found')
    }
  }
)

// Slice
const productsSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ProductFilters>) => {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearFilters: (state) => {
      state.filters = {
        page: 1,
        limit: 12,
        sort: '-createdAt',
      }
    },
    clearError: (state) => {
      state.error = null
    },
    clearCurrentProduct: (state) => {
      state.currentProduct = null
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch products
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false
        state.products = action.payload.products
        state.pagination = action.payload.pagination
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Fetch featured products
      .addCase(fetchFeaturedProducts.fulfilled, (state, action) => {
        state.featuredProducts = action.payload
      })
      // Fetch product by slug
      .addCase(fetchProductBySlug.pending, (state) => {
        state.isLoading = true
        state.error = null
        state.currentProduct = null
      })
      .addCase(fetchProductBySlug.fulfilled, (state, action) => {
        state.isLoading = false
        state.currentProduct = action.payload
      })
      .addCase(fetchProductBySlug.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { setFilters, clearFilters, clearError, clearCurrentProduct } = productsSlice.actions
export default productsSlice.reducer
