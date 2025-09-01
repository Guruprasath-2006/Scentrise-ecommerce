import { ProductFilters } from '../../features/products/productsSlice'

interface FilterButtonProps {
  filters: ProductFilters
  onClick: () => void
  className?: string
}

const FilterButton = ({ filters, onClick, className = '' }: FilterButtonProps) => {
  const getActiveFiltersCount = () => {
    let count = 0
    if (filters.q) count++
    if (filters.gender) count++
    if (filters.family) count++
    if (filters.minPrice && filters.minPrice > 0) count++
    if (filters.maxPrice && filters.maxPrice < 50000) count++
    return count
  }

  const activeCount = getActiveFiltersCount()

  return (
    <button
      onClick={onClick}
      className={`flex items-center justify-between w-full md:w-auto px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors ${className}`}
    >
      <div className="flex items-center space-x-2">
        <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v6.586a1 1 0 01-1.536.844l-4-2.5a1 1 0 01-.464-.844V14.414a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
        </svg>
        <span className="font-medium text-gray-700">
          Filters
          {activeCount > 0 && (
            <span className="ml-1 bg-primary-100 text-primary-700 px-2 py-0.5 rounded-full text-xs font-semibold">
              {activeCount}
            </span>
          )}
        </span>
      </div>
      
      <svg className="w-4 h-4 text-gray-400 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </button>
  )
}

export default FilterButton
