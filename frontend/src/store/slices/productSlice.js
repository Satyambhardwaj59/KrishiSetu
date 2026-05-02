import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchProductById = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchMyListings = createAsyncThunk('products/myListings', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/farmer/my-listings');
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const updateProduct = createAsyncThunk('products/update', async ({ id, formData }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteProduct = createAsyncThunk('products/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/products/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    items      : [],
    selected   : null,
    myListings : [],
    meta       : {},
    loading    : false,
    error      : null,
    filters    : { q: '', category: '', page: 1 },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearSelected: (state) => { state.selected = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending,   (state) => { state.loading = true; state.error = null; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.meta  = action.payload.meta;
      })
      .addCase(fetchProducts.rejected,  (state, action) => { state.loading = false; state.error = action.payload?.message; })

      .addCase(fetchProductById.fulfilled, (state, action) => { state.selected = action.payload; })

      .addCase(fetchMyListings.fulfilled, (state, action) => { state.myListings = action.payload; })

      .addCase(createProduct.fulfilled, (state, action) => {
        state.myListings.unshift(action.payload);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        state.myListings = state.myListings.map((p) =>
          p._id === action.payload._id ? action.payload : p
        );
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.myListings = state.myListings.filter((p) => p._id !== action.payload);
      });
  },
});

export const { setFilters, clearSelected } = productSlice.actions;
export default productSlice.reducer;
