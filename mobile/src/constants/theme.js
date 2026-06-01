export const COLORS = {
  background: '#080808',
  card: '#111111',
  primary: '#e60000',
  text: '#ffffff',
  muted: '#888888',
  error: '#ff4d4d',
  border: '#222222',
  cardBackground: '#1a1a1a',
  darkerCard: '#141414',
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
  const accentColor = useAppStore(state => state.accentColor);
  
  const baseTheme = themeMode === 'light' ? LIGHT_COLORS : COLORS;
  
  return {
    ...baseTheme,
    primary: accentColor || baseTheme.primary
  };
};