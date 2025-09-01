import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch } from '../../lib/hooks'
import { addToCart, Product } from '../../features/cart/cartSlice'
import Button from '../ui/Button'

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const handleAddToCart = () => {
    dispatch(addToCart({ product, qty: 1 }))
  }

  const handleBuyNow = () => {
    dispatch(addToCart({ product, qty: 1 }))
    navigate('/checkout')
  }

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
      <Link to={`/products/${product.slug}`}>
        <div className="aspect-square bg-gray-100 rounded-t-lg overflow-hidden">
          <img
            src={product.images[0]?.url || '/placeholder-perfume.jpg'}
            alt={product.title}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
          />
        </div>
      </Link>
      
      <div className="p-4">
        <div className="mb-2">
          <span className="text-xs text-purple-600 uppercase tracking-wide font-semibold">
            {product.brand}
          </span>
          <div className="flex gap-1 mt-1">
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {product.gender}
            </span>
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
              {product.family}
            </span>
          </div>
        </div>
        
        <Link to={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mb-2 hover:text-purple-600 transition-colors">
            {product.title}
          </h3>
        </Link>
        
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.description}
        </p>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-gray-900">₹{product.price.toLocaleString()}</span>
            {product.mrp > product.price && (
              <span className="text-sm text-gray-500 line-through">₹{product.mrp.toLocaleString()}</span>
            )}
          </div>
          {product.ratingCount > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-yellow-400">⭐</span>
              <span className="text-sm text-gray-600">
                {product.ratingAvg.toFixed(1)} ({product.ratingCount})
              </span>
            </div>
          )}
        </div>
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              variant="outline"
              className="flex-1"
              size="sm"
            >
              {product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
            </Button>
            <Link to={`/products/${product.slug}`}>
              <Button variant="ghost" size="sm">
                View
              </Button>
            </Link>
          </div>
          <Button
            onClick={handleBuyNow}
            disabled={product.stock === 0}
            className="w-full"
            size="sm"
          >
            {product.stock === 0 ? 'Out of Stock' : 'Buy Now'}
          </Button>
        </div>
        
        {product.stock <= 5 && product.stock > 0 && (
          <p className="text-xs text-orange-600 mt-2">Only {product.stock} left!</p>
        )}
      </div>
    </div>
  )
}

export default ProductCard
