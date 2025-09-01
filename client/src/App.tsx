import { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { useAppDispatch } from './lib/hooks'
import { fetchMe } from './features/auth/authSlice'

// Layout Components
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import ProtectedRoute from './components/layout/ProtectedRoute'
import ErrorBoundary, { RouteErrorBoundary } from './components/common/ErrorBoundary'
import SEO from './components/common/SEO'
import DebugPanel from './components/debug/DebugPanel'

// Pages
import Home from './pages/Home'
import Catalog from './pages/Catalog'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Billing from './pages/Billing'
import Payment from './pages/Payment'
import Orders from './pages/Orders'
import TrackOrder from './pages/TrackOrder'
import Profile from './pages/Profile'
import Wishlist from './pages/Wishlist'
import AdminDashboard from './pages/AdminDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import NotFound from './pages/NotFound'

function App() {
  const dispatch = useAppDispatch()

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  return (
    <HelmetProvider>
      <ErrorBoundary>
        <SEO />
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Navbar />
          
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<RouteErrorBoundary><Home /></RouteErrorBoundary>} />
              <Route path="/catalog" element={<RouteErrorBoundary><Catalog /></RouteErrorBoundary>} />
              <Route path="/products/:slug" element={<RouteErrorBoundary><ProductDetail /></RouteErrorBoundary>} />
              <Route path="/cart" element={<RouteErrorBoundary><Cart /></RouteErrorBoundary>} />
              <Route path="/login" element={<RouteErrorBoundary><Login /></RouteErrorBoundary>} />
              <Route path="/register" element={<RouteErrorBoundary><Register /></RouteErrorBoundary>} />
              
              {/* Public tracking route */}
          <Route path="/track" element={<RouteErrorBoundary><TrackOrder /></RouteErrorBoundary>} />
          <Route path="/track/:trackingId" element={<RouteErrorBoundary><TrackOrder /></RouteErrorBoundary>} />
          
          {/* Protected Routes */}
          <Route path="/checkout" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Checkout /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/billing" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Billing /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/payment" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Payment /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/orders" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Orders /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/orders/:orderId" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Orders /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Profile /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          <Route path="/wishlist" element={
            <ProtectedRoute>
              <RouteErrorBoundary><Wishlist /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute adminOnly>
              <RouteErrorBoundary><AdminDashboard /></RouteErrorBoundary>
            </ProtectedRoute>
          } />
          
          {/* Catch all route for 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      
      <Footer />
    </div>
      </ErrorBoundary>
      <DebugPanel />
    </HelmetProvider>
  )
}

export default App
