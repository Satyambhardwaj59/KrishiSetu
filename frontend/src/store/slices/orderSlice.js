import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchOrderById = createAsyncThunk('orders/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${id}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const placeOrder = createAsyncThunk('orders/place', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, status, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/orders/${id}/status`, { status, note });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    items   : [],
    selected: null,
    meta    : {},
    loading : false,
    error   : null,
  },
  reducers: {
    clearOrderError : (state) => { state.error = null; },
    clearSelected   : (state) => { state.selected = null; },
    updateOrderInList: (state, action) => {
      state.items = state.items.map((o) =>
        o._id === action.payload._id ? action.payload : o
      );
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending,   (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload.data; state.meta = action.payload.meta;
      })
      .addCase(fetchOrders.rejected,  (state, action) => { state.loading = false; state.error = action.payload?.message; })

      .addCase(fetchOrderById.fulfilled, (state, action) => { state.selected = action.payload; })

      .addCase(placeOrder.fulfilled, (state, action) => { state.items.unshift(action.payload); })

      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        state.items    = state.items.map((o) => o._id === action.payload._id ? action.payload : o);
        state.selected = action.payload;
      });
  },
});

export const { clearOrderError, clearSelected, updateOrderInList } = orderSlice.actions;
export default orderSlice.reducer;
