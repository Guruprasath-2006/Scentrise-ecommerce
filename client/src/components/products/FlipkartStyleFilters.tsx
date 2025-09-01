import { useState, useEffect } from 'react'
import { ProductFilters } from '../../features/products/productsSlice'
import Button from '../ui/Button'

interface FlipkartStyleFiltersProps {
  filters: ProductFilters
  onFilterChange: (filters: Partial<ProductFilters>) => void
  onReset: () => void
  isOpen: boolean
  onClose: () => void
}

const FlipkartStyleFilters = ({ 
  filters, 
  onFilterChange, 
  onReset, 
  isOpen, 
  onClose 
}: FlipkartStyleFiltersProps) => {
  const [localFilters, setLocalFilters] = useState<ProductFilters>(filters)

  useEffect(() => {
    setLocalFilters(filters)
  }, [filters])

  const handleLocalFilterChange = (newFilters: Partial<ProductFilters>) => {
    setLocalFilters(prev => ({ ...prev, ...newFilters }))
  }

  const applyFilters = () => {
    onFilterChange(localFilters)
    onClose()
  }

  const clearAllFilters = () => {
    const defaultFilters = { page: 1, limit: 12, sort: '-createdAt' }
    setLocalFilters(defaultFilters)
    onReset()
    onClose()
  }

  const getActiveFiltersCount = () => {
    let count = 0
    if (localFilters.q) count++
    if (localFilters.gender) count++
    if (localFilters.family) count++
    if (localFilters.minPrice && localFilters.minPrice > 0) count++
    if (localFilters.maxPrice && localFilters.maxPrice < 50000) count++
    return count
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
        onClick={onClose}
      />
      
      {/* Filter Sidebar */}
      <div className="fixed top-0 left-0 h-full w-full max-w-sm bg-white shadow-lg z-50 overflow-y-auto lg:w-80">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <h2 className="text-lg font-semibold text-gray-900">Filters</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-md transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Filter Content */}
        <div className="p-4 space-y-6 pb-24">
          {/* Quick Search */}
          <div className="bg-gray-50 p-3 rounded-lg">
            <label className="block text-sm font-medium text-gray-900 mb-2">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search perfumes..."
                value={localFilters.q || ''}
                onChange={(e) => handleLocalFilterChange({ q: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <svg className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* Gender */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Gender</h3>
            <div className="space-y-2">
              {[
                { value: '', label: 'All' },
                { value: 'men', label: 'Men' },
                { value: 'women', label: 'Women' },
                { value: 'unisex', label: 'Unisex' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="gender"
                    value={option.value}
                    checked={(localFilters.gender || '') === option.value}
                    onChange={(e) => handleLocalFilterChange({ gender: e.target.value || undefined })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Fragrance Family */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Fragrance Family</h3>
            <div className="space-y-2">
              {[
                { value: '', label: 'All' },
                { value: 'citrus', label: 'Citrus' },
                { value: 'floral', label: 'Floral' },
                { value: 'woody', label: 'Woody' },
                { value: 'oriental', label: 'Oriental' },
                { value: 'fresh', label: 'Fresh' },
                { value: 'gourmand', label: 'Gourmand' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="family"
                    value={option.value}
                    checked={(localFilters.family || '') === option.value}
                    onChange={(e) => handleLocalFilterChange({ family: e.target.value || undefined })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Price Range</h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Min Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={localFilters.minPrice || 0}
                  onChange={(e) => handleLocalFilterChange({ minPrice: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Max Price (₹)</label>
                <input
                  type="number"
                  min="0"
                  max="50000"
                  value={localFilters.maxPrice || 50000}
                  onChange={(e) => handleLocalFilterChange({ maxPrice: Number(e.target.value) || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              {/* Quick Price Filters */}
              <div className="space-y-2 pt-2">
                <p className="text-xs text-gray-600">Quick Price Filters</p>
                {[
                  { min: 0, max: 1000, label: 'Under ₹1,000' },
                  { min: 1000, max: 3000, label: '₹1,000 - ₹3,000' },
                  { min: 3000, max: 5000, label: '₹3,000 - ₹5,000' },
                  { min: 5000, max: 10000, label: '₹5,000 - ₹10,000' },
                  { min: 10000, max: 50000, label: 'Above ₹10,000' }
                ].map((range) => (
                  <button
                    key={`${range.min}-${range.max}`}
                    onClick={() => handleLocalFilterChange({ 
                      minPrice: range.min, 
                      maxPrice: range.max === 50000 ? undefined : range.max 
                    })}
                    className={`w-full text-left px-3 py-2 text-sm rounded-md border transition-colors ${
                      localFilters.minPrice === range.min && 
                      (localFilters.maxPrice === range.max || (range.max === 50000 && !localFilters.maxPrice))
                        ? 'bg-primary-50 border-primary-500 text-primary-700'
                        : 'border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sort By */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">Sort By</h3>
            <div className="space-y-2">
              {[
                { value: '-createdAt', label: 'Newest First' },
                { value: 'createdAt', label: 'Oldest First' },
                { value: 'price', label: 'Price: Low to High' },
                { value: '-price', label: 'Price: High to Low' },
                { value: 'name', label: 'Name: A to Z' },
                { value: '-name', label: 'Name: Z to A' }
              ].map((option) => (
                <label key={option.value} className="flex items-center">
                  <input
                    type="radio"
                    name="sort"
                    value={option.value}
                    checked={localFilters.sort === option.value}
                    onChange={(e) => handleLocalFilterChange({ sort: e.target.value })}
                    className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <Button 
            onClick={applyFilters}
            className="w-full"
          >
            Apply Filters {getActiveFiltersCount() > 0 && `(${getActiveFiltersCount()})`}
          </Button>
          <Button 
            variant="outline" 
            onClick={clearAllFilters}
            className="w-full"
          >
            Clear All Filters
          </Button>
        </div>
      </div>
    </>
  )
}

export default FlipkartStyleFilters
