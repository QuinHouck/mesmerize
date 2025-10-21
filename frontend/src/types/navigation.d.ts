// Navigation type declarations
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';

// Define the param list for your navigation stack
export type RootStackParamList = {
  Home: undefined;
  QuizOption: undefined;
  QuizGame: undefined;
  QuizResults: undefined;
  TestOption: undefined;
  TestGame: undefined;
  TestResults: undefined;
  Store: undefined;
  Acknowledgements: undefined;
};

// Navigation prop types for each screen
export type HomeScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Home'>;
export type QuizOptionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuizOption'>;
export type QuizGameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuizGame'>;
export type QuizResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'QuizResults'>;
export type TestOptionScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestOption'>;
export type TestGameScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestGame'>;
export type TestResultsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'TestResults'>;
export type StoreScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Store'>;
export type AcknowledgementsScreenNavigationProp = StackNavigationProp<RootStackParamList, 'Acknowledgements'>;

// Route prop types for each screen
export type HomeScreenRouteProp = RouteProp<RootStackParamList, 'Home'>;
export type QuizOptionScreenRouteProp = RouteProp<RootStackParamList, 'QuizOption'>;
export type QuizGameScreenRouteProp = RouteProp<RootStackParamList, 'QuizGame'>;
export type QuizResultsScreenRouteProp = RouteProp<RootStackParamList, 'QuizResults'>;
export type TestOptionScreenRouteProp = RouteProp<RootStackParamList, 'TestOption'>;
export type TestGameScreenRouteProp = RouteProp<RootStackParamList, 'TestGame'>;
export type TestResultsScreenRouteProp = RouteProp<RootStackParamList, 'TestResults'>;
export type StoreScreenRouteProp = RouteProp<RootStackParamList, 'Store'>;
export type AcknowledgementsScreenRouteProp = RouteProp<RootStackParamList, 'Acknowledgements'>;

