export const COLORS = {
  background: '#080808', // З твого admin-body [cite: 2343]
  card: '#111111',       // Темні картки [cite: 2381]
  primary: '#e60000',    // Твій фірмовий червоний [cite: 2409]
  text: '#ffffff',       // Білий текст [cite: 2049]
  muted: '#888888',      // Сірий текст [cite: 2111]
  error: '#ff4d4d',      // Колір для видалення/помилок [cite: 2351]
};

export const LIGHT_COLORS = {
  background: '#f5f5f5',       // Світлий фон
  card: '#ffffff',             // Світлі картки (шапка)
  primary: '#e60000',          // Той самий фірмовий червоний
  text: '#000000',             // Чорний текст
  muted: '#666666',            // Темніший сірий
  error: '#ff4d4d',            // Колір помилок
  border: '#e0e0e0',           // Межі (бордери)
  cardBackground: '#ffffff',   // Фон елементів
  darkerCard: '#f0f0f0'        // Трохи темніший фон для плашок
};

import useAppStore from '../store/useAppStore';

export const useTheme = () => {
  const themeMode = useAppStore(state => state.theme);
  return themeMode === 'light' ? LIGHT_COLORS : COLORS;
};