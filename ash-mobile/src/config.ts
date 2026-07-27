import { Platform } from 'react-native';

// Android emulator maps host loopback to 10.0.2.2; iOS simulator can use localhost.
// Point this at your deployed ash-backend URL for a real device / production build.
const DEV_HOST = Platform.OS === 'android' ? '10.0.2.2' : 'localhost';

export const API_BASE_URL = __DEV__
  ? `http://${DEV_HOST}:3000/api/v1`
  : 'https://api.your-ash-domain.com/api/v1';
