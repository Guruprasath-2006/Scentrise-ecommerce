import { Link, useLocation } from 'react-router-dom'
import { useAppSelector } from '../../lib/hooks'
import { useState } from 'react'
import Search from './Search'

const Navbar = () => {
  const location = useLocation()
  const { user } = useAppSelector((state) => state.auth)
  const { items } = useAppSelector((state) => state.cart)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  const cartItemsCount = items.reduce((total, item) => total + item.qty, 0)

  // Helper function to check if a navigation link is active
  const isActiveFilter = (gender?: string) => {
    const searchParams = new URLSearchParams(location.search)
    const currentGender = searchParams.get('gender')
    
    if (!gender && !currentGender && location.pathname === '/catalog') return true
    return currentGender === gender
  }

  return (
    <>
      <nav className="bg-white shadow-lg border-b border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link to="/" className="text-2xl font-bold text-primary-600">
              Scentrise
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/catalog?gender=men" 
                className={`transition-colors ${
                  isActiveFilter('men') 
                    ? 'text-primary-600 font-semibold border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Men
              </Link>
              <Link 
                to="/catalog?gender=women" 
                className={`transition-colors ${
                  isActiveFilter('women') 
                    ? 'text-primary-600 font-semibold border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Women
              </Link>
              <Link 
                to="/catalog?gender=unisex" 
                className={`transition-colors ${
                  isActiveFilter('unisex') 
                    ? 'text-primary-600 font-semibold border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                Unisex
              </Link>
              <Link 
                to="/catalog" 
                className={`transition-colors ${
                  isActiveFilter() 
                    ? 'text-primary-600 font-semibold border-b-2 border-primary-600 pb-1' 
                    : 'text-gray-700 hover:text-primary-600'
                }`}
              >
                All Products
              </Link>
              <Link 
                to="/track" 
                className="text-gray-700 hover:text-primary-600 transition-colors"
              >
                Track Order
              </Link>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="text-gray-700 hover:text-primary-600 transition-colors"
                aria-label="Search"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>

              {/* Wishlist */}
              {user && (
                <Link to="/wishlist" className="text-gray-700 hover:text-primary-600 transition-colors">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </Link>
              )}

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-primary-600 focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>

              {/* Cart */}
              <Link to="/cart" className="relative text-gray-700 hover:text-primary-600">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5 6m0 0h12" />
                </svg>
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemsCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              {user ? (
                <div className="flex items-center space-x-2">
                  <span className="text-gray-700">Hi, {user.name}</span>
                  <Link to="/profile" className="text-primary-600 hover:text-primary-700">
                    Profile
                  </Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="text-primary-600 hover:text-primary-700">
                      Admin
                    </Link>
                  )}
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link to="/login" className="text-gray-700 hover:text-primary-600">
                    Login
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Navigation Menu */}
          {isMobileMenuOpen && (
            <div className="md:hidden border-t border-gray-200 bg-white">
              <div className="px-4 py-3 space-y-3">
                {/* Mobile Navigation Links */}
                <Link 
                  to="/catalog?gender=men" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActiveFilter('men') 
                      ? 'bg-primary-50 text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Men's Fragrances
                </Link>
                <Link 
                  to="/catalog?gender=women" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActiveFilter('women') 
                      ? 'bg-primary-50 text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Women's Fragrances
                </Link>
                <Link 
                  to="/catalog?gender=unisex" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActiveFilter('unisex') 
                      ? 'bg-primary-50 text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Unisex Fragrances
                </Link>
                <Link 
                  to="/catalog" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block py-2 px-3 rounded-md transition-colors ${
                    isActiveFilter() 
                      ? 'bg-primary-50 text-primary-600 font-semibold' 
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  All Products
                </Link>
                <Link 
                  to="/track" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Track Order
                </Link>
                {user && (
                  <Link 
                    to="/wishlist" 
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Wishlist
                  </Link>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Search Modal */}
      <Search isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  )
}

export default Navbar
