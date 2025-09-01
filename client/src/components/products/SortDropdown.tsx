import { ProductFilters } from '../../features/products/productsSlice'

interface SortDropdownProps {
  filters: ProductFilters
  onSortChange: (sort: string) => void
  className?: string
}

const SortDropdown = ({ filters, onSortChange, className = '' }: SortDropdownProps) => {
  const sortOptions = [
    { value: '-createdAt', label: 'Newest First' },
    { value: 'createdAt', label: 'Oldest First' },
    { value: 'price', label: 'Price: Low to High' },
    { value: '-price', label: 'Price: High to Low' },
    { value: 'name', label: 'Name: A to Z' },
    { value: '-name', label: 'Name: Z to A' }
  ]

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <span className="text-sm text-gray-600 font-medium whitespace-nowrap">Sort by:</span>
      <select
        value={filters.sort || '-createdAt'}
        onChange={(e) => onSortChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default SortDropdown
