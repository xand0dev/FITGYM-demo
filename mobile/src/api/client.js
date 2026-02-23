import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const apiClient = axios.create({
  // Вказуємо твій новий IP для Wi-Fi мережі
  baseURL: 'http://192.168.0.50:8000/api', 
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