import 'react-native-gesture-handler';  // Ensure this is at the top of the file
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import React, { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { StatusBar } from 'expo-status-bar';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// Redux store
import { store, persistor } from './src/store';
import { setOnlineStatus } from './src/store/slices/networkSlice';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import QuizOptionScreen from './src/screens/QuizOptionScreen';
import QuizGameScreen from './src/screens/QuizGameScreen';
import StoreScreen from './src/screens/StoreScreen';
import QuizResultsScreen from './src/screens/QuizResultsScreen';
import TestOptionScreen from './src/screens/TestOptionScreen';
import TestGameScreen from './src/screens/TestGameScreen';
import TestResultsScreen from './src/screens/TestResultsScreen';
import Acknowledgements from './src/screens/Acknowledgements';

// Hooks
import { useNetwork } from './src/hooks/useRedux';

// Types
import type { RootStackParamList } from './src/types/navigation';

const Stack = createStackNavigator<RootStackParamList>();

export default function App(): React.JSX.Element {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

function AppContent(): React.JSX.Element {
  const { dispatch } = useNetwork();

  useEffect(() => {
    // Set initial network state
    NetInfo.fetch().then(state => {
      dispatch(setOnlineStatus({
        isConnected: state?.isConnected ?? false,
        isInternetReachable: state?.isInternetReachable ?? false,
        type: state.type,
      }));
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus({
        isConnected: state?.isConnected ?? false,
        isInternetReachable: state?.isInternetReachable ?? false,
        type: state.type,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <NavigationContainer>
        <Stack.Navigator 
          screenOptions={{
            gestureEnabled: false, 
            title: 'Screens',
            animation: "fade",
          }}
        >
          <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
          <Stack.Screen options={{ headerShown: false }} name="Store" component={StoreScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizOption" component={QuizOptionScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizGame" component={QuizGameScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizResults" component={QuizResultsScreen} />
          <Stack.Screen options={{ headerShown: false }} name="TestOption" component={TestOptionScreen} />
          <Stack.Screen options={{ headerShown: false }} name="TestGame" component={TestGameScreen} />
          <Stack.Screen options={{ headerShown: false }} name="TestResults" component={TestResultsScreen} />
          <Stack.Screen options={{ headerShown: false }} name="Acknowledgements" component={Acknowledgements} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

