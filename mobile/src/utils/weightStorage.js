import * as SecureStore from 'expo-secure-store';

const KEY = 'weightLog';

export async function getWeightLog() {
  try {
    const raw = await SecureStore.getItemAsync(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addWeightEntry(value) {
  const log = await getWeightLog();
  const entry = { date: new Date().toISOString().split('T')[0], value };
  const updated = [...log, entry].slice(-30); // keep last 30 entries
  await SecureStore.setItemAsync(KEY, JSON.stringify(updated));
  return updated;
}

export function getLastN(log, n) {
  return log.slice(-n);
}
