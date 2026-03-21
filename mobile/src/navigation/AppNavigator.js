import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { View, ActivityIndicator } from 'react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import WorkoutsScreen from '../screens/WorkoutsScreen';
import ProgressScreen from '../screens/ProgressScreen';
import CabinetScreen from '../screens/CabinetScreen';
import ClassDetailsScreen from '../screens/ClassDetailsScreen';
import ToolsScreen from '../screens/ToolsScreen';
import EducationScreen from '../screens/EducationScreen';
import ActiveWorkoutScreen from '../screens/ActiveWorkoutScreen';
import MembershipScreen from '../screens/MembershipScreen';
import { useTheme } from '../constants/theme';
import useAppStore from '../store/useAppStore';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const COLORS = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Workouts') iconName = 'barbell';
          else if (route.name === 'Tools') iconName = 'calculator';
          else if (route.name === 'Education') iconName = 'book';
          else if (route.name === 'Profile') iconName = 'person';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarStyle: { 
          backgroundColor: COLORS.card, 
          borderTopColor: Object.hasOwn(COLORS, 'border') ? COLORS.border : '#222', 
          height: 60, 
          paddingBottom: 10 
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        headerStyle: { backgroundColor: COLORS.background },
        headerTintColor: COLORS.text,
        headerShown: false
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Головна' }} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} options={{ title: 'Тренування' }} />
      <Tab.Screen name="Tools" component={ToolsScreen} options={{ title: 'Інструменти' }} />
      <Tab.Screen name="Education" component={EducationScreen} options={{ title: 'Довідник' }} />
      <Tab.Screen name="Profile" component={CabinetScreen} options={{ title: 'Кабінет' }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const userToken = useAppStore((state) => state.userToken);
  const isLoading = useAppStore((state) => state.isLoading);
  const COLORS = useTheme();

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
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="ClassDetails" component={ClassDetailsScreen} />
        <Stack.Screen name="ActiveWorkout" component={ActiveWorkoutScreen} />
        <Stack.Screen name="Membership" component={MembershipScreen} />
        {/* Temporarily disabled login/register screens
        <Stack.Screen name="Auth" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        */}
      </Stack.Navigator>
    </NavigationContainer>
  );
}