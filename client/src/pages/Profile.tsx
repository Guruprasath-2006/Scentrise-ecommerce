import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { logout, addAddress, updateAddress, deleteAddress, updateProfile } from '../features/auth/authSlice'
import { getUserOrders } from '../features/orders/orderSlice'
import Button from '../components/ui/Button'
import { Address } from '../features/cart/cartSlice'
import toast from 'react-hot-toast'

interface ProfileTabsType {
  overview: string
  addresses: string
  orders: string
  settings: string
}

const Profile = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { orders } = useAppSelector((state) => state.orders)
  
  const [activeTab, setActiveTab] = useState<keyof ProfileTabsType>('overview')
  const [isEditing, setIsEditing] = useState(false)
  const [editForm, setEditForm] = useState({
    name: user?.name || '',
    email: user?.email || ''
  })
  const [showAddAddress, setShowAddAddress] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [newAddress, setNewAddress] = useState<Omit<Address, '_id'>>({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: ''
  })

  useEffect(() => {
    if (user) {
      setEditForm({ name: user.name, email: user.email })
      dispatch(getUserOrders({}))
    }
  }, [user, dispatch])

  const handleLogout = () => {
    dispatch(logout())
    navigate('/')
  }

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile(editForm)).unwrap()
      toast.success('Profile updated successfully!')
      setIsEditing(false)
    } catch (error) {
      toast.error(error as string)
    }
  }

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingAddress) {
        // Update existing address
        await dispatch(updateAddress({ 
          addressId: editingAddress._id!, 
          addressData: newAddress 
        })).unwrap()
        toast.success('Address updated successfully!')
        setEditingAddress(null)
      } else {
        // Add new address
        await dispatch(addAddress(newAddress)).unwrap()
        toast.success('Address added successfully!')
      }
      setShowAddAddress(false)
      setNewAddress({
        label: '',
        line1: '',
        line2: '',
        city: '',
        state: '',
        pincode: '',
        phone: ''
      })
    } catch (error) {
      toast.error(error as string)
    }
  }

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address)
    setNewAddress({
      label: address.label,
      line1: address.line1,
      line2: address.line2 || '',
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      phone: address.phone
    })
    setShowAddAddress(true)
  }

  const handleDeleteAddress = async (addressId: string) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await dispatch(deleteAddress(addressId)).unwrap()
        toast.success('Address deleted successfully!')
      } catch (error) {
        toast.error(error as string)
      }
    }
  }

  const handleCancelAddressForm = () => {
    setShowAddAddress(false)
    setEditingAddress(null)
    setNewAddress({
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: ''
    })
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-purple-100 text-purple-800'
      case 'shipped': return 'bg-indigo-100 text-indigo-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your profile</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const tabs: ProfileTabsType = {
    overview: 'Overview',
    addresses: 'Addresses', 
    orders: 'Orders',
    settings: 'Settings'
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account, addresses, and orders</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              {/* User Info */}
              <div className="text-center mb-6">
                <div className="w-20 h-20 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary-600">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="font-semibold text-gray-900">{user.name}</h3>
                <p className="text-sm text-gray-600">{user.email}</p>
                <span className={`inline-block px-2 py-1 text-xs rounded-full mt-2 ${
                  user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-green-100 text-green-600'
                }`}>
                  {user.role === 'admin' ? 'Admin' : 'Customer'}
                </span>
              </div>

              {/* Navigation */}
              <nav className="space-y-2">
                {Object.entries(tabs).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key as keyof ProfileTabsType)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeTab === key
                        ? 'bg-primary-50 text-primary-600 border-l-4 border-primary-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </nav>

              {/* Logout Button */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="w-full text-red-600 border-red-300 hover:bg-red-50"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Account Overview</h2>
                  
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-blue-600">Total Orders</p>
                          <p className="text-2xl font-bold text-blue-900">{orders.length}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-green-600">Saved Addresses</p>
                          <p className="text-2xl font-bold text-green-900">{user.addresses?.length || 0}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm font-medium text-purple-600">Member Since</p>
                          <p className="text-lg font-bold text-purple-900">{formatDate(user.createdAt || new Date().toISOString())}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Orders */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Recent Orders</h3>
                      <Link to="/orders">
                        <Button variant="outline" size="sm">View All</Button>
                      </Link>
                    </div>
                    
                    {orders.length > 0 ? (
                      <div className="space-y-3">
                        {orders.slice(0, 3).map((order) => (
                          <div key={order._id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="font-medium text-gray-900">Order #{order.orderId}</p>
                                <p className="text-sm text-gray-600">{formatDate(order.createdAt)}</p>
                              </div>
                              <div className="text-right">
                                <p className="font-semibold text-gray-900">₹{order.total.toLocaleString()}</p>
                                <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                                  {order.status.toUpperCase()}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                        <p className="text-gray-500">No orders yet</p>
                        <Link to="/catalog">
                          <Button className="mt-2">Start Shopping</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Saved Addresses</h2>
                    <Button onClick={() => setShowAddAddress(true)}>
                      + Add New Address
                    </Button>
                  </div>

                  {/* Add/Edit Address Form */}
                  {showAddAddress && (
                    <form onSubmit={handleAddAddress} className="border rounded-lg p-6 bg-gray-50">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Label
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.label}
                            onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="e.g., Home, Office"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number
                          </label>
                          <input
                            type="tel"
                            required
                            value={newAddress.phone}
                            onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="+91 9876543210"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 1
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.line1}
                            onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="House/Flat number, Street name"
                          />
                        </div>
                        
                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Address Line 2 (Optional)
                          </label>
                          <input
                            type="text"
                            value={newAddress.line2}
                            onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Landmark, Area"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="City"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.state}
                            onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="State"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode
                          </label>
                          <input
                            type="text"
                            required
                            value={newAddress.pincode}
                            onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                            placeholder="Pincode"
                          />
                        </div>
                      </div>
                      
                      <div className="flex space-x-3 mt-6">
                        <Button type="submit">
                          {editingAddress ? 'Update Address' : 'Save Address'}
                        </Button>
                        <Button type="button" variant="outline" onClick={handleCancelAddressForm}>
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Existing Addresses */}
                  {user.addresses && user.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {user.addresses.map((address) => (
                        <div key={address._id} className="border rounded-lg p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className="font-medium text-gray-900">{address.label}</span>
                                <span className="text-sm bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                  {address.phone}
                                </span>
                              </div>
                              <p className="text-gray-600 text-sm">
                                {address.line1}
                                {address.line2 && `, ${address.line2}`}
                              </p>
                              <p className="text-gray-600 text-sm">
                                {address.city}, {address.state} - {address.pincode}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button 
                                onClick={() => handleEditAddress(address)}
                                className="text-blue-600 hover:text-blue-700 text-sm"
                              >
                                Edit
                              </button>
                              <button 
                                onClick={() => handleDeleteAddress(address._id!)}
                                className="text-red-600 hover:text-red-700 text-sm"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Saved Addresses</h3>
                      <p className="text-gray-600 mb-4">Add your first address to make checkout faster</p>
                      <Button onClick={() => setShowAddAddress(true)}>
                        Add Your First Address
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Order History</h2>
                    <Link to="/orders">
                      <Button variant="outline">View Detailed Orders</Button>
                    </Link>
                  </div>

                  {orders.length > 0 ? (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order._id} className="border rounded-lg p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h3 className="font-semibold text-gray-900">Order #{order.orderId}</h3>
                              <p className="text-sm text-gray-600">Placed on {formatDate(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-gray-900">₹{order.total.toLocaleString()}</p>
                              <span className={`inline-block px-3 py-1 text-sm rounded-full ${getStatusColor(order.status)}`}>
                                {order.status.toUpperCase()}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex space-x-4">
                              {order.items.slice(0, 3).map((item, index) => (
                                <img
                                  key={index}
                                  src={item.product.images[0]?.url || '/placeholder-perfume.jpg'}
                                  alt={item.product.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              ))}
                              {order.items.length > 3 && (
                                <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-600">
                                  +{order.items.length - 3}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex space-x-3">
                              {order.trackingId && (
                                <Link to={`/track/${order.trackingId}`}>
                                  <Button variant="outline" size="sm">
                                    Track Order
                                  </Button>
                                </Link>
                              )}
                              <Link to={`/orders/${order._id}`}>
                                <Button size="sm">
                                  View Details
                                </Button>
                              </Link>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                      <div className="text-gray-500 mb-4">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Orders Yet</h3>
                      <p className="text-gray-600 mb-4">Start shopping to see your orders here</p>
                      <Link to="/catalog">
                        <Button>Browse Products</Button>
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {/* Settings Tab */}
              {activeTab === 'settings' && (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
                  
                  {/* Profile Information */}
                  <div className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Cancel' : 'Edit'}
                      </Button>
                    </div>
                    
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                          </label>
                          <input
                            type="text"
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                          </label>
                          <input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                        </div>
                        
                        <div className="flex space-x-3">
                          <Button onClick={handleSaveProfile}>
                            Save Changes
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Full Name</label>
                          <p className="text-gray-900">{user.name}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Email Address</label>
                          <p className="text-gray-900">{user.email}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Account Type</label>
                          <p className="text-gray-900 capitalize">{user.role}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Security */}
                  <div className="border rounded-lg p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Security</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Password</p>
                          <p className="text-sm text-gray-600">Last updated 30 days ago</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Change Password
                        </Button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-900">Two-Factor Authentication</p>
                          <p className="text-sm text-gray-600">Add an extra layer of security</p>
                        </div>
                        <Button variant="outline" size="sm">
                          Enable 2FA
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Danger Zone */}
                  <div className="border border-red-200 rounded-lg p-6 bg-red-50">
                    <h3 className="text-lg font-medium text-red-900 mb-4">Danger Zone</h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-red-900">Delete Account</p>
                          <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                        </div>
                        <Button variant="outline" size="sm" className="text-red-600 border-red-300 hover:bg-red-100">
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
