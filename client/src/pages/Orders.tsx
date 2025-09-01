import { useEffect } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { getUserOrders, getOrderById, clearCurrentOrder } from '../features/orders/orderSlice'
import Button from '../components/ui/Button'

const Orders = () => {
  const { orderId } = useParams()
  const location = useLocation()
  const dispatch = useAppDispatch()
  const { orders, currentOrder, isLoading } = useAppSelector((state) => state.orders)

  useEffect(() => {
    if (orderId) {
      dispatch(getOrderById(orderId))
    } else {
      dispatch(getUserOrders({}))
      dispatch(clearCurrentOrder())
    }
  }, [dispatch, orderId])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-100',
      confirmed: 'text-blue-600 bg-blue-100',
      processing: 'text-purple-600 bg-purple-100',
      shipped: 'text-indigo-600 bg-indigo-100',
      delivered: 'text-green-600 bg-green-100',
      cancelled: 'text-red-600 bg-red-100'
    }
    return colors[status as keyof typeof colors] || 'text-gray-600 bg-gray-100'
  }

  // Show order confirmation if redirected from checkout
  if (location.state?.orderCreated && currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Order Placed Successfully!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase! Your order has been confirmed and will be processed shortly.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <div className="text-left space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Order ID:</span>
                <span className="text-primary-600 font-mono">{currentOrder.orderId}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Total:</span>
                <span className="font-bold">₹{currentOrder.total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(currentOrder.status)}`}>
                  {currentOrder.status.toUpperCase()}
                </span>
              </div>
              {currentOrder.trackingId && (
                <div className="flex justify-between">
                  <span className="font-medium">Tracking ID:</span>
                  <span className="font-mono text-sm">{currentOrder.trackingId}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Link to={`/orders/${currentOrder._id}`}>
              <Button size="lg" className="w-full">
                View Order Details
              </Button>
            </Link>
            <Link to="/catalog">
              <Button variant="outline" size="lg" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    )
  }

  // Show single order details
  if (orderId && currentOrder) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Link to="/orders" className="text-primary-600 hover:text-primary-700 text-sm mb-2 inline-block">
                ← Back to Orders
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Order Details</h1>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Order ID</div>
              <div className="font-mono text-primary-600 font-medium">{currentOrder.orderId}</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Items Ordered</h3>
                <div className="space-y-4">
                  {currentOrder.items.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4 border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                      <img
                        src={item.product.images[0]?.url || '/placeholder-perfume.jpg'}
                        alt={item.product.title}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{item.product.title}</h4>
                        <p className="text-sm text-gray-600">by {item.product.brand}</p>
                        <p className="text-sm text-gray-600">Qty: {item.qty}</p>
                      </div>
                      <div className="text-lg font-medium">
                        ₹{(item.priceAtPurchase * item.qty).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Status Timeline */}
              <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold mb-4">Order Status</h3>
                <div className="space-y-4">
                  {currentOrder.statusHistory?.map((status, index) => (
                    <div key={index} className="flex items-start space-x-3">
                      <div className={`w-3 h-3 rounded-full mt-2 ${
                        status.status === currentOrder.status ? 'bg-primary-600' : 'bg-gray-300'
                      }`}></div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(status.status)}`}>
                            {status.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(status.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{status.message}</p>
                        {status.location && (
                          <p className="text-xs text-gray-500 mt-1">📍 {status.location}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>₹{currentOrder.subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Shipping</span>
                    <span>{currentOrder.shipping === 0 ? 'FREE' : `₹${currentOrder.shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Tax (18%)</span>
                    <span>₹{currentOrder.tax.toLocaleString()}</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-semibold">
                      <span>Total</span>
                      <span>₹{currentOrder.total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Shipping Address</h3>
                <div className="text-sm">
                  <p className="font-medium">{currentOrder.shippingAddress.label}</p>
                  <p>{currentOrder.shippingAddress.line1}</p>
                  {currentOrder.shippingAddress.line2 && <p>{currentOrder.shippingAddress.line2}</p>}
                  <p>{currentOrder.shippingAddress.city}, {currentOrder.shippingAddress.state}</p>
                  <p>{currentOrder.shippingAddress.pincode}</p>
                  <p className="mt-2 text-gray-600">📞 {currentOrder.shippingAddress.phone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                {currentOrder.trackingId && (
                  <Link to={`/track/${currentOrder.trackingId}`}>
                    <Button variant="outline" className="w-full">
                      Track Package
                    </Button>
                  </Link>
                )}
                {['pending', 'confirmed'].includes(currentOrder.status) && (
                  <Button variant="outline" className="w-full text-red-600 border-red-300 hover:bg-red-50">
                    Cancel Order
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Show orders list
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="animate-spin mx-auto h-12 w-12 border-4 border-primary-600 border-t-transparent rounded-full"></div>
          <p className="mt-4 text-gray-600">Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l-1 8H6L5 9z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">No Orders Yet</h1>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            You haven't placed any orders yet. Start shopping to see your orders here.
          </p>
          <Link to="/catalog">
            <Button size="lg">
              Start Shopping
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      
      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order._id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center space-x-3">
                  <span className="font-mono text-primary-600 font-medium">{order.orderId}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  Ordered on {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">₹{order.total.toLocaleString()}</div>
                <div className="text-sm text-gray-600">{order.items.length} items</div>
              </div>
            </div>

            <div className="flex items-center space-x-4 mb-4">
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

            <div className="flex items-center justify-between">
              <div>
                {order.trackingId && (
                  <div className="text-sm text-gray-600">
                    Tracking: <span className="font-mono">{order.trackingId}</span>
                  </div>
                )}
              </div>
              <div className="flex space-x-3">
                {order.trackingId && (
                  <Link to={`/track/${order.trackingId}`}>
                    <Button variant="outline" size="sm">
                      Track
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
    </div>
  )
}

export default Orders
