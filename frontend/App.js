import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import PlayScreen from './src/screens/PlayScreen';
import GameScreen from './src/screens/GameScreen';
import StoreScreen from './src/screens/StoreScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          height: 90,
          paddingHorizontal: 5,
          paddingTop: 5,
          backgroundColor: '#222222',
          borderTopWidth: 3,
          borderTopColor: '#55D1FF',
        },
        tabBarIcon: ({ focused }) => {
          switch(route.name){
            case "Play": 
              return (
                <View style={styles.iconContainer}>
                  {/* <FeaturedIcon style={styles.icon} color={focused ? "#55D1FF" : "#ffffff"}/> */}
                </View>
              );
            case "Store": 
              return (
                <View style={styles.iconContainer}>
                  {/* <FeedIcon style={styles.icon} color={focused ? "#55D1FF" : "#ffffff"}/> */}
                </View>
              );
            default:
              
          }
        },
        tabBarActiveTintColor: '#55D1FF',
        tabBarInactiveTintColor: '#ffffff',
      })}
    >
      <Tab.Screen name="Play" component={PlayScreen} />
      <Tab.Screen name="Store" component={StoreScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{gestureEnabled: false}}>
        <Stack.Screen options={{ headerShown: false }} name="Tabs" component={Tabs} />
        <Stack.Screen options={{ headerShown: false }} name="Game" component={GameScreen} />
      </Stack.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
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
