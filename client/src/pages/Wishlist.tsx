import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { fetchWishlist, removeFromWishlist } from '../features/wishlist/wishlistSlice'
import { addToCart } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'

const Wishlist = () => {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((state) => state.auth)
  const { items, isLoading } = useAppSelector((state) => state.wishlist)

  useEffect(() => {
    if (user) {
      dispatch(fetchWishlist())
    }
  }, [dispatch, user])

  const handleRemoveFromWishlist = (productId: string) => {
    dispatch(removeFromWishlist(productId))
  }

  const handleAddToCart = (productId: string) => {
    const product = items.find((item: any) => item._id === productId)
    if (product) {
      dispatch(addToCart({ product, qty: 1 }))
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h2>
          <p className="text-gray-600 mb-8">You need to be logged in to view your wishlist</p>
          <Link to="/login">
            <Button>Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">My Wishlist</h1>
            <p className="text-gray-600">
              {items.length} item{items.length !== 1 ? 's' : ''} saved for later
            </p>
          </div>
          <Link to="/catalog">
            <Button variant="outline">Continue Shopping</Button>
          </Link>
        </div>

        {items.length > 0 ? (
          <>
            {/* Wishlist Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {items.map((product: any) => (
                <div key={product._id} className="bg-white rounded-lg shadow-sm border overflow-hidden">
                  {/* Product Image */}
                  <div className="relative">
                    <Link to={`/products/${product.slug}`}>
                      <img
                        src={product.images[0]?.url || '/placeholder-perfume.jpg'}
                        alt={product.title}
                        className="w-full h-48 object-cover"
                      />
                    </Link>
                    <button
                      onClick={() => handleRemoveFromWishlist(product._id)}
                      className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-colors"
                      title="Remove from wishlist"
                    >
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <Link to={`/products/${product.slug}`}>
                      <h3 className="font-medium text-gray-900 hover:text-primary-600 transition-colors">
                        {product.title}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-600 mt-1">{product.brand}</p>
                    
                    {/* Rating */}
                    <div className="flex items-center mt-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <svg
                            key={star}
                            className={`w-4 h-4 ${
                              star <= product.ratingAvg ? 'text-yellow-400' : 'text-gray-300'
                            }`}
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-sm text-gray-600 ml-1">
                        ({product.ratingCount})
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between mt-3">
                      <div>
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(product.price)}
                        </span>
                        {product.mrp > product.price && (
                          <span className="text-sm text-gray-500 line-through ml-2">
                            {formatCurrency(product.mrp)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stock Status */}
                    <div className="mt-2">
                      {product.stock > 0 ? (
                        <span className="text-sm text-green-600">In Stock</span>
                      ) : (
                        <span className="text-sm text-red-600">Out of Stock</span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="mt-4 space-y-2">
                      <Button
                        onClick={() => handleAddToCart(product._id)}
                        disabled={product.stock === 0}
                        className="w-full"
                        size="sm"
                      >
                        {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
                      </Button>
                      <Link to={`/products/${product.slug}`} className="block">
                        <Button variant="outline" className="w-full" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Value: {formatCurrency(items.reduce((sum: number, item: any) => sum + item.price, 0))}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Save even more with our special offers
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    onClick={() => {
                      items.forEach((item: any) => {
                        if (item.stock > 0) {
                          dispatch(addToCart({ product: item, qty: 1 }))
                        }
                      })
                    }}
                  >
                    Add All to Cart
                  </Button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-16">
            <div className="text-gray-500 mb-8">
              <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your wishlist is empty</h2>
            <p className="text-gray-600 mb-8">
              Start adding your favorite perfumes to your wishlist
            </p>
            <Link to="/catalog">
              <Button>Browse Products</Button>
            </Link>
          </div>
        )}

        {/* Recommendations */}
        {items.length > 0 && (
          <div className="mt-12">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">You might also like</h3>
            <div className="text-center py-8 text-gray-500">
              <p>Personalized recommendations coming soon!</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Wishlist
