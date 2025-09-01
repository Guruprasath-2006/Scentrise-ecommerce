import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { trackOrder, clearTrackingInfo } from '../features/orders/orderSlice'
import Button from '../components/ui/Button'

const TrackOrder = () => {
  const { trackingId: urlTrackingId } = useParams()
  const dispatch = useAppDispatch()
  const { trackingInfo, isLoading, error } = useAppSelector((state) => state.orders)
  
  const [trackingId, setTrackingId] = useState(urlTrackingId || '')

  const handleTrackOrder = async (e: React.FormEvent) => {
    e.preventDefault()
    if (trackingId.trim()) {
      dispatch(trackOrder(trackingId.trim()))
    }
  }

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'confirmed':
        return '✅'
      case 'processing':
        return '📦'
      case 'shipped':
        return '🚚'
      case 'delivered':
        return '🎉'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Track Your Order</h1>
          <p className="text-gray-600">
            Enter your order ID or tracking ID to get real-time updates on your package.
          </p>
        </div>

        {/* Tracking Form */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
          <form onSubmit={handleTrackOrder} className="flex space-x-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Enter Order ID or Tracking ID (e.g., SC1725024960123 or TRK1725024960123456)"
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                required
              />
            </div>
            <Button type="submit" disabled={isLoading} className="px-8">
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Tracking...</span>
                </div>
              ) : (
                'Track Order'
              )}
            </Button>
          </form>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-8">
            <div className="flex items-center space-x-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="font-medium text-red-800">Order Not Found</h3>
                <p className="text-red-700 text-sm mt-1">{error}</p>
              </div>
            </div>
            <div className="mt-4">
              <Button
                variant="outline"
                onClick={() => {
                  dispatch(clearTrackingInfo())
                  setTrackingId('')
                }}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                Try Again
              </Button>
            </div>
          </div>
        )}

        {/* Tracking Results */}
        {trackingInfo && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Order Summary</h2>
                  <p className="text-gray-600 text-sm">Order placed on {formatDate(trackingInfo.createdAt)}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-primary-600 font-medium">{trackingInfo.orderId}</div>
                  {trackingInfo.trackingId && (
                    <div className="text-sm text-gray-600">Tracking: {trackingInfo.trackingId}</div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-3xl mb-2">{getStatusIcon(trackingInfo.status)}</div>
                  <div className={`inline-block px-3 py-1 text-sm rounded-full font-medium ${getStatusColor(trackingInfo.status)}`}>
                    {trackingInfo.status.toUpperCase()}
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-gray-400 mb-2">📦</div>
                  <div className="text-sm text-gray-600">Items</div>
                  <div className="font-medium">{trackingInfo.itemCount} {trackingInfo.itemCount === 1 ? 'item' : 'items'}</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-gray-400 mb-2">📍</div>
                  <div className="text-sm text-gray-600">Shipping to</div>
                  <div className="font-medium">{trackingInfo.shippingCity}</div>
                </div>
              </div>

              {trackingInfo.estimatedDelivery && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <div className="text-sm font-medium text-blue-800">Estimated Delivery</div>
                      <div className="text-blue-700">{formatDate(trackingInfo.estimatedDelivery)}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Status Timeline */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <h3 className="text-lg font-semibold mb-6">Order Timeline</h3>
              <div className="space-y-6">
                {trackingInfo.statusHistory?.map((status, index) => (
                  <div key={index} className="relative">
                    {index < trackingInfo.statusHistory.length - 1 && (
                      <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-200"></div>
                    )}
                    <div className="flex items-start space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
                        status.status === trackingInfo.status 
                          ? 'bg-primary-600 text-white' 
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {getStatusIcon(status.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-3 mb-1">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(status.status)}`}>
                            {status.status.toUpperCase()}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatDate(status.timestamp)}
                          </span>
                        </div>
                        <p className="text-gray-900 font-medium">{status.message}</p>
                        {status.location && (
                          <p className="text-sm text-gray-600 mt-1 flex items-center space-x-1">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{status.location}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Help Section */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Need Help?</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-primary-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-gray-600">support@scentrise.com</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <svg className="w-6 h-6 text-primary-600 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <div>
                    <div className="font-medium">Phone Support</div>
                    <div className="text-sm text-gray-600">+91 1800-123-4567</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default TrackOrder
