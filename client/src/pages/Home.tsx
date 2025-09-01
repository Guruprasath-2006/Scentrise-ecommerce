import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAppDispatch } from '../lib/hooks'
import { clearError } from '../features/products/productsSlice'
import SEO from '../components/common/SEO'

const Home = () => {
  const dispatch = useAppDispatch()

  // Clear any existing errors when component mounts
  useEffect(() => {
    dispatch(clearError())
  }, [dispatch])

  return (
    <>
      <SEO 
        title="Premium Perfumes & Fragrances - Scentrise"
        description="Discover luxury perfumes and fragrances from top brands. Shop authentic designer perfumes for men and women with fast delivery."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
        {/* Hero Section */}
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl font-bold text-gray-900 mb-6 font-serif">
              Welcome to <span className="text-primary-600">Scentrise</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Discover the world's finest perfumes and fragrances. From timeless classics to modern masterpieces, 
              find your signature scent that tells your unique story.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/catalog" className="btn-primary text-lg px-8 py-4">
                Explore Collection
              </Link>
              <Link to="/catalog?featured=true" className="btn-secondary text-lg px-8 py-4">
                Featured Fragrances
              </Link>
            </div>
          </div>
        </div>

        {/* Quick Categories */}
        <div className="bg-white py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Shop by Category</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Link
                to="/catalog?gender=men"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-white hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Men's Fragrances</h3>
                  <p className="text-blue-100 mb-4">Bold, sophisticated, unforgettable</p>
                  <span className="inline-flex items-center text-sm font-medium">
                    Shop Now 
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>

              <Link
                to="/catalog?gender=women"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-pink-500 to-rose-600 p-8 text-white hover:from-pink-600 hover:to-rose-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Women's Fragrances</h3>
                  <p className="text-pink-100 mb-4">Elegant, graceful, enchanting</p>
                  <span className="inline-flex items-center text-sm font-medium">
                    Shop Now 
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>

              <Link
                to="/catalog?gender=unisex"
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-500 to-indigo-600 p-8 text-white hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 transform hover:scale-105"
              >
                <div className="relative z-10">
                  <h3 className="text-2xl font-bold mb-2">Unisex Fragrances</h3>
                  <p className="text-purple-100 mb-4">Versatile, modern, distinctive</p>
                  <span className="inline-flex items-center text-sm font-medium">
                    Shop Now 
                    <svg className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="py-16 bg-gray-50">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">Why Choose Scentrise?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">100% Authentic</h3>
                <p className="text-gray-600">All our fragrances are sourced directly from authorized distributors</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h3>
                <p className="text-gray-600">Quick and secure shipping to your doorstep within 2-3 business days</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Customer Satisfaction</h3>
                <p className="text-gray-600">30-day return policy and dedicated customer support for your peace of mind</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Home
