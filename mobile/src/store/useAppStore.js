import { create } from 'zustand';
import SecureStore from '../utils/storage';
import apiClient from '../api/client';
import Alert from '../utils/dialog';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const useAppStore = create((set) => ({
  userToken: null,
  user: null,           // { id, member_id, gym_id, full_name, is_staff, ... }
  hasCompletedOnboarding: false,
  isLoading: true,
  theme: 'dark',
  accentColor: '#e60000',
  fitnessGoal: null,
  streak: 0,
  lastActiveDate: null,
  fitCoins: 0,
  aiChatHistory: [],
  
  checkToken: async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      const savedTheme = await SecureStore.getItemAsync('userTheme');
      const onboarded = await SecureStore.getItemAsync('hasCompletedOnboarding');
      const savedAccentColor = await SecureStore.getItemAsync('userAccentColor');
      const savedGoal = await SecureStore.getItemAsync('userFitnessGoal');
      const savedStreak = await SecureStore.getItemAsync('userStreak');
      const savedLastDate = await SecureStore.getItemAsync('lastActiveDate');
      const savedCoins = await SecureStore.getItemAsync('userFitCoins');
      const savedChat = await SecureStore.getItemAsync('aiChatHistory');
      
      if (token) {
        set({ userToken: token });
        // Відновлюємо збережений профіль
        const savedUser = await SecureStore.getItemAsync('userData');
        if (savedUser) {
          try { set({ user: JSON.parse(savedUser) }); } catch (_) {}
        }
        // Реєструємо push-токен (best-effort, не блокує старт)
        registerForPushNotificationsAsync().catch(() => {});
      }
      if (savedTheme) {
        set({ theme: savedTheme });
      }
      if (savedAccentColor) {
        set({ accentColor: savedAccentColor });
      }
      if (savedGoal) {
        set({ fitnessGoal: savedGoal });
      }
      if (savedStreak) {
        set({ streak: parseInt(savedStreak) });
      }
      if (savedLastDate) {
        set({ lastActiveDate: savedLastDate });
      }
      if (savedCoins) {
        set({ fitCoins: parseInt(savedCoins) });
      }
      if (savedChat) {
        set({ aiChatHistory: JSON.parse(savedChat) });
      } else {
        set({ aiChatHistory: [{ id: '1', role: 'ai', text: "Привіт! Я твій персональний ШІ-тренер FITGYM Core. Запитуй мене про що завгодно: складання програм, дієти або мотивацію. 🔥" }] });
      }
      set({ hasCompletedOnboarding: onboarded === 'true' });
    } catch (e) {
      console.log('Помилка читання даних', e);
    } finally {
      set({ isLoading: false });
    }
  },

  completeOnboarding: async () => {
    set({ hasCompletedOnboarding: true });
    try {
      await SecureStore.setItemAsync('hasCompletedOnboarding', 'true');
    } catch (e) {
      console.log('Помилка збереження даних', e);
    }
  },

  toggleTheme: async () => {
    try {
      set((state) => {
        const newTheme = state.theme === 'light' ? 'dark' : 'light';
        SecureStore.setItemAsync('userTheme', newTheme).catch(console.error);
        return { theme: newTheme };
      });
    } catch (e) {
      console.error('Помилка збереження теми', e);
    }
  },

  setAccentColor: async (color) => {
    try {
      await SecureStore.setItemAsync('userAccentColor', color);
      set({ accentColor: color });
    } catch (e) {
      console.log('Помилка збереження кольору', e);
    }
  },

  setFitnessGoal: async (goal) => {
    try {
      await SecureStore.setItemAsync('userFitnessGoal', goal);
      set({ fitnessGoal: goal });
    } catch (e) {
      console.log('Помилка збереження цілі', e);
    }
  },

  updateStreak: async () => {
    try {
      const todayDate = new Date().toDateString();
      set((state) => {
        let newStreak = state.streak;
        
        if (state.lastActiveDate === todayDate) {
          // Already logged today
          return state;
        }

        if (state.lastActiveDate) {
          const lastDate = new Date(state.lastActiveDate);
          const today = new Date(todayDate);
          const diffTime = Math.abs(today - lastDate);
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)); 
          
          if (diffDays === 1) {
            newStreak += 1; // Consecutive day
          } else if (diffDays > 1) {
            newStreak = 1; // Streak broken
          }
        } else {
          newStreak = 1; // First active day
        }

        SecureStore.setItemAsync('userStreak', newStreak.toString());
        SecureStore.setItemAsync('lastActiveDate', todayDate);
        return { streak: newStreak, lastActiveDate: todayDate };
      });
    } catch (e) {
      console.log('Помилка оновлення стріку', e);
    }
  },

  addFitCoins: async (amount) => {
    try {
      set((state) => {
        const newTotal = state.fitCoins + amount;
        SecureStore.setItemAsync('userFitCoins', newTotal.toString());
        return { fitCoins: newTotal };
      });
    } catch (e) {
      console.log('Помилка оновлення коїнів', e);
    }
  },

  updateAiChatHistory: async (messages) => {
    try {
      const trimmed = messages.slice(-40); // Зберігаємо останні 40 повідомлень
      await SecureStore.setItemAsync('aiChatHistory', JSON.stringify(trimmed));
      set({ aiChatHistory: trimmed });
    } catch (e) {
      console.log('Помилка збереження історії чату', e);
    }
  },

  clearAiChatHistory: async () => {
    try {
      const defaultState = [{ id: '1', role: 'ai', text: "Привіт! Я твій персональний ШІ-тренер FITGYM Core. Запитуй мене про що завгодно: складання програм, дієти або мотивацію. 🔥" }];
      await SecureStore.setItemAsync('aiChatHistory', JSON.stringify(defaultState));
      set({ aiChatHistory: defaultState });
    } catch(e) {
      console.log('Помилка очищення чату', e);
    }
  },

  login: async (username, password) => {
    try {
      const response = await apiClient.post('/login/', { username, password });
      const token = response.data.token;

      set({ userToken: token });
      await SecureStore.setItemAsync('userToken', token);

      // Завантажуємо профіль щоб отримати member_id і gym_id для QR
      try {
        const meResponse = await apiClient.get('/me/', {
          headers: { Authorization: `Token ${token}` },
        });
        set({ user: meResponse.data });
        await SecureStore.setItemAsync('userData', JSON.stringify(meResponse.data));
      } catch (meError) {
        console.log('Не вдалося завантажити профіль:', meError.message);
      }

      // Реєструємо Expo push-токен на бекенді (best-effort)
      registerForPushNotificationsAsync().catch(() => {});

    } catch (error) {
      console.log('Помилка входу:', error?.response?.data || error.message);
      const errorMessage = error?.response?.data?.detail 
        || (error.message === 'Network Error' ? 'Сервер недоступний (перевірте IP в client.js або чи запущений сервер)' : 'Невірний логін або пароль');
      Alert.alert('Помилка входу', errorMessage);
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('userToken');
    await SecureStore.deleteItemAsync('userData');
    set({ userToken: null, user: null });
  },

  register: async (username, name, email, password) => {
    try {
      const response = await apiClient.post('/register/', {
        username,
        name,
        email,
        password,
      });

      if (response.data.token) {
        const token = response.data.token;
        set({ userToken: token });
        SecureStore.setItemAsync('userToken', token).catch(console.error);
      }
    } catch (error) {
      console.log('Помилка реєстрації:', error?.response?.data || error.message);
      Alert.alert('Помилка реєстрації', error?.response?.data?.detail || 'Не вдалося зареєструватись');
    }
  }
}));

export default useAppStore;
