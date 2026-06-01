import { Platform } from 'react-native';
import apiClient from '../api/client';

// expo-notifications push tokens are not supported in Expo Go since SDK 53.
// This module uses dynamic import to avoid initializing the module at load time,
// which would crash Expo Go.

async function getNotifications() {
  return import('expo-notifications');
}

// Реєструє Expo push-токен пристрою на бекенді (POST /me/device-token/).
// Best-effort: будь-яка помилка → null, без падіння застосунку.
// Викликається після успішного логіну / відновлення сесії.
export async function registerForPushNotificationsAsync() {
  try {
    if (Platform.OS === 'web') return null; // Expo push не підтримується на web

    const Notifications = await getNotifications();
    const Device = await import('expo-device');
    if (!Device.isDevice) return null; // емулятор не видає реальний push-токен

    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    if (finalStatus !== 'granted') return null;

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FITGYM',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    let projectId;
    try {
      const Constants = (await import('expo-constants')).default;
      projectId =
        Constants?.expoConfig?.extra?.eas?.projectId ??
        Constants?.easConfig?.projectId;
    } catch {
      projectId = undefined;
    }

    const tokenResp = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const expoPushToken = tokenResp?.data;
    if (!expoPushToken) return null;

    await apiClient.post('/me/device-token/', {
      expo_push_token: expoPushToken,
      platform: Platform.OS,
    });
    return expoPushToken;
  } catch {
    return null;
  }
}

export async function scheduleClassReminder(session) {
  try {
    const Notifications = await getNotifications();
    const startTime = new Date(session.start_at);
    const reminderTime = new Date(startTime.getTime() - 60 * 60 * 1000);

    if (reminderTime <= new Date()) return null;

    await Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'FITGYM',
        importance: Notifications.AndroidImportance.MAX,
      });
    }

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title: '🏋️ Заняття через годину!',
        body: `${session.class_name} о ${startTime.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })}`,
        data: { sessionId: session.id },
      },
      trigger: { date: reminderTime },
    });

    return id;
  } catch {
    return null;
  }
}

export async function cancelClassReminder(notificationId) {
  if (!notificationId) return;
  try {
    const Notifications = await getNotifications();
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  } catch {
    // ignore
  }
}
