import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit'
import api from '../../lib/api'

export interface User {
  _id: string
  name: string
  email: string
  role: 'user' | 'admin'
  addresses: Address[]
  createdAt?: string
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

interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  error: null,
}

// Async thunks
export const register = createAsyncThunk(
  'auth/register',
  async (userData: { name: string; email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/register', userData)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Registration failed')
    }
  }
)

export const login = createAsyncThunk(
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/auth/login', credentials)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed')
    }
  }
)

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await api.post('/auth/logout')
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Logout failed')
    }
  }
)

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/auth/me')
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch user')
    }
  }
)

// Address management thunks
export const addAddress = createAsyncThunk(
  'auth/addAddress',
  async (addressData: Omit<Address, '_id'>, { rejectWithValue }) => {
    try {
      const response = await api.post('/users/addresses', addressData)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add address')
    }
  }
)

export const updateAddress = createAsyncThunk(
  'auth/updateAddress',
  async ({ addressId, addressData }: { addressId: string; addressData: Omit<Address, '_id'> }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/users/addresses/${addressId}`, addressData)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update address')
    }
  }
)

export const deleteAddress = createAsyncThunk(
  'auth/deleteAddress',
  async (addressId: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/users/addresses/${addressId}`)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete address')
    }
  }
)

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async (profileData: { name?: string; email?: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/users/profile', profileData)
      return response.data.data.user
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile')
    }
  }
)

// Slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(register.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Login
      .addCase(login.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.error = null
      })
      // Fetch Me
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
      })
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Address
      .addCase(updateAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(updateAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Delete Address
      .addCase(deleteAddress.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(deleteAddress.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(deleteAddress.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
      // Update Profile
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true
        state.error = null
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false
        state.user = action.payload
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.isLoading = false
        state.error = action.payload as string
      })
  },
})

export const { clearError, updateUser } = authSlice.actions
export default authSlice.reducer
