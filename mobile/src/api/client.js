import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const BASE_URL = process.env.EXPO_PUBLIC_API_URL
  || (Platform.OS === 'web' ? 'http://localhost:8000/api' : 'http://10.0.2.2:8000/api');

const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Перехоплювач для додавання токена (аналог твого getToken [cite: 2034])
apiClient.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('userToken');
  if (token) {
    config.headers.Authorization = `Token ${token}`; // Твій формат Token [cite: 2038]
  }
  return config;
});

export default apiClient;