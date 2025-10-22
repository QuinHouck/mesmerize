/**
 * Dynamic Expo App Configuration
 * This allows us to change configuration based on environment variables
 */

import 'dotenv/config';
import { ExpoConfig } from '@expo/config';

const IS_PROD = process.env.APP_ENV === 'production';

const config: ExpoConfig = {
    name: 'Mesmerize: Quiz Yourself',
    slug: 'mesmerize-quiz-yourself',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './src/icons/MesmerizeLogo.png',
    userInterfaceStyle: 'light',
    newArchEnabled: true,
    splash: {
        image: './src/icons/MesmerizeLogo.png',
        resizeMode: 'contain',
        backgroundColor: '#9981c9',
    },
    assetBundlePatterns: ['**/*'],
    ios: {
        supportsTablet: true,
        bundleIdentifier: 'com.quinhouck.frontend',
        infoPlist: {
            NSAppTransportSecurity: {
                NSAllowsArbitraryLoads: true,
            },
        },
    },
    android: {
        adaptiveIcon: {
            foregroundImage: './assets/adaptive-icon.png',
            backgroundColor: '#ffffff',
        },
    },
    web: {
        favicon: './assets/favicon.png',
    },
    extra: {
        eas: {
            projectId: 'e08a3f3f-3e36-4024-801f-12ef76cc2b47',
        },
        // Environment configuration
        environment: process.env.APP_ENV,
        apiUrl: IS_PROD ? process.env.API_PROD_URL : process.env.API_DEV_URL,
        debugMode: !IS_PROD,
    },
    owner: 'quinhouck',
    runtimeVersion: {
        policy: 'appVersion',
    },
    updates: {
        url: 'https://u.expo.dev/5766cc56-016e-463d-92c8-16a6527c3858',
    },
    plugins: ['expo-dev-client'],
};

export default config;

