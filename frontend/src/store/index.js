import { configureStore } from '@reduxjs/toolkit';
import authReducer         from './slices/authSlice';
import productReducer      from './slices/productSlice';
import orderReducer        from './slices/orderSlice';
import chatReducer         from './slices/chatSlice';
import notificationReducer from './slices/notificationSlice';
import paymentReducer      from './slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth        : authReducer,
    products    : productReducer,
    orders      : orderReducer,
    chat        : chatReducer,
    notifications: notificationReducer,
    payment     : paymentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
});
