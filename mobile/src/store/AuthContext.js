import React, { createContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import apiClient from '../api/client';
import { Alert } from 'react-native';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [userToken, setUserToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Перевіряємо, чи є токен при запуску додатка
  const checkToken = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        setUserToken(token);
      }
    } catch (e) {
      console.log('Помилка читання токена', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkToken();
  }, []);

  // Функція логіну (звертається до твого Django)
  const login = async (username, password) => {
    try {
      // Робимо POST запит на твій ендпоінт /api/login/
      const response = await apiClient.post('/login/', {
        username,
        password,
      });

      const token = response.data.token;
      
      // Зберігаємо токен безпечно
      await SecureStore.setItemAsync('userToken', token);
      setUserToken(token);
      
    } catch (error) {
      console.log(error);
      Alert.alert('Помилка', 'Невірний логін або пароль');
    }
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('userToken');
    setUserToken(null);
  };

  return (
    <AuthContext.Provider value={{ login, logout, userToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};