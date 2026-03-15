import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { Alert } from 'react-native';

const useAppStore = create((set) => ({
  userToken: null,
  isLoading: true,
  
  checkToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        set({ userToken: token });
      }
    } catch (e) {
      console.log('Помилка читання токена', e);
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/login/', {
        username,
        password,
      });

      const token = response.data.token;
      await SecureStore.setItemAsync('userToken', token);
      set({ userToken: token });
      
    } catch (error) {
      console.log('Помилка входу:', error);
      Alert.alert('Помилка', 'Невірний логін або пароль або сервер недоступний');
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ userToken: null });
  }
}));

export default useAppStore;
