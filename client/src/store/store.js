import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import plantsReducer from './plantsSlice';
import cartReducer from './cartSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    plants: plantsReducer,
    cart: cartReducer,
  },
});

export default store;
