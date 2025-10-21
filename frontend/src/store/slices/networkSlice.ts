import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { NetworkStatusPayload } from '../../types/network';

// State interface
interface NetworkState {
    isOnline: boolean;
    isInternetReachable: boolean;
    lastOfflineTime: number | null;
    connectionType: string | null;
}

// Initial state
const initialState: NetworkState = {
    isOnline: true,
    isInternetReachable: true,
    lastOfflineTime: null,
    connectionType: null,
};

const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        setOnlineStatus: (state, action: PayloadAction<NetworkStatusPayload>) => {
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

