import { useEffect, useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { fetchProductBySlug, clearCurrentProduct } from '../features/products/productsSlice'
import { addToCart } from '../features/cart/cartSlice'
import Button from '../components/ui/Button'

const ProductDetail = () => {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { currentProduct: product, isLoading, error } = useAppSelector((state) => state.products)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    if (slug) {
      dispatch(fetchProductBySlug(slug))
    }
    
    return () => {
      dispatch(clearCurrentProduct())
    }
  }, [dispatch, slug])

  const handleAddToCart = () => {
    if (product) {
      dispatch(addToCart({ product, qty: quantity }))
    }
  }

  const handleBuyNow = () => {
    if (product) {
      dispatch(addToCart({ product, qty: quantity }))
      navigate('/checkout')
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Product Not Found</h2>
          <p className="text-gray-600 mb-4">{error || 'The product you are looking for does not exist.'}</p>
          <Link to="/catalog">
            <Button>Browse Products</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-8">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Link to="/" className="hover:text-purple-600">Home</Link>
          <span>/</span>
          <Link to="/catalog" className="hover:text-purple-600">Catalog</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{product.title}</span>
        </div>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Product Images */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={product.images[selectedImageIndex]?.url || '/placeholder-perfume.jpg'}
              alt={product.title}
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Thumbnail Images */}
          {product.images.length > 1 && (
            <div className="flex space-x-2">
              {product.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-20 h-20 rounded-lg overflow-hidden border-2 ${
                    selectedImageIndex === index ? 'border-purple-600' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image.url}
                    alt={`${product.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          {/* Brand and Categories */}
          <div className="space-y-2">
            <div className="text-sm text-purple-600 uppercase tracking-wide font-semibold">
              {product.brand}
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {product.gender}
              </span>
              <span className="px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                {product.family}
              </span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>

          {/* Rating */}
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                <span className="text-yellow-400 text-lg">⭐</span>
                <span className="ml-1 text-gray-700 font-medium">
                  {product.ratingAvg.toFixed(1)}
                </span>
              </div>
              <span className="text-gray-500">({product.ratingCount} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">
                ₹{product.price.toLocaleString()}
              </span>
              {product.mrp > product.price && (
                <>
                  <span className="text-xl text-gray-500 line-through">
                    ₹{product.mrp.toLocaleString()}
                  </span>
                  <span className="text-sm bg-green-100 text-green-600 px-2 py-1 rounded">
                    {Math.round(((product.mrp - product.price) / product.mrp) * 100)}% OFF
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <h3 className="font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 leading-relaxed">{product.description}</p>
          </div>

          {/* Fragrance Notes */}
          {product.notes && product.notes.length > 0 && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Fragrance Notes</h3>
              <div className="flex flex-wrap gap-2">
                {product.notes.map((note, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm bg-purple-50 text-purple-700 rounded-full"
                  >
                    {note}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Stock Status */}
          <div className="space-y-1">
            {product.stock > 0 ? (
              <>
                <p className="text-green-600 font-medium">✓ In Stock</p>
                {product.stock <= 5 && (
                  <p className="text-orange-600 text-sm">Only {product.stock} left!</p>
                )}
              </>
            ) : (
              <p className="text-red-600 font-medium">✗ Out of Stock</p>
            )}
          </div>

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Quantity</label>
              <div className="flex items-center border border-gray-300 rounded-md w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={quantity <= 1}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  −
                </button>
                <span className="px-4 py-2 border-x border-gray-300 min-w-[60px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  disabled={quantity >= product.stock}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            <div className="flex gap-3">
              <Button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                variant="outline"
                className="flex-1"
                size="lg"
              >
                {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
              </Button>
              <Link to="/cart">
                <Button variant="ghost" size="lg">
                  View Cart
                </Button>
              </Link>
            </div>
            
            <Button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              className="w-full"
              size="lg"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
            </Button>
          </div>

          {/* Additional Info */}
          <div className="border-t border-gray-200 pt-6">
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <span>🚚</span>
                <span>Free shipping on orders above ₹999</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>↩️</span>
                <span>30-day return policy</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>🔒</span>
                <span>Secure payment</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductDetail
