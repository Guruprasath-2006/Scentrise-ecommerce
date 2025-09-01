import api from '../lib/api'

export interface UpdateProfileData {
  name?: string
  email?: string
}

export interface AddressData {
  label: string
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  phone: string
}

// Get user profile
export const getUserProfile = async () => {
  const response = await api.get('/users/profile')
  return response.data
}

// Update user profile
export const updateUserProfile = async (data: UpdateProfileData) => {
  const response = await api.put('/users/profile', data)
  return response.data
}

// Get all user addresses
export const getUserAddresses = async () => {
  const response = await api.get('/users/addresses')
  return response.data
}

// Add new address
export const addUserAddress = async (data: AddressData) => {
  const response = await api.post('/users/addresses', data)
  return response.data
}

// Update address
export const updateUserAddress = async (addressId: string, data: AddressData) => {
  const response = await api.put(`/users/addresses/${addressId}`, data)
  return response.data
}

// Delete address
export const deleteUserAddress = async (addressId: string) => {
  const response = await api.delete(`/users/addresses/${addressId}`)
  return response.data
}
