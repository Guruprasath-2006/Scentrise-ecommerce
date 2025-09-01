import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../lib/hooks'
import { fetchProducts, setFilters, clearError, ProductFilters } from '../features/products/productsSlice'
import Button from '../components/ui/Button'
import ProductCard from '../components/products/ProductCard'
import FlipkartStyleFilters from '../components/products/FlipkartStyleFilters'
import FilterButton from '../components/products/FilterButton'
import ActiveFilters from '../components/products/ActiveFilters'
import SortDropdown from '../components/products/SortDropdown'
import Breadcrumb from '../components/ui/Breadcrumb'

const Catalog = () => {
  const dispatch = useAppDispatch()
  const [searchParams, setSearchParams] = useSearchParams()
  const { products, pagination, filters, isLoading, error } = useAppSelector((state) => state.products)
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)
  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false)

  // Initialize filters from URL parameters on component mount
  useEffect(() => {
    const urlFilters: ProductFilters = {
      page: 1,
      limit: 12,
      sort: '-createdAt',
    }

    // Read URL parameters and apply them as filters
    const gender = searchParams.get('gender')
    const family = searchParams.get('family')
    const q = searchParams.get('q')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const sort = searchParams.get('sort')

    if (gender) urlFilters.gender = gender as 'men' | 'women' | 'unisex'
    if (family) urlFilters.family = family as 'citrus' | 'floral' | 'woody' | 'oriental' | 'fresh' | 'gourmand'
    if (q) urlFilters.q = q
    if (minPrice) urlFilters.minPrice = Number(minPrice)
    if (maxPrice) urlFilters.maxPrice = Number(maxPrice)
    if (sort) urlFilters.sort = sort

    setLocalFilters(urlFilters)
    dispatch(setFilters(urlFilters))
  }, [searchParams, dispatch])

  useEffect(() => {
    dispatch(fetchProducts(filters))
  }, [dispatch, filters])

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    const updatedFilters = { ...localFilters, ...newFilters, page: 1 }
    setLocalFilters(updatedFilters)
    dispatch(setFilters(updatedFilters))

    // Update URL parameters to reflect current filters
    const newSearchParams = new URLSearchParams()
    if (updatedFilters.gender) newSearchParams.set('gender', updatedFilters.gender)
    if (updatedFilters.family) newSearchParams.set('family', updatedFilters.family)
    if (updatedFilters.q) newSearchParams.set('q', updatedFilters.q)
    if (updatedFilters.minPrice) newSearchParams.set('minPrice', updatedFilters.minPrice.toString())
    if (updatedFilters.maxPrice) newSearchParams.set('maxPrice', updatedFilters.maxPrice.toString())
    if (updatedFilters.sort && updatedFilters.sort !== '-createdAt') newSearchParams.set('sort', updatedFilters.sort)
    
    setSearchParams(newSearchParams, { replace: true })
  }

  const handlePageChange = (page: number) => {
    const updatedFilters = { ...filters, page }
    dispatch(setFilters(updatedFilters))
  }

  const resetFilters = () => {
    const defaultFilters = { page: 1, limit: 12, sort: '-createdAt' }
    setLocalFilters(defaultFilters)
    dispatch(setFilters(defaultFilters))
    
    // Clear URL parameters
    setSearchParams({}, { replace: true })
  }

  const removeFilter = (filterKey: keyof ProductFilters) => {
    const updatedFilters = { ...localFilters }
    if (filterKey === 'minPrice') {
      updatedFilters.minPrice = undefined
    } else if (filterKey === 'maxPrice') {
      updatedFilters.maxPrice = undefined
    } else if (filterKey === 'sort') {
      updatedFilters.sort = '-createdAt'
    } else {
      delete updatedFilters[filterKey]
    }
    
    handleFilterChange(updatedFilters)
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Products</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            <Button onClick={() => {
              dispatch(clearError())
              dispatch(fetchProducts({ ...filters, page: 1 }))
            }}>
              Try Again
            </Button>
            <Button 
              variant="secondary" 
              onClick={() => {
                // Clear error state and reset filters
                dispatch(clearError())
                resetFilters()
              }}
            >
              Reset Filters
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <Breadcrumb 
        gender={localFilters.gender}
        family={localFilters.family}
        searchQuery={localFilters.q}
      />

      {/* Header with Filter Button */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-2 font-serif">
              {localFilters.gender 
                ? `${localFilters.gender.charAt(0).toUpperCase() + localFilters.gender.slice(1)}'s Fragrances`
                : localFilters.q 
                  ? `Search Results for "${localFilters.q}"`
                  : 'Perfume Collection'
              }
            </h1>
            <p className="text-gray-600">
              {localFilters.gender 
                ? `Discover our premium ${localFilters.gender} fragrance collection`
                : localFilters.q 
                  ? `Found ${products.length} products matching your search`
                  : 'Discover our curated selection of luxury fragrances'
              }
            </p>
          </div>
          
          {/* Filter and Sort Controls */}
          <div className="flex flex-col sm:flex-row gap-3 md:items-center">
            <SortDropdown 
              filters={localFilters}
              onSortChange={(sort) => handleFilterChange({ sort })}
              className="order-2 sm:order-1"
            />
            <FilterButton 
              filters={localFilters}
              onClick={() => setIsFilterSidebarOpen(true)}
              className="order-1 sm:order-2"
            />
          </div>
        </div>

        {/* Active Filters */}
        <ActiveFilters 
          filters={localFilters}
          onFilterRemove={removeFilter}
          onClearAll={resetFilters}
        />
      </div>

      {/* Filter Sidebar */}
      <FlipkartStyleFilters
        filters={localFilters}
        onFilterChange={handleFilterChange}
        onReset={resetFilters}
        isOpen={isFilterSidebarOpen}
        onClose={() => setIsFilterSidebarOpen(false)}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
          <p className="mt-2 text-gray-600">Loading products...</p>
        </div>
      )}

      {/* Products Grid */}
      {!isLoading && products.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold text-gray-600 mb-2">No products found</h3>
          <p className="text-gray-500 mb-4">Try adjusting your filters to see more results</p>
          <Button onClick={resetFilters}>Clear Filters</Button>
        </div>
      )}

      {!isLoading && products.length > 0 && (
        <>
          {/* Results Count */}
          <div className="flex justify-between items-center mb-6">
            <p className="text-gray-600">
              {pagination && (
                <>
                  Showing {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} products
                </>
              )}
            </p>
            <p className="text-sm text-gray-500">
              Page {pagination?.page} of {pagination?.pages}
            </p>
          </div>

          {/* Products Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.pages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
              >
                Previous
              </Button>
              
              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const page = Math.max(1, Math.min(pagination.pages - 4, pagination.page - 2)) + i
                return (
                  <Button
                    key={page}
                    variant={page === pagination.page ? 'primary' : 'outline'}
                    onClick={() => handlePageChange(page)}
                    size="sm"
                  >
                    {page}
                  </Button>
                )
              })}
              
              <Button
                variant="outline"
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

export default Catalog
