import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';
import { initSocket, disconnectSocket } from '@/lib/socket';

// ── Async thunks ──────────────────────────────────────────────────────────────
export const registerUser = createAsyncThunk('auth/registerUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/register', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const verifyRegistration = createAsyncThunk('auth/verifyRegistration', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/verify-registration', payload);
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    initSocket(accessToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const loginUser = createAsyncThunk('auth/loginUser', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/login', payload);
    const { accessToken, refreshToken, user } = data.data;
    localStorage.setItem('accessToken',  accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    initSocket(accessToken);
    return user;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/request-reset', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const resetPassword = createAsyncThunk('auth/resetPassword', async (payload, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/auth/reset-password', payload);
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    await api.post('/auth/logout');
  } catch (_) {}
  localStorage.clear();
  disconnectSocket();
});

export const fetchMe = createAsyncThunk('auth/fetchMe', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/auth/me');
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data || { message: err.message });
  }
});

// ── Slice ─────────────────────────────────────────────────────────────────────
const loadUser = () => {
  if (typeof window === 'undefined') return null;
  try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user          : loadUser(),
    isAuthenticated: !!loadUser(),
    loading       : false,
    otpSent       : false,
    error         : null,
    mockOtp       : null,
  },
  reducers: {
    clearError : (state) => { state.error = null; },
    setUser    : (state, action) => { state.user = action.payload; state.isAuthenticated = true; },
    resetOtpState: (state) => { state.otpSent = false; state.mockOtp = null; },
  },
  extraReducers: (builder) => {
    // registerUser
    builder
      .addCase(registerUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false; state.otpSent = true;
        state.mockOtp = action.payload.data?.otp || null;
      })
      .addCase(registerUser.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })
    // verifyRegistration
      .addCase(verifyRegistration.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(verifyRegistration.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true;
        state.otpSent = false;
        state.mockOtp = null;
      })
      .addCase(verifyRegistration.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })
    // loginUser
      .addCase(loginUser.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false; state.user = action.payload; state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })
    // requestPasswordReset
      .addCase(requestPasswordReset.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(requestPasswordReset.fulfilled, (state, action) => {
        state.loading = false; state.otpSent = true;
        state.mockOtp = action.payload.data?.otp || null;
      })
      .addCase(requestPasswordReset.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })
    // resetPassword
      .addCase(resetPassword.pending,   (state) => { state.loading = true;  state.error = null; })
      .addCase(resetPassword.fulfilled, (state) => {
        state.loading = false;
        state.otpSent = false;
        state.mockOtp = null;
      })
      .addCase(resetPassword.rejected,  (state, action) => {
        state.loading = false; state.error = action.payload?.message;
      })
    // logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null; state.isAuthenticated = false; state.otpSent = false;
      })
    // fetchMe
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload; state.isAuthenticated = true;
      });
  },
});

export const { clearError, setUser, resetOtpState } = authSlice.actions;
export default authSlice.reducer;
