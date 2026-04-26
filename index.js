// Initialize crypto polyfill before anything else
import { install } from 'react-native-quick-crypto';
import "./src/global.css"
install();

// Then start the app with expo-router
import 'expo-router/entry';
