import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PackageService from '../../services/package.service';
import type { PackageInfo, PackageListItem } from '../../types/package';

// State interface
interface PackagesState {
    available: PackageInfo[];
    downloaded: PackageInfo[];
    currentPackage: PackageInfo | null;
    loading: boolean;
    error: string | null;
    lastUpdated: string | null;
}

// Initial state
const initialState: PackagesState = {
    available: [],
    downloaded: [],
    currentPackage: null,
    loading: false,
    error: null,
    lastUpdated: null,
};

// Async thunk for fetching available packages
export const fetchAvailablePackages = createAsyncThunk<
    PackageInfo[],
    void,
    { rejectValue: string }
>(
    'packages/fetchAvailable',
    async (_, { rejectWithValue }) => {
        try {
            const response = await PackageService.getAvailable();
            return response.data;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to fetch packages');
        }
    }
);

// Async thunk for downloading a package
export const downloadPackage = createAsyncThunk<
    PackageInfo,
    PackageInfo,
    { rejectValue: string }
>(
    'packages/downloadPackage',
    async (packageInfo, { rejectWithValue }) => {
        try {
            // Fetch package data
            const response = await PackageService.getPackage(packageInfo.name);

            // Create package object with all data
            const packageData: PackageInfo = {
                _id: packageInfo._id,
                title: packageInfo.title,
                name: packageInfo.name,
                attributes: packageInfo.attributes,
                divisions: packageInfo.divisions,
                test_division: packageInfo.test_division,
                has_maps: packageInfo.has_maps,
                test_time: packageInfo.test_time,
                sort_attr: packageInfo.sort_attr,
                ranged: packageInfo.ranged,
                version: packageInfo.version,
                items: response.data
            };

            // Save to AsyncStorage
            await AsyncStorage.setItem(packageData.name, JSON.stringify(packageData));

            // Update downloaded packages list
            const existingPacks = await AsyncStorage.getItem("packs");
            let packs: PackageListItem[] = existingPacks ? JSON.parse(existingPacks) : [];

            const packInfo: PackageListItem = {
                title: packageData.title,
                name: packageData.name,
                version: packageData.version
            };

            const existingIndex = packs.findIndex(p => p.name === packageData.name);
            if (existingIndex !== -1) {
                packs[existingIndex] = packInfo;
            } else {
                packs.push(packInfo);
            }

            await AsyncStorage.setItem("packs", JSON.stringify(packs));

            return packageData;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to download package');
        }
    }
);

// Async thunk for loading downloaded packages
export const loadDownloadedPackages = createAsyncThunk<
    PackageInfo[],
    void,
    { rejectValue: string }
>(
    'packages/loadDownloaded',
    async (_, { rejectWithValue }) => {
        try {
            const packsData = await AsyncStorage.getItem("packs");
            if (!packsData) return [];

            const packs: PackageListItem[] = JSON.parse(packsData);
            const downloadedPackages: PackageInfo[] = [];

            for (const pack of packs) {
                const packageData = await AsyncStorage.getItem(pack.name);
                if (packageData) {
                    downloadedPackages.push(JSON.parse(packageData));
                }
            }

            return downloadedPackages;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to load downloaded packages');
        }
    }
);

// Async thunk for uninstalling a package
export const uninstallPackage = createAsyncThunk<
    string,
    string,
    { rejectValue: string }
>(
    'packages/uninstallPackage',
    async (packageName, { rejectWithValue }) => {
        try {
            // Remove package data from AsyncStorage
            await AsyncStorage.removeItem(packageName);

            // Update downloaded packages list
            const packsData = await AsyncStorage.getItem("packs");
            if (packsData) {
                const packs: PackageListItem[] = JSON.parse(packsData);
                const updatedPacks = packs.filter(p => p.name !== packageName);
                await AsyncStorage.setItem("packs", JSON.stringify(updatedPacks));
            }

            return packageName;
        } catch (error: any) {
            return rejectWithValue(error.message || 'Failed to uninstall package');
        }
    }
);

// Create the slice
const packagesSlice = createSlice({
    name: 'packages',
    initialState,
    reducers: {
        setCurrentPackage: (state, action: PayloadAction<PackageInfo | null>) => {
            state.currentPackage = action.payload;
        },
        clearError: (state) => {
            state.error = null;
        },
        clearCurrentPackage: (state) => {
            state.currentPackage = null;
        },
        updatePackageVersion: (state, action: PayloadAction<{ packageName: string; version: string }>) => {
            const { packageName, version } = action.payload;
            const packageIndex = state.downloaded.findIndex(p => p.name === packageName);
            if (packageIndex !== -1) {
                state.downloaded[packageIndex].version = version;
            }
        },
    },
    extraReducers: (builder) => {
        // Fetch available packages
        builder
            .addCase(fetchAvailablePackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchAvailablePackages.fulfilled, (state, action) => {
                state.loading = false;
                state.available = action.payload;
                state.lastUpdated = new Date().toISOString();
            })
            .addCase(fetchAvailablePackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'An error occurred';
            })

            // Download package
            .addCase(downloadPackage.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(downloadPackage.fulfilled, (state, action) => {
                state.loading = false;
                const packageData = action.payload;

                // Add to downloaded packages or update existing
                const existingIndex = state.downloaded.findIndex(p => p.name === packageData.name);
                if (existingIndex !== -1) {
                    state.downloaded[existingIndex] = packageData;
                } else {
                    state.downloaded.push(packageData);
                }
            })
            .addCase(downloadPackage.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'An error occurred';
            })

            // Load downloaded packages
            .addCase(loadDownloadedPackages.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(loadDownloadedPackages.fulfilled, (state, action) => {
                state.loading = false;
                state.downloaded = action.payload;
            })
            .addCase(loadDownloadedPackages.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload ?? 'An error occurred';
            })

            // Uninstall package
            .addCase(uninstallPackage.fulfilled, (state, action) => {
                state.downloaded = state.downloaded.filter(p => p.name !== action.payload);
                if (state.currentPackage?.name === action.payload) {
                    state.currentPackage = null;
                }
            })
            .addCase(uninstallPackage.rejected, (state, action) => {
                state.error = action.payload ?? 'An error occurred';
            });
    },
});

// Export actions
export const {
    setCurrentPackage,
    clearError,
    clearCurrentPackage,
    updatePackageVersion,
} = packagesSlice.actions;

// Export reducer
export default packagesSlice.reducer;

