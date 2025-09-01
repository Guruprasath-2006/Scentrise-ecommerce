import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { clearCart } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'
import api from '../lib/api'

interface RazorpayResponse {
  razorpay_payment_id: string
  razorpay_order_id: string
  razorpay_signature: string
}

interface OrderData {
  orderId: string
  amount: number
  currency: string
  items: any[]
  shippingAddress: any
}

declare global {
  interface Window {
    Razorpay: any
  }
}

const Payment = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  
  const [orderData, setOrderData] = useState<OrderData | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'razorpay' | 'stripe' | 'cod'>('razorpay')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Get order data from navigation state
    const data = location.state?.orderData
    if (!data) {
      navigate('/checkout')
      return
    }
    setOrderData(data)

    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [location.state, navigate])

  const handleRazorpayPayment = async () => {
    if (!orderData || !user) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create Razorpay order
      const response = await api.post('/payments/razorpay/create', {
        amount: orderData.amount,
        currency: orderData.currency,
        receipt: orderData.orderId
      })

      const razorpayOrderId = response.data.orderId

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID || 'rzp_test_dummy',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Scentrise',
        description: 'Perfume Purchase',
        order_id: razorpayOrderId,
        prefill: {
          name: user.name,
          email: user.email,
          contact: orderData.shippingAddress.phone
        },
        theme: {
          color: '#4F46E5'
        },
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await api.post('/payments/razorpay/verify', {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
              orderData
            })

            if (verifyResponse.data.success) {
              // Clear cart and redirect to success
              dispatch(clearCart())
              navigate(`/orders/${verifyResponse.data.order._id}`, {
                state: { 
                  paymentSuccess: true,
                  orderDetails: verifyResponse.data.order
                }
              })
            } else {
              setError('Payment verification failed')
            }
          } catch (error: any) {
            setError(error.response?.data?.message || 'Payment verification failed')
          } finally {
            setIsProcessing(false)
          }
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false)
            setError('Payment cancelled by user')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to initialize payment')
      setIsProcessing(false)
    }
  }

  const handleStripePayment = async () => {
    setError('Stripe payment integration coming soon!')
  }

  const handleCODPayment = async () => {
    if (!orderData) return

    setIsProcessing(true)
    setError(null)

    try {
      // Create COD order
      const response = await api.post('/orders', {
        ...orderData,
        paymentMethod: 'cod',
        paymentStatus: 'pending'
      })

      if (response.data.success) {
        dispatch(clearCart())
        navigate(`/orders/${response.data.order._id}`, {
          state: {
            orderCreated: true,
            orderDetails: response.data.order
          }
        })
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to place COD order')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePayment = () => {
    switch (paymentMethod) {
      case 'razorpay':
        handleRazorpayPayment()
        break
      case 'stripe':
        handleStripePayment()
        break
      case 'cod':
        handleCODPayment()
        break
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount / 100)
  }

  if (!orderData) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Invalid Payment Request</h2>
          <p className="text-gray-600 mb-8">Please go back to checkout to continue</p>
          <Button onClick={() => navigate('/checkout')}>Back to Checkout</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Choose your preferred payment method</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Payment Methods */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Payment Method</h2>
              
              <div className="space-y-4">
                {/* Razorpay */}
                <div className="flex items-center p-4 border rounded-lg">
                  <input
                    type="radio"
                    id="razorpay"
                    name="paymentMethod"
                    value="razorpay"
                    checked={paymentMethod === 'razorpay'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <label htmlFor="razorpay" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Credit/Debit Card, UPI, Net Banking</p>
                        <p className="text-sm text-gray-600">Secure payment via Razorpay</p>
                      </div>
                      <div className="flex space-x-2">
                        <img src="/visa.png" alt="Visa" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/mastercard.png" alt="Mastercard" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                        <img src="/upi.png" alt="UPI" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    </div>
                  </label>
                </div>

                {/* Stripe */}
                <div className="flex items-center p-4 border rounded-lg opacity-50">
                  <input
                    type="radio"
                    id="stripe"
                    name="paymentMethod"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                    disabled
                  />
                  <label htmlFor="stripe" className="flex-1 cursor-not-allowed">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Stripe Payment</p>
                        <p className="text-sm text-gray-600">Coming soon</p>
                      </div>
                      <div className="flex space-x-2">
                        <img src="/stripe.png" alt="Stripe" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
                      </div>
                    </div>
                  </label>
                </div>

                {/* Cash on Delivery */}
                <div className="flex items-center p-4 border rounded-lg">
                  <input
                    type="radio"
                    id="cod"
                    name="paymentMethod"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="mr-3"
                  />
                  <label htmlFor="cod" className="flex-1 cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">Cash on Delivery</p>
                        <p className="text-sm text-gray-600">Pay when you receive the order (+₹25 handling fee)</p>
                      </div>
                      <div className="text-orange-600">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-4">
                {orderData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <img
                      src={item.product.images[0]?.url || '/placeholder-perfume.jpg'}
                      alt={item.product.title}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{item.product.title}</p>
                      <p className="text-xs text-gray-600">Qty: {item.qty}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      ₹{(item.product.price * item.qty).toLocaleString()}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">{formatCurrency(orderData.amount - 2500)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">₹25.00</span>
                </div>
                {paymentMethod === 'cod' && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">COD Fee</span>
                    <span className="font-medium">₹25.00</span>
                  </div>
                )}
                <div className="border-t pt-2 flex justify-between text-base font-semibold">
                  <span>Total</span>
                  <span>{formatCurrency(orderData.amount + (paymentMethod === 'cod' ? 2500 : 0))}</span>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
                        <path fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    `Pay ${formatCurrency(orderData.amount + (paymentMethod === 'cod' ? 2500 : 0))}`
                  )}
                </Button>
              </div>

              {/* Security Note */}
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="ml-2">
                    <p className="text-xs text-green-800 font-medium">Secure Payment</p>
                    <p className="text-xs text-green-700">Your payment information is encrypted and secure</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back to Checkout */}
        <div className="mt-8 text-center">
          <button
            onClick={() => navigate('/checkout')}
            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
          >
            ← Back to Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

export default Payment
