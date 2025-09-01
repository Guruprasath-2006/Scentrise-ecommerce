import { useAppDispatch, useAppSelector } from '../../lib/hooks'
import { clearError, fetchProducts } from '../../features/products/productsSlice'

const DebugPanel = () => {
  const dispatch = useAppDispatch()
  const { error, isLoading, products } = useAppSelector((state) => state.products)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <div className="mb-2 font-bold">Debug Panel</div>
      <div>Products: {products.length}</div>
      <div>Loading: {isLoading.toString()}</div>
      <div>Error: {error || 'None'}</div>
      <div className="mt-2 space-x-2">
        <button 
          onClick={() => dispatch(clearError())}
          className="bg-blue-500 text-white px-2 py-1 rounded text-xs"
        >
          Clear Error
        </button>
        <button 
          onClick={() => dispatch(fetchProducts({ page: 1, limit: 12, sort: '-createdAt' }))}
          className="bg-green-500 text-white px-2 py-1 rounded text-xs"
        >
          Fetch Products
        </button>
      </div>
    </div>
  )
}

export default DebugPanel
