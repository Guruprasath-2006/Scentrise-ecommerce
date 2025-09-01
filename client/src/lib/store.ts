import { configureStore } from '@reduxjs/toolkit'
import authSlice from '../features/auth/authSlice'
import cartSlice from '../features/cart/cartSlice'
import productsSlice from '../features/products/productsSlice'
import orderSlice from '../features/orders/orderSlice'
import wishlistSlice from '../features/wishlist/wishlistSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    cart: cartSlice,
    products: productsSlice,
    orders: orderSlice,
    wishlist: wishlistSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
