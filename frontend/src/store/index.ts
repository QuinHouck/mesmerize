import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer, PersistConfig } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { combineReducers } from '@reduxjs/toolkit';

// Import our slices
import packagesReducer from './slices/packagesSlice';
import userReducer from './slices/userSlice';
import quizReducer from './slices/quizSlice';
import networkReducer from './slices/networkSlice';
import testReducer from './slices/testSlice';

// Combine reducers
const rootReducer = combineReducers({
  packages: packagesReducer,
  user: userReducer,
  quiz: quizReducer,
  network: networkReducer,
  test: testReducer,
});

// Configure persistence
const persistConfig: PersistConfig<ReturnType<typeof rootReducer>> = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['packages', 'user'], // Only persist packages and user data, not game state
};

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

// Export types for TypeScript
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

