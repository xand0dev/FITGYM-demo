import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { Alert } from 'react-native';

const useAppStore = create((set) => ({
  userToken: null,
  hasCompletedOnboarding: false,
  isLoading: true,
  theme: 'dark',
  
  checkToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const savedTheme = await SecureStore.getItemAsync('userTheme');
      const onboarded = await SecureStore.getItemAsync('hasCompletedOnboarding');
      if (token) {
        set({ userToken: token });
      }
      if (savedTheme) {
        set({ theme: savedTheme });
      }
      set({ hasCompletedOnboarding: onboarded === 'true' });
    } catch (e) {
      console.log('Помилка читання даних', e);
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    try {
      await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
      set({ hasCompletedOnboarding: true });
    } catch (e) {
      console.log('Помилка збереження даних', e);
    }
  },

  toggleTheme: async () => {
    try {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        SecureStore.setItemAsync('userTheme', newTheme).catch(console.error);
        return { theme: newTheme };
      });
    } catch (e) {
      console.error('Помилка збереження теми', e);
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
      console.log('Помилка входу:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.detail 
        || (error.message === 'Network Error' ? 'Сервер недоступний (перевірте IP в client.js або чи запущений сервер)' : 'Невірний логін або пароль');
      Alert.alert('Помилка входу', errorMessage);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    set({ userToken: null });
  },

  register: async (username, name, email, password) => {
    try {
      const response = await apiClient.post('/register/', {
        username,
        name,
        email,
        password,
      });

      if (response.data.token) {
        const token = response.data.token;
        await SecureStore.setItemAsync('userToken', token);
        set({ userToken: token });
      }
    } catch (error) {
      console.log('Помилка реєстрації:', error?.response?.data || error.message);
      Alert.alert('Помилка реєстрації', error?.response?.data?.detail || 'Не вдалося зареєструватись');
    }
  }
}));

export default useAppStore;
