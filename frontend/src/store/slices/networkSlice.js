// networkSlice.js
import { createSlice } from '@reduxjs/toolkit';

const networkSlice = createSlice({
  name: 'network',
  initialState: {
    isOnline: true, // Default to true, will be updated on app load
    isInternetReachable: true,
    lastOfflineTime: null,
    connectionType: null,
  },
  reducers: {
    setOnlineStatus: (state, action) => {
      state.isOnline = action.payload.isConnected ?? true;
      state.isInternetReachable = action.payload.isInternetReachable ?? true;
      state.connectionType = action.payload.type ?? null;
      
      if (!action.payload.isConnected) {
        state.lastOfflineTime = Date.now();
      }
    },
  },
});

export const { setOnlineStatus } = networkSlice.actions;
export default networkSlice.reducer;