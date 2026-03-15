import 'react-native-gesture-handler';
import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import useAppStore from './src/store/useAppStore';

export default function App() {
  const checkToken = useAppStore((state) => state.checkToken);
  
  useEffect(() => {
    checkToken();
  }, [checkToken]);

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator />
    </>
  );
}