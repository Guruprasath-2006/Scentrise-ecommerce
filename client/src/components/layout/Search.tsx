import { useState, useEffect, useRef, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../../lib/hooks'
import { fetchProducts } from '../../features/products/productsSlice'

interface SearchResult {
  _id: string
  title: string
  brand: string
  slug: string
  price: number
  images: { url: string }[]
  family: string
}

interface SearchProps {
  isOpen: boolean
  onClose: () => void
}

const Search = ({ isOpen, onClose }: SearchProps) => {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products } = useAppSelector((state) => state.products)
  
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  const [popularSearches] = useState([
    'Dior Sauvage',
    'Chanel No 5',
    'Tom Ford',
    'Creed Aventus',
    'Woody fragrances',
    'Floral perfumes',
    'Men\'s cologne',
    'Women\'s perfume'
  ])

  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    // Load recent searches from localStorage
    const saved = localStorage.getItem('recentSearches')
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Custom debounce hook
  const useDebounce = (callback: (query: string) => void, delay: number) => {
    const timeoutRef = useRef<NodeJS.Timeout>()
    
    return useCallback((query: string) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      timeoutRef.current = setTimeout(() => callback(query), delay)
    }, [callback, delay])
  }

  const performSearch = async (searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([])
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      await dispatch(fetchProducts({ q: searchQuery, limit: 8 }))
      // Filter products based on search query
      const filtered = products.filter(product =>
        product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.family.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 8)
      setResults(filtered)
    } catch (error) {
      console.error('Search failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const debouncedSearch = useDebounce(performSearch, 300)

  useEffect(() => {
    debouncedSearch(query)
  }, [query, debouncedSearch, products])

  const handleSearch = (searchQuery: string) => {
    if (searchQuery.trim()) {
      // Add to recent searches
      const updated = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5)
      setRecentSearches(updated)
      localStorage.setItem('recentSearches', JSON.stringify(updated))
      
      // Navigate to catalog with search
      navigate(`/catalog?q=${encodeURIComponent(searchQuery)}`)
      onClose()
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch(query)
    }
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount)
  }

  const clearRecentSearches = () => {
    setRecentSearches([])
    localStorage.removeItem('recentSearches')
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      
      {/* Search Modal */}
      <div className="relative min-h-screen flex items-start justify-center p-4 pt-16">
        <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
          {/* Search Header */}
          <div className="flex items-center p-4 border-b border-gray-200">
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Search for perfumes, brands, or fragrance families..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Search Content */}
          <div className="max-h-96 overflow-y-auto">
            {query.trim().length >= 2 ? (
              // Search Results
              <div className="p-4">
                {results.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-medium text-gray-900">Search Results</h3>
                      <button
                        onClick={() => handleSearch(query)}
                        className="text-sm text-primary-600 hover:text-primary-700"
                      >
                        View all results
                      </button>
                    </div>
                    <div className="space-y-2">
                      {results.map((product) => (
                        <Link
                          key={product._id}
                          to={`/products/${product.slug}`}
                          onClick={onClose}
                          className="flex items-center p-3 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <img
                            src={product.images[0]?.url || '/placeholder-perfume.jpg'}
                            alt={product.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="ml-3 flex-1">
                            <h4 className="text-sm font-medium text-gray-900">{product.title}</h4>
                            <p className="text-xs text-gray-600">{product.brand} • {product.family}</p>
                            <p className="text-sm font-medium text-primary-600">
                              {formatCurrency(product.price)}
                            </p>
                          </div>
                          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : !isLoading ? (
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Try different keywords or browse our categories
                    </p>
                  </div>
                ) : null}
              </div>
            ) : (
              // Default Search Content
              <div className="p-4 space-y-6">
                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium text-gray-900">Recent Searches</h3>
                      <button
                        onClick={clearRecentSearches}
                        className="text-xs text-gray-500 hover:text-gray-700"
                      >
                        Clear all
                      </button>
                    </div>
                    <div className="space-y-1">
                      {recentSearches.map((search, index) => (
                        <button
                          key={index}
                          onClick={() => {
                            setQuery(search)
                            handleSearch(search)
                          }}
                          className="flex items-center w-full p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-sm text-gray-700">{search}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Searches */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Popular Searches</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {popularSearches.map((search, index) => (
                      <button
                        key={index}
                        onClick={() => {
                          setQuery(search)
                          handleSearch(search)
                        }}
                        className="flex items-center p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        <span className="text-sm text-gray-700">{search}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quick Categories */}
                <div>
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Browse by Category</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { name: 'Men\'s Fragrances', filter: 'gender=men' },
                      { name: 'Women\'s Fragrances', filter: 'gender=women' },
                      { name: 'Woody Scents', filter: 'family=woody' },
                      { name: 'Floral Scents', filter: 'family=floral' },
                      { name: 'Fresh Scents', filter: 'family=fresh' },
                      { name: 'Oriental Scents', filter: 'family=oriental' }
                    ].map((category, index) => (
                      <Link
                        key={index}
                        to={`/catalog?${category.filter}`}
                        onClick={onClose}
                        className="flex items-center p-2 text-left rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <svg className="w-4 h-4 text-gray-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                        <span className="text-sm text-gray-700">{category.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
