// Initialize crypto polyfill before anything else
import { install } from 'react-native-quick-crypto';
install();

// Then start the app with expo-router
import 'expo-router/entry';
