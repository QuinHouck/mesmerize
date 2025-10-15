/**
 * Environment Configuration
 * Access environment variables through this centralized config
 */

// For Expo, we need to use Constants to access environment variables
import Constants from 'expo-constants';
const { extra } = Constants.expoConfig;

export default {
    apiUrl: extra.apiUrl,
    environment: extra.environment,
    debugMode: extra.debugMode,
};