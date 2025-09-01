import { Link } from 'react-router-dom'
import SEO from '../components/common/SEO'

const NotFound = () => {
  return (
    <>
      <SEO
        title="Page Not Found - 404"
        description="The page you are looking for doesn't exist. Browse our luxury perfume collection instead."
        keywords="404, page not found, perfumes, fragrances"
      />
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <div>
            {/* 404 Illustration */}
            <div className="relative mx-auto w-64 h-48 mb-8">
              <svg
                className="w-full h-full text-primary-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-3-8a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-6xl font-bold text-gray-800">404</span>
              </div>
            </div>

            <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
              Page Not Found
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Oops! It seems like this page has vanished into thin air, just like a beautiful fragrance.
            </p>
          </div>

          <div className="space-y-4">
            <Link
              to="/"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Return to Homepage
            </Link>
            
            <Link
              to="/catalog"
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors duration-200"
            >
              Browse Our Collection
            </Link>
          </div>

          {/* Popular Categories */}
          <div className="mt-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Popular Categories
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/catalog?gender=men"
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-blue-600 group-hover:text-blue-700 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    Men's Fragrances
                  </span>
                </div>
              </Link>

              <Link
                to="/catalog?gender=women"
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-pink-600 group-hover:text-pink-700 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    Women's Fragrances
                  </span>
                </div>
              </Link>

              <Link
                to="/catalog?family=woody"
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-amber-600 group-hover:text-amber-700 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    Woody Scents
                  </span>
                </div>
              </Link>

              <Link
                to="/catalog?family=floral"
                className="group p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-center">
                  <svg
                    className="mx-auto h-8 w-8 text-rose-600 group-hover:text-rose-700 mb-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                    Floral Scents
                  </span>
                </div>
              </Link>
            </div>
          </div>

          {/* Help Section */}
          <div className="mt-12 p-6 bg-gray-100 rounded-lg">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Need Help?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              If you believe this is an error, please contact our support team.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <Link
                to="/contact"
                className="flex-1 text-center py-2 px-4 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                to="/track"
                className="flex-1 text-center py-2 px-4 bg-white text-gray-700 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Track Order
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default NotFound
