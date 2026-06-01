import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import useAppStore from './src/store/useAppStore';
export default function App() {
  const checkToken = useAppStore((state) => state.checkToken);
  const theme = useAppStore((state) => state.theme);

  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}