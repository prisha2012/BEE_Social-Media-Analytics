import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import analyticsSlice from './analyticsSlice';

// We'll import slices later, for now just create empty store
export const store = configureStore({
  reducer: {
    auth: authSlice,
    analytics: analyticsSlice,
  },
});

export default store;
