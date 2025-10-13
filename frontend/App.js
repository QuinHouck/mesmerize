import 'react-native-gesture-handler';  // Ensure this is at the top of the file
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';

import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

// Redux store
import { store, persistor } from './src/store';
import { setOnlineStatus } from './src/store/slices/networkSlice';

import HomeScreen from './src/screens/HomeScreen';
import QuizOptionScreen from './src/screens/QuizOptionScreen';
import QuizGameScreen from './src/screens/QuizGameScreen';
import StoreScreen from './src/screens/StoreScreen';
import QuizResultsScreen from './src/screens/QuizResultsScreen';
import TestOptionScreen from './src/screens/TestOptionScreen';
import TestGameScreen from './src/screens/TestGameScreen';
import Acknowledgements from './src/screens/Acknowledgements';
import { useNetwork } from './src/hooks/useRedux';

const Stack = createStackNavigator();

export default function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <AppContent />
      </PersistGate>
    </Provider>
  );
}

function AppContent() {
  const { dispatch } = useNetwork();

  useEffect(() => {
    // Set initial network state
    NetInfo.fetch().then(state => {
      dispatch(setOnlineStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      }));
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener(state => {
      dispatch(setOnlineStatus({
        isConnected: state.isConnected,
        isInternetReachable: state.isInternetReachable,
        type: state.type,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, [dispatch]);

  return (
    <GestureHandlerRootView>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{gestureEnabled: false, title: 'Screens'}}>
          <Stack.Screen options={{ headerShown: false }} name="Home" component={HomeScreen} />
          <Stack.Screen options={{ headerShown: false }} name="Store" component={StoreScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizOption" component={QuizOptionScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizGame" component={QuizGameScreen} />
          <Stack.Screen options={{ headerShown: false }} name="QuizResults" component={QuizResultsScreen} />
          <Stack.Screen options={{ headerShown: false }} name="TestOption" component={TestOptionScreen} />
          <Stack.Screen options={{ headerShown: false }} name="TestGame" component={TestGameScreen} />
          <Stack.Screen options={{ headerShown: false }} name="Acknowledgements" component={Acknowledgements} />
        </Stack.Navigator>
        <StatusBar style="light" />
      </NavigationContainer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },

  iconContainer: {
    height: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 10,
  },

  icon: {
    height: '80%',
    aspectRatio: 1,
  },
});
