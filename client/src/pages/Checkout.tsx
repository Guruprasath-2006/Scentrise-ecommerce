import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { setShippingAddress, clearCart } from '../features/cart/cartSlice'
import { createOrder } from '../features/orders/orderSlice'
import { Address } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'

const Checkout = () => {
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { items, totals, shippingAddress } = useAppSelector((state) => state.cart)
  const { user } = useAppSelector((state) => state.auth)
  
  const [selectedAddressId, setSelectedAddressId] = useState<string>('')
  const [showNewAddressForm, setShowNewAddressForm] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay')
  const [isProcessing, setIsProcessing] = useState(false)

  const [newAddress, setNewAddress] = useState<Omit<Address, '_id'>>({
    label: '',
    line1: '',
    line2: '',
    city: '',
    state: '',
    pincode: '',
    phone: '',
  })

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      navigate('/cart')
    }
  }, [items.length, navigate])

  // Set initial address selection
  useEffect(() => {
    if (shippingAddress && shippingAddress._id) {
      setSelectedAddressId(shippingAddress._id)
    } else if (user?.addresses && user.addresses.length > 0) {
      // Auto-select the first address if none is selected
      const firstAddressId = user.addresses[0]._id || ''
      setSelectedAddressId(firstAddressId)
      
      // Also set it in Redux store
      if (firstAddressId) {
        dispatch(setShippingAddress(user.addresses[0]))
      }
    } else if (user && (!user.addresses || user.addresses.length === 0)) {
      // If user has no addresses, show the add new address form automatically
      setShowNewAddressForm(true)
    }
  }, [user?.addresses, shippingAddress, dispatch, user])

  const handleAddressSelect = (addressId: string) => {
    setSelectedAddressId(addressId)
    const selectedAddr = user?.addresses?.find(addr => addr._id === addressId)
    if (selectedAddr) {
      dispatch(setShippingAddress(selectedAddr))
    }
  }

  const handleNewAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const addressWithId = { ...newAddress, _id: Date.now().toString() }
    dispatch(setShippingAddress(addressWithId))
    setSelectedAddressId(addressWithId._id!)
    setShowNewAddressForm(false)
    setNewAddress({
      label: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      pincode: '',
      phone: '',
    })
  }

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      alert('Please select a shipping address')
      return
    }

    setIsProcessing(true)
    
    try {
      const selectedAddress = user?.addresses?.find(addr => addr._id === selectedAddressId) || shippingAddress
      
      if (!selectedAddress || !selectedAddress._id) {
        alert('Please select a valid shipping address')
        return
      }

      // Create order data
      const orderData = {
        items: items.map(item => ({
          productId: item.product._id,
          qty: item.qty
        })),
        addressId: selectedAddress._id,
        provider: paymentMethod as 'razorpay' | 'stripe' | 'cod'
      }

      // Create order via API
      const resultAction = await dispatch(createOrder(orderData))
      
      if (createOrder.fulfilled.match(resultAction)) {
        // Clear cart on successful order
        dispatch(clearCart())
        
        // Navigate to order confirmation
        navigate(`/orders/${resultAction.payload._id}`, { 
          state: { 
            orderCreated: true,
            orderDetails: resultAction.payload
          }
        })
      } else {
        throw new Error(resultAction.payload as string)
      }
      
    } catch (error: any) {
      console.error('Order creation failed:', error)
      alert(error.message || 'Failed to place order. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return null // Will redirect to cart
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Shipping Address Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Shipping Address</h2>
              
              {/* Existing Addresses */}
              {user?.addresses && user.addresses.length > 0 && (
                <div className="space-y-4 mb-6">
                  {user.addresses.map((address) => (
                    <div key={address._id} className="border rounded-lg p-4">
                      <label className="flex items-start space-x-3 cursor-pointer">
                        <input
                          type="radio"
                          name="address"
                          value={address._id}
                          checked={selectedAddressId === address._id}
                          onChange={() => handleAddressSelect(address._id!)}
                          className="mt-1 text-primary-600 focus:ring-primary-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
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
                      </label>
                    </div>
                  ))}
                </div>
              )}

              {/* No addresses message */}
              {user && (!user.addresses || user.addresses.length === 0) && !showNewAddressForm && (
                <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-lg mb-6">
                  <div className="text-gray-500 mb-4">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Shipping Address</h3>
                  <p className="text-gray-600 mb-4">Add a shipping address to continue with your order</p>
                </div>
              )}

              {/* Add New Address */}
              {!showNewAddressForm ? (
                <Button
                  variant="outline"
                  onClick={() => setShowNewAddressForm(true)}
                  className="w-full"
                >
                  + Add New Address
                </Button>
              ) : (
                <form onSubmit={handleNewAddressSubmit} className="space-y-4 border rounded-lg p-4 bg-gray-50">
                  <h3 className="font-medium text-gray-900">Add New Address</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address Label
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., Home, Office"
                        value={newAddress.label}
                        onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        placeholder="Your phone number"
                        value={newAddress.phone}
                        onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 1
                    </label>
                    <input
                      type="text"
                      placeholder="House/Flat/Office No., Building Name"
                      value={newAddress.line1}
                      onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address Line 2 (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="Street, Area, Landmark"
                      value={newAddress.line2}
                      onChange={(e) => setNewAddress({ ...newAddress, line2: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        placeholder="City"
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        State
                      </label>
                      <input
                        type="text"
                        placeholder="State"
                        value={newAddress.state}
                        onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        placeholder="Pincode"
                        value={newAddress.pincode}
                        onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex space-x-3">
                    <Button type="submit" size="sm">
                      Save Address
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowNewAddressForm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              )}
            </div>

            {/* Payment Method Section */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'razorpay')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Razorpay</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                        <div className="w-6 h-4 bg-gradient-to-r from-red-600 to-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                        <div className="w-6 h-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-white text-xs flex items-center justify-center font-bold">⚡</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">Pay with UPI, Cards, Net Banking, Wallets</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'stripe')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Stripe</span>
                      <div className="flex items-center space-x-1">
                        <div className="w-6 h-4 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">V</div>
                        <div className="w-6 h-4 bg-gradient-to-r from-red-600 to-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">M</div>
                        <div className="w-6 h-4 bg-gradient-to-r from-green-600 to-green-700 rounded text-white text-xs flex items-center justify-center font-bold">AE</div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">International payments with credit/debit cards</p>
                  </div>
                </label>

                <label className="flex items-center space-x-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as 'cod')}
                    className="text-primary-600 focus:ring-primary-500"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">Cash on Delivery</span>
                      <span className="text-sm bg-orange-100 text-orange-600 px-2 py-1 rounded">₹25 extra</span>
                    </div>
                    <p className="text-sm text-gray-600">Pay when your order is delivered</p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              {/* Order Items */}
              <div className="space-y-3 mb-4 border-b border-gray-200 pb-4">
                {items.map((item) => (
                  <div key={item.product._id} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]?.url || '/placeholder-perfume.jpg'}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.product.title}
                      </p>
                      <p className="text-xs text-gray-600">
                        Qty: {item.qty} × ₹{item.product.price.toLocaleString()}
                      </p>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      ₹{(item.product.price * item.qty).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Totals */}
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal ({items.length} items)</span>
                  <span className="font-medium">₹{totals.subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">
                    {totals.shipping === 0 ? (
                      <span className="text-green-600">FREE</span>
                    ) : (
                      `₹${totals.shipping}`
                    )}
                  </span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">GST (18%)</span>
                  <span className="font-medium">₹{totals.tax.toLocaleString()}</span>
                </div>

                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Charges</span>
                    <span className="font-medium">₹25</span>
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    ₹{(totals.total + (paymentMethod === 'cod' ? 25 : 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Helpful message when button is disabled */}
              {!selectedAddressId && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm text-amber-700">
                        Please select or add a shipping address to continue
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handlePlaceOrder}
                disabled={!selectedAddressId || isProcessing}
                className="w-full"
                size="lg"
              >
                {isProcessing ? (
                  <div className="flex items-center space-x-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Processing...</span>
                  </div>
                ) : (
                  `Place Order • ₹${(totals.total + (paymentMethod === 'cod' ? 25 : 0)).toLocaleString()}`
                )}
              </Button>

              {/* Security Badge */}
              <div className="mt-4 text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>256-bit SSL secured</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
