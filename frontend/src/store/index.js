import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import our slices
import packagesReducer from './slices/packagesSlice';
import userReducer from './slices/userSlice';
import gameReducer from './slices/gameSlice';
import networkReducer from './slices/networkSlice';

// Configure persistence
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['packages', 'user'], // Only persist packages and user data, not game state
};

// Combine reducers
const rootReducer = combineReducers({
  packages: packagesReducer,
  user: userReducer,
  game: gameReducer,
  network: networkReducer,
});

// Create persisted reducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Configure store
export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Create persistor
export const persistor = persistStore(store);

// Export types for TypeScript (if you decide to migrate later)
// export type RootState = ReturnType<typeof store.getState>;
// export type AppDispatch = typeof store.dispatch;
