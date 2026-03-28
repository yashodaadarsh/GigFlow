import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/api';

export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (userId) => {
    const { data } = await api.get(`/notifications?userId=${userId}`);
    return data;
  }
);

export const markAllRead = createAsyncThunk(
  'notifications/markAllRead',
  async (userId) => {
    await api.put(`/notifications/read-all?userId=${userId}`);
    return userId;
  }
);

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: {
    list: [],
    unreadCount: 0,
    loading: false,
    incomingCall: null, // { callerId, callerName, roomId }
  },
  reducers: {
    addNotification: (state, action) => {
      state.list.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount++;
    },
    setIncomingCall: (state, action) => {
      state.incomingCall = action.payload;
    },
    clearIncomingCall: (state) => {
      state.incomingCall = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.list = action.payload;
        state.unreadCount = action.payload.filter(n => !n.isRead).length;
        state.loading = false;
      })
      .addCase(markAllRead.fulfilled, (state) => {
        state.list.forEach(n => n.isRead = true);
        state.unreadCount = 0;
      });
  }
});

export const { addNotification, setIncomingCall, clearIncomingCall } = notificationsSlice.actions;
export default notificationsSlice.reducer;
