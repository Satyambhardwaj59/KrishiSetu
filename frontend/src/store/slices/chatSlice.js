import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '@/lib/api';

export const fetchConversations = createAsyncThunk('chat/conversations', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/chat/conversations');
    return data.data;
  } catch (err) { return rejectWithValue(err.response?.data); }
});

export const fetchMessages = createAsyncThunk('chat/messages', async ({ userId, params }, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/chat/messages/${userId}`, { params });
    return { userId, messages: data.data };
  } catch (err) { return rejectWithValue(err.response?.data); }
});

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    conversations  : [],
    messages       : {},      // keyed by partnerId
    activeChat     : null,    // partnerId currently open
    typingUsers    : {},      // { senderId: true/false }
    loading        : false,
    error          : null,
  },
  reducers: {
    setActiveChat : (state, action) => { state.activeChat = action.payload; },
    addMessage    : (state, action) => {
      const { partnerId, message } = action.payload;
      if (!state.messages[partnerId]) state.messages[partnerId] = [];
      state.messages[partnerId].push(message);
    },
    setTyping     : (state, action) => {
      const { senderId, isTyping } = action.payload;
      state.typingUsers[senderId] = isTyping;
    },
    updateSeen    : (state, action) => {
      const { messageIds, partnerId } = action.payload;
      if (state.messages[partnerId]) {
        state.messages[partnerId] = state.messages[partnerId].map((m) =>
          messageIds.includes(m._id) ? { ...m, isRead: true } : m
        );
      }
    },
    updateConvLastMessage: (state, action) => {
      const { partnerId, message } = action.payload;
      const conv = state.conversations.find((c) => c.partner?._id === partnerId);
      if (conv) conv.lastMessage = message;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConversations.fulfilled, (state, action) => { state.conversations = action.payload; })
      .addCase(fetchMessages.pending,        (state) => { state.loading = true; })
      .addCase(fetchMessages.fulfilled,      (state, action) => {
        state.loading = false;
        state.messages[action.payload.userId] = action.payload.messages;
      })
      .addCase(fetchMessages.rejected,       (state) => { state.loading = false; });
  },
});

export const { setActiveChat, addMessage, setTyping, updateSeen, updateConvLastMessage } = chatSlice.actions;
export default chatSlice.reducer;
