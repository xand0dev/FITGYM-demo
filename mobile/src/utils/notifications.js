import { Platform } from 'react-native';

// expo-notifications push tokens are not supported in Expo Go since SDK 53.
// This module uses dynamic import to avoid initializing the module at load time,
// which would crash Expo Go.

async function getNotifications() {
  return import('expo-notifications');
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
