// Network connectivity types

export interface NetworkStatusPayload {
    isConnected?: boolean;
    isInternetReachable?: boolean;
    type?: string | null;
}

