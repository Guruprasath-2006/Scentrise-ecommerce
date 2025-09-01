import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { removeFromCart, changeQuantity, clearCart } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'

const Cart = () => {
  const dispatch = useAppDispatch()
  const { items, totals } = useAppSelector((state) => state.cart)
  
  const handleQuantityChange = (productId: string, newQty: number) => {
    dispatch(changeQuantity({ productId, qty: newQty }))
  }

  const handleRemoveItem = (productId: string) => {
    dispatch(removeFromCart(productId))
  }

  const handleClearCart = () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      dispatch(clearCart())
    }
  }

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="mb-8">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Looks like you haven't added any fragrances to your cart yet. 
            Discover our amazing collection of premium perfumes.
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
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
        <div className="text-sm text-gray-600">
          {items.length} {items.length === 1 ? 'item' : 'items'}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
            {/* Cart Items Header */}
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex justify-between items-center">
                <h3 className="font-semibold text-gray-900">Items in your cart</h3>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleClearCart}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Clear Cart
                </Button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="divide-y divide-gray-200">
              {items.map((item) => (
                <div key={item.product._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/products/${item.product.slug}`}>
                        <img
                          src={item.product.images[0]?.url || '/placeholder-perfume.jpg'}
                          alt={item.product.title}
                          className="w-20 h-20 object-cover rounded-lg hover:opacity-75 transition-opacity"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between">
                        <div className="flex-1">
                          <Link to={`/products/${item.product.slug}`}>
                            <h4 className="text-lg font-semibold text-gray-900 hover:text-primary-600 transition-colors">
                              {item.product.title}
                            </h4>
                          </Link>
                          <p className="text-sm text-gray-600 mt-1">
                            by {item.product.brand}
                          </p>
                          <div className="flex items-center space-x-2 mt-2">
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {item.product.gender}
                            </span>
                            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                              {item.product.family}
                            </span>
                          </div>
                        </div>

                        {/* Price */}
                        <div className="text-right ml-4">
                          <div className="text-lg font-semibold text-gray-900">
                            ₹{item.product.price.toLocaleString()}
                          </div>
                          {item.product.mrp > item.product.price && (
                            <div className="text-sm text-gray-500 line-through">
                              ₹{item.product.mrp.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Quantity and Remove */}
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center space-x-3">
                          <span className="text-sm text-gray-600">Quantity:</span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.qty - 1)}
                              disabled={item.qty <= 1}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              −
                            </button>
                            <span className="px-3 py-1 text-center min-w-[50px] border-x border-gray-300">
                              {item.qty}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.product._id, item.qty + 1)}
                              disabled={item.qty >= item.product.stock}
                              className="px-3 py-1 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              +
                            </button>
                          </div>
                          {item.product.stock <= 5 && (
                            <span className="text-xs text-orange-600">
                              Only {item.product.stock} left!
                            </span>
                          )}
                        </div>

                        <div className="flex items-center space-x-4">
                          <div className="text-lg font-bold text-gray-900">
                            ₹{(item.product.price * item.qty).toLocaleString()}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.product._id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="mt-6">
            <Link to="/catalog">
              <Button variant="outline">
                ← Continue Shopping
              </Button>
            </Link>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            
            <div className="space-y-3 mb-4">
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

              {totals.shipping === 0 && totals.subtotal >= 999 && (
                <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
                  🎉 You saved ₹49 on shipping!
                </div>
              )}

              {totals.shipping > 0 && (
                <div className="text-xs text-orange-600 bg-orange-50 p-2 rounded">
                  Add ₹{(999 - totals.subtotal).toLocaleString()} more for FREE shipping
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-4 mb-6">
              <div className="flex justify-between">
                <span className="text-lg font-semibold text-gray-900">Total</span>
                <span className="text-lg font-bold text-gray-900">₹{totals.total.toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <Link to="/checkout" className="block">
                <Button className="w-full" size="lg">
                  Proceed to Checkout
                </Button>
              </Link>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                  </svg>
                  <span>Secure checkout</span>
                </div>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-sm text-gray-600 mb-3">We accept:</div>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-5 bg-gradient-to-r from-blue-600 to-blue-700 rounded text-white text-xs flex items-center justify-center font-bold">
                  VISA
                </div>
                <div className="w-8 h-5 bg-gradient-to-r from-red-600 to-orange-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  MC
                </div>
                <div className="w-8 h-5 bg-gradient-to-r from-purple-600 to-pink-600 rounded text-white text-xs flex items-center justify-center font-bold">
                  UPI
                </div>
                <div className="text-xs text-gray-500">& more</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Cart
