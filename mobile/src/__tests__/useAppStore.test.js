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

  it('3. should use fallback token if api fetch fails', async () => {
    const { login } = useAppStore.getState();
    const mockApiClient = require('../api/client');
    mockApiClient.post.mockRejectedValueOnce(new Error('Network Error'));

    await login('test', 'password');

    const state = useAppStore.getState();
    expect(state.userToken).toBe('mock-jwt-token-xd-123');
  });

  it('4. should clear userToken on logout', async () => {
    useAppStore.setState({ userToken: 'existing-token' });

    const { logout } = useAppStore.getState();
    await logout();

    const state = useAppStore.getState();
    expect(state.userToken).toBeNull();
  });
});
