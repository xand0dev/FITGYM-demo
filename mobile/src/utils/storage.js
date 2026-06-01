// Cross-platform storage wrapper.
// On native (iOS/Android) — uses expo-secure-store.
// On web — falls back to localStorage (SecureStore is unavailable on web and
// throws "ExpoSecureStore.default.getValueWithKeyAsync is not a function").
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStorage = {
  getItemAsync: async (key) => {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(key);
  },
  setItemAsync: async (key, value) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(key, value);
  },
  deleteItemAsync: async (key) => {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(key);
  },
};

const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export default storage;
