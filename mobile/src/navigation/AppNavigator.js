import React, { useContext } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import HomeScreen from '../screens/HomeScreen';
import CabinetScreen from '../screens/CabinetScreen';
import { COLORS } from '../constants/theme';
import { AuthContext } from '../store/AuthContext';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = route.name === 'Home' ? 'fitness' : 'person';
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { backgroundColor: COLORS.card, borderTopColor: '#222', height: 60, paddingBottom: 10 },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Головна' }} />
      <Tab.Screen name="Cabinet" component={CabinetScreen} options={{ title: 'Кабінет' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  // Беремо дані з Контексту
  const { userToken, isLoading } = useContext(AuthContext);

  // Поки перевіряємо токен при старті — показуємо крутилку
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', backgroundColor: COLORS.background }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {userToken == null ? (
          // Якщо токена немає - показуємо екран входу
          <Stack.Screen name="Auth" component={LoginScreen} />
        ) : (
          // Якщо токен є - пускаємо в додаток
          <Stack.Screen name="Main" component={MainTabs} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}