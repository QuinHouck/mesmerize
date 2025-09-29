import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import PackageService from '../../services/package.service';

// Initial state
const initialState = {
  available: [],
  downloaded: [],
  currentPackage: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

// Async thunk for fetching available packages
export const fetchAvailablePackages = createAsyncThunk(
  'packages/fetchAvailable',
  async (_, { rejectWithValue }) => {
    try {
      const response = await PackageService.getAvailable();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch packages');
    }
  }
);

// Async thunk for downloading a package
export const downloadPackage = createAsyncThunk(
  'packages/downloadPackage',
  async (packageInfo, { rejectWithValue }) => {
    try {
      // Fetch package data
      const response = await PackageService.getPackage(packageInfo.name);
      
      // Create package object with all data
      const packageData = {
        title: packageInfo.title,
        name: packageInfo.name,
        attributes: packageInfo.attributes,
        divisions: packageInfo.divisions,
        accepted: packageInfo.accepted,
        test_division: packageInfo.test_division,
        has_maps: packageInfo.has_maps,
        test_time: packageInfo.test_time,
        sort_attr: packageInfo.sort_attr,
        ranged: packageInfo.ranged,
        num: response.data.length,
        version: packageInfo.version,
        items: response.data
      };

      // Save to AsyncStorage
      await AsyncStorage.setItem(packageData.name, JSON.stringify(packageData));
      
      // Update downloaded packages list
      const existingPacks = await AsyncStorage.getItem("packs");
      let packs = existingPacks ? JSON.parse(existingPacks) : [];
      
      const packInfo = {
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
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to download package');
    }
  }
);

// Async thunk for loading downloaded packages
export const loadDownloadedPackages = createAsyncThunk(
  'packages/loadDownloaded',
  async (_, { rejectWithValue }) => {
    try {
      const packsData = await AsyncStorage.getItem("packs");
      if (!packsData) return [];
      
      const packs = JSON.parse(packsData);
      const downloadedPackages = [];
      
      for (const pack of packs) {
        const packageData = await AsyncStorage.getItem(pack.name);
        if (packageData) {
          downloadedPackages.push(JSON.parse(packageData));
        }
      }
      
      return downloadedPackages;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to load downloaded packages');
    }
  }
);

// Async thunk for uninstalling a package
export const uninstallPackage = createAsyncThunk(
  'packages/uninstallPackage',
  async (packageName, { rejectWithValue }) => {
    try {
      // Remove package data from AsyncStorage
      await AsyncStorage.removeItem(packageName);
      
      // Update downloaded packages list
      const packsData = await AsyncStorage.getItem("packs");
      if (packsData) {
        const packs = JSON.parse(packsData);
        const updatedPacks = packs.filter(p => p.name !== packageName);
        await AsyncStorage.setItem("packs", JSON.stringify(updatedPacks));
      }
      
      return packageName;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to uninstall package');
    }
  }
);

// Create the slice
const packagesSlice = createSlice({
  name: 'packages',
  initialState,
  reducers: {
    setCurrentPackage: (state, action) => {
      state.currentPackage = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPackage: (state) => {
      state.currentPackage = null;
    },
    updatePackageVersion: (state, action) => {
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
        state.error = action.payload;
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
        state.error = action.payload;
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
        state.error = action.payload;
      })
      
      // Uninstall package
      .addCase(uninstallPackage.fulfilled, (state, action) => {
        state.downloaded = state.downloaded.filter(p => p.name !== action.payload);
        if (state.currentPackage?.name === action.payload) {
          state.currentPackage = null;
        }
      })
      .addCase(uninstallPackage.rejected, (state, action) => {
        state.error = action.payload;
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
