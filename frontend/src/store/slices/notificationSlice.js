import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchNotifications = createAsyncThunk('notifications/fetchAll', async (params = {}, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/notifications', { params });
    return data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const markAsRead = createAsyncThunk('notifications/markRead', async (id, { rejectWithValue }) => {
  try {
    await api.patch(`/notifications/${id}/read`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const markAllAsRead = createAsyncThunk('notifications/markAllRead', async (_, { rejectWithValue }) => {
  try {
    await api.patch('/notifications/read-all');
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const deleteNotification = createAsyncThunk('notifications/delete', async (id, { rejectWithValue }) => {
  try {
    await api.delete(`/notifications/${id}`);
    return id;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const notificationSlice = createSlice({
  name: 'notifications',
  initialState: {
    items      : [],
    unreadCount: 0,
    meta       : {},
    loading    : false,
  },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    setUnreadCount: (state, action) => { state.unreadCount = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.pending,   (state) => { state.loading = true; })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false; state.items = action.payload.data; state.meta = action.payload.meta;
        state.unreadCount = action.payload.data.filter((n) => !n.isRead).length;
      })
      .addCase(fetchNotifications.rejected,  (state) => { state.loading = false; })

      .addCase(markAsRead.fulfilled,    (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
      })
      .addCase(markAllAsRead.fulfilled, (state) => {
        state.items.forEach((n) => { n.isRead = true; });
        state.unreadCount = 0;
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        const n = state.items.find((i) => i._id === action.payload);
        if (n && !n.isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
        state.items = state.items.filter((i) => i._id !== action.payload);
      });
  },
});

export const { addNotification, setUnreadCount } = notificationSlice.actions;
export default notificationSlice.reducer;
