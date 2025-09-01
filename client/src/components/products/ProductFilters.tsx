import { ProductFilters } from '../../features/products/productsSlice'
import Button from '../ui/Button'

interface ProductFiltersProps {
  filters: ProductFilters
  onFilterChange: (filters: Partial<ProductFilters>) => void
  onReset: () => void
}

const ProductFiltersComponent = ({ filters, onFilterChange, onReset }: ProductFiltersProps) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 mb-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
        {/* Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
          <input
            type="text"
            placeholder="Search perfumes..."
            value={filters.q || ''}
            onChange={(e) => onFilterChange({ q: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        {/* Gender Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
          <select
            value={filters.gender || ''}
            onChange={(e) => onFilterChange({ gender: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All</option>
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
          </select>
        </div>

        {/* Fragrance Family */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Fragrance Family</label>
          <select
            value={filters.family || ''}
            onChange={(e) => onFilterChange({ family: e.target.value || undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="">All</option>
            <option value="citrus">Citrus</option>
            <option value="floral">Floral</option>
            <option value="woody">Woody</option>
            <option value="oriental">Oriental</option>
            <option value="fresh">Fresh</option>
            <option value="gourmand">Gourmand</option>
          </select>
        </div>

        {/* Sort */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
          <select
            value={filters.sort || '-createdAt'}
            onChange={(e) => onFilterChange({ sort: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          >
            <option value="-createdAt">Newest</option>
            <option value="createdAt">Oldest</option>
            <option value="price">Price: Low to High</option>
            <option value="-price">Price: High to Low</option>
            <option value="-ratingAvg">Highest Rated</option>
            <option value="title">Name: A to Z</option>
            <option value="-title">Name: Z to A</option>
          </select>
        </div>
      </div>

      {/* Price Range */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Min Price (₹)</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice || ''}
            onChange={(e) => onFilterChange({ minPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Price (₹)</label>
          <input
            type="number"
            placeholder="50000"
            value={filters.maxPrice || ''}
            onChange={(e) => onFilterChange({ maxPrice: e.target.value ? Number(e.target.value) : undefined })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex items-end">
          <Button variant="outline" onClick={onReset} className="w-full">
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Active Filters Summary */}
      {(filters.q || filters.gender || filters.family || filters.minPrice || filters.maxPrice) && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm text-gray-600">Active filters:</span>
          {filters.q && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              Search: {filters.q}
            </span>
          )}
          {filters.gender && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              {filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1)}
            </span>
          )}
          {filters.family && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              {filters.family.charAt(0).toUpperCase() + filters.family.slice(1)}
            </span>
          )}
          {(filters.minPrice || filters.maxPrice) && (
            <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs">
              ₹{filters.minPrice || 0} - ₹{filters.maxPrice || '∞'}
            </span>
          )}
        </div>
      )}
    </div>
  )
}

export default ProductFiltersComponent
