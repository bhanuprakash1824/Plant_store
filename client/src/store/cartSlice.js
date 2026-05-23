import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axiosInstance from '../api/axiosInstance';
import { fetchAllPlants } from './plantsSlice';

// ── Checkout with OCC ─────────────────────────────────────────────────────────
export const checkoutCart = createAsyncThunk(
  'cart/checkout',
  async (address, { getState, dispatch, rejectWithValue }) => {
    const cartItems = getState().cart.items;

    const payload = cartItems.map((item) => ({
      plantId: item._id,
      quantity: item.quantity,
      version: item.version,   // ← OCC snapshot
    }));

    try {
      const { data } = await axiosInstance.post('/orders/checkout', {
        items: payload,
        shippingAddress: address,
      });
      return data;
    } catch (err) {
      // On 409 version conflict, re-fetch fresh plants so cart can update
      if (err.response?.status === 409) {
        dispatch(fetchAllPlants());
      }
      return rejectWithValue({
        status: err.response?.status,
        message: err.response?.data?.message || 'Checkout failed',
        conflictItems: err.response?.data?.conflictItems || [],
      });
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────
const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    items: [],
    checkoutStatus: 'idle',  // 'idle' | 'loading' | 'success' | 'conflict' | 'error'
    checkoutError: null,
    lastOrder: null,
  },
  reducers: {
    addItem: (state, action) => {
      // action.payload = full plant object from API (includes _id, version, stock)
      const { _id, name, image, price, version } = action.payload;
      const existing = state.items.find((i) => i._id === _id);
      if (existing) {
        existing.quantity += 1;
      } else {
        state.items.push({ _id, name, image, price, version, quantity: 1 });
      }
    },
    removeItem: (state, action) => {
      state.items = state.items.filter((i) => i._id !== action.payload);
    },
    updateQuantity: (state, action) => {
      const { _id, quantity } = action.payload;
      const item = state.items.find((i) => i._id === _id);
      if (item) item.quantity = quantity;
    },
    // Update version snapshot after an OCC refresh (so user can retry)
    refreshItemVersions: (state, action) => {
      // action.payload = fresh plants array from API
      action.payload.forEach((freshPlant) => {
        const cartItem = state.items.find((i) => i._id === freshPlant._id);
        if (cartItem) {
          cartItem.version = freshPlant.version;
          // Also warn if stock is now insufficient
          if (freshPlant.stock < cartItem.quantity) {
            cartItem.quantity = freshPlant.stock;
          }
        }
      });
    },
    clearCart: (state) => {
      state.items = [];
      state.checkoutStatus = 'idle';
      state.checkoutError = null;
    },
    resetCheckoutStatus: (state) => {
      state.checkoutStatus = 'idle';
      state.checkoutError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(checkoutCart.pending, (state) => {
        state.checkoutStatus = 'loading';
        state.checkoutError = null;
      })
      .addCase(checkoutCart.fulfilled, (state, action) => {
        state.checkoutStatus = 'success';
        state.lastOrder = action.payload.order;
        state.items = [];
      })
      .addCase(checkoutCart.rejected, (state, action) => {
        const payload = action.payload;
        state.checkoutStatus = payload?.status === 409 ? 'conflict' : 'error';
        state.checkoutError = payload?.message || 'Checkout failed';
      });
  },
});

export const {
  addItem,
  removeItem,
  updateQuantity,
  refreshItemVersions,
  clearCart,
  resetCheckoutStatus,
} = cartSlice.actions;

export default cartSlice.reducer;
