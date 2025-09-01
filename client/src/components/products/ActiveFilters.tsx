import { ProductFilters } from '../../features/products/productsSlice'

interface ActiveFiltersProps {
  filters: ProductFilters
  onFilterRemove: (filterKey: keyof ProductFilters) => void
  onClearAll: () => void
}

const ActiveFilters = ({ filters, onFilterRemove, onClearAll }: ActiveFiltersProps) => {
  const activeFilters = []

  // Build active filters array
  if (filters.q) {
    activeFilters.push({
      key: 'q' as keyof ProductFilters,
      label: `Search: "${filters.q}"`,
      value: filters.q
    })
  }

  if (filters.gender) {
    activeFilters.push({
      key: 'gender' as keyof ProductFilters,
      label: `Gender: ${filters.gender.charAt(0).toUpperCase() + filters.gender.slice(1)}`,
      value: filters.gender
    })
  }

  if (filters.family) {
    activeFilters.push({
      key: 'family' as keyof ProductFilters,
      label: `Family: ${filters.family.charAt(0).toUpperCase() + filters.family.slice(1)}`,
      value: filters.family
    })
  }

  if (filters.minPrice && filters.minPrice > 0) {
    activeFilters.push({
      key: 'minPrice' as keyof ProductFilters,
      label: `Min Price: ₹${filters.minPrice}`,
      value: filters.minPrice
    })
  }

  if (filters.maxPrice && filters.maxPrice < 50000) {
    activeFilters.push({
      key: 'maxPrice' as keyof ProductFilters,
      label: `Max Price: ₹${filters.maxPrice}`,
      value: filters.maxPrice
    })
  }

  if (filters.sort && filters.sort !== '-createdAt') {
    const sortLabels: { [key: string]: string } = {
      'createdAt': 'Oldest First',
      'price': 'Price: Low to High',
      '-price': 'Price: High to Low',
      'name': 'Name: A to Z',
      '-name': 'Name: Z to A'
    }
    activeFilters.push({
      key: 'sort' as keyof ProductFilters,
      label: `Sort: ${sortLabels[filters.sort] || filters.sort}`,
      value: filters.sort
    })
  }

  if (activeFilters.length === 0) return null

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-sm text-gray-600 font-medium">Active Filters:</span>
      
      {activeFilters.map((filter) => (
        <span
          key={filter.key}
          className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
        >
          {filter.label}
          <button
            onClick={() => onFilterRemove(filter.key)}
            className="hover:bg-primary-200 rounded-full p-0.5 transition-colors"
          >
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </span>
      ))}

      <button
        onClick={onClearAll}
        className="text-sm text-red-600 hover:text-red-700 font-medium underline"
      >
        Clear All
      </button>
    </div>
  )
}

export default ActiveFilters
