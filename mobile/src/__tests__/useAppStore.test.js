import useAppStore from '../store/useAppStore';

// Mock SecureStore and apiClient
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('../api/client', () => ({
  post: jest.fn(),
}));

const initialState = useAppStore.getState();

describe('useAppStore', () => {
  beforeEach(() => {
    useAppStore.setState(initialState, true);
  });

  it('1. should have initial state unauthenticated', () => {
    const state = useAppStore.getState();
    expect(state.userToken).toBeNull();
    expect(state.isLoading).toBe(true);
  });

  it('2. should set userToken on successful login', async () => {
    const { login } = useAppStore.getState();
    const mockApiClient = require('../api/client');
    mockApiClient.post.mockResolvedValueOnce({ data: { token: 'new-token' } });

    await login('test', 'password');

    const state = useAppStore.getState();
    expect(state.userToken).toBe('new-token');
  });

  it('3. should not set userToken if api fetch fails', async () => {
    const { login } = useAppStore.getState();
    const mockApiClient = require('../api/client');
    mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

    await login('test', 'password');

    const state = useAppStore.getState();
    expect(state.userToken).toBeNull();
  });

  it('4. should clear userToken on logout', async () => {
    useAppStore.setState({ userToken: 'existing-token' });

    const { logout } = useAppStore.getState();
    await logout();

    const state = useAppStore.getState();
    expect(state.userToken).toBeNull();
  });

  it('5. addFitCoins should increase fitCoins balance', async () => {
    useAppStore.setState({ fitCoins: 100 });
    const { addFitCoins } = useAppStore.getState();

    await addFitCoins(50);

    expect(useAppStore.getState().fitCoins).toBe(150);
  });

  it('6. updateStreak same day should not increment', async () => {
    const today = new Date().toDateString();
    useAppStore.setState({ streak: 3, lastActiveDate: today });

    const { updateStreak } = useAppStore.getState();
    await updateStreak();

    expect(useAppStore.getState().streak).toBe(3);
  });

  it('7. updateStreak next consecutive day should increment', async () => {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    useAppStore.setState({ streak: 3, lastActiveDate: yesterday });

    const { updateStreak } = useAppStore.getState();
    await updateStreak();

    expect(useAppStore.getState().streak).toBe(4);
  });

  it('8. updateStreak after gap should reset to 1', async () => {
    const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toDateString();
    useAppStore.setState({ streak: 5, lastActiveDate: twoDaysAgo });

    const { updateStreak } = useAppStore.getState();
    await updateStreak();

    expect(useAppStore.getState().streak).toBe(1);
  });

  it('9. updateStreak first ever activity sets streak to 1', async () => {
    useAppStore.setState({ streak: 0, lastActiveDate: null });

    const { updateStreak } = useAppStore.getState();
    await updateStreak();

    expect(useAppStore.getState().streak).toBe(1);
  });
});
