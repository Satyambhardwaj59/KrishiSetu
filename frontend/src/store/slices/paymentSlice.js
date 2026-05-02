import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const createPaymentOrder = createAsyncThunk('payment/createOrder', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/create-order', { orderId });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const verifyPayment = createAsyncThunk('payment/verify', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/payments/verify', payload);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchPaymentByOrder = createAsyncThunk('payment/fetchByOrder', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/payments/order/${orderId}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const paymentSlice = createSlice({
  name: 'payment',
  initialState: {
    current    : null,
    rzpOrderData: null,    // Razorpay order metadata for checkout
    loading    : false,
    error      : null,
    status     : null,    // 'success' | 'failed' | null
  },
  reducers: {
    clearPaymentStatus: (state) => { state.status = null; state.error = null; },
    setPaymentStatus  : (state, action) => { state.status = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPaymentOrder.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(createPaymentOrder.fulfilled, (state, action) => {
        state.loading = false; state.rzpOrderData = action.payload;
      })
      .addCase(createPaymentOrder.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })

      .addCase(verifyPayment.fulfilled, (state, action) => {
        state.current = action.payload.payment; state.status = 'success';
      })
      .addCase(verifyPayment.rejected,  (state, action) => {
        state.error = action.payload?.message; state.status = 'failed';
      })

      .addCase(fetchPaymentByOrder.fulfilled, (state, action) => { state.current = action.payload; });
  },
});

export const { clearPaymentStatus, setPaymentStatus } = paymentSlice.actions;
export default paymentSlice.reducer;
