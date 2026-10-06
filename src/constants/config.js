import { Platform } from 'react-native';

// Deployed Live Production Backend URL on Render:
export const PROD_API_URL = 'https://hostel-greviance-backend.onrender.com/api/v1';

// Local Development Fallback:
const DEV_API_URL = Platform.OS === 'android'
  ? 'http://10.0.2.2:5000/api/v1'
  : 'http://localhost:5000/api/v1';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || PROD_API_URL;
