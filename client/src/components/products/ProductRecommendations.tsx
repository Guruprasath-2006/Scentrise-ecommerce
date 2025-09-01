import React, { useState, useEffect } from 'react';
import { Star, Heart, ShoppingCart, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Product {
  _id: string;
  title: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  family: string;
  slug: string;
}

interface ProductRecommendationsProps {
  productId?: string;
  userId?: string;
  type: 'similar' | 'personalized' | 'trending' | 'bought-together';
  title: string;
  limit?: number;
  className?: string;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  userId,
  type,
  title,
  limit = 6,
  className = ''
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);
        let url = '';

        switch (type) {
          case 'similar':
            url = `/api/products/recommendations/${productId}?limit=${limit}`;
            break;
          case 'personalized':
            url = `/api/products/recommendations/personalized/${userId}?limit=${limit}`;
            break;
          case 'trending':
            url = `/api/products/recommendations/trending?limit=${limit}`;
            break;
          case 'bought-together':
            url = `/api/products/recommendations/bought-together/${productId}?limit=${limit}`;
            break;
        }

        const response = await fetch(url, {
          credentials: 'include'
        });

        if (response.ok) {
          const data = await response.json();
          setProducts(data.products || []);
        } else {
          setError('Failed to load recommendations');
        }
      } catch (err) {
        console.error('Error fetching recommendations:', err);
        setError('Failed to load recommendations');
      } finally {
        setLoading(false);
      }
    };

    if ((type === 'similar' || type === 'bought-together') && productId) {
      fetchRecommendations();
    } else if (type === 'personalized' && userId) {
      fetchRecommendations();
    } else if (type === 'trending') {
      fetchRecommendations();
    }
  }, [productId, userId, type, limit]);

  const handleProductClick = (product: Product) => {
    navigate(`/product/${product.slug}`);
  };

  const handleAddToWishlist = async (productId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to wishlist logic
    console.log('Add to wishlist:', productId);
  };

  const handleAddToCart = async (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    // Add to cart logic
    console.log('Add to cart:', product);
  };

  if (loading) {
    return (
      <div className={`py-8 ${className}`}>
        <h3 className="text-2xl font-bold text-gray-800 mb-6">{title}</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: limit }).map((_, index) => (
            <div key={index} className="animate-pulse">
              <div className="bg-gray-200 aspect-square rounded-lg mb-3"></div>
              <div className="bg-gray-200 h-4 rounded mb-2"></div>
              <div className="bg-gray-200 h-3 rounded mb-2"></div>
              <div className="bg-gray-200 h-4 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null;
  }

  return (
    <div className={`py-8 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-gray-800">{title}</h3>
        <button 
          className="flex items-center text-purple-600 hover:text-purple-800 font-medium transition-colors"
          onClick={() => navigate('/catalog')}
        >
          View All
          <ArrowRight className="w-4 h-4 ml-1" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {products.map((product) => (
          <div
            key={product._id}
            className="group cursor-pointer bg-white rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 overflow-hidden"
            onClick={() => handleProductClick(product)}
          >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-50">
              <img
                src={product.image || '/api/placeholder/300/300'}
                alt={product.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/api/placeholder/300/300';
                }}
              />
              
              {/* Wishlist Button */}
              <button
                onClick={(e) => handleAddToWishlist(product._id, e)}
                className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50"
              >
                <Heart className="w-4 h-4 text-gray-600 hover:text-red-500" />
              </button>

              {/* Discount Badge */}
              {product.originalPrice && product.originalPrice > product.price && (
                <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-md text-xs font-medium">
                  {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                </div>
              )}

              {/* Out of Stock Overlay */}
              {!product.inStock && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                  <span className="text-white font-medium">Out of Stock</span>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="p-3">
              <h4 className="font-medium text-gray-800 text-sm line-clamp-2 mb-1 group-hover:text-purple-600 transition-colors">
                {product.title}
              </h4>
              
              <p className="text-xs text-gray-500 mb-2">{product.brand}</p>

              {/* Rating */}
              <div className="flex items-center mb-2">
                <div className="flex items-center">
                  <Star className="w-3 h-3 text-yellow-400 fill-current" />
                  <span className="text-xs text-gray-600 ml-1">
                    {product.rating.toFixed(1)} ({product.reviews})
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-1">
                  <span className="font-bold text-gray-800 text-sm">
                    ₹{product.price.toLocaleString()}
                  </span>
                  {product.originalPrice && product.originalPrice > product.price && (
                    <span className="text-xs text-gray-400 line-through">
                      ₹{product.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart Button */}
              <button
                onClick={(e) => handleAddToCart(product, e)}
                disabled={!product.inStock}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-xs font-medium py-2 rounded-md transition-colors flex items-center justify-center"
              >
                <ShoppingCart className="w-3 h-3 mr-1" />
                {product.inStock ? 'Add to Cart' : 'Out of Stock'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductRecommendations;
