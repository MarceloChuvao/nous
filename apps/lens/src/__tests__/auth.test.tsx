import { act, renderHook } from '@testing-library/react';
import { useAuthStore } from '../store/auth';

describe('useAuthStore', () => {
    beforeEach(() => {
        // Reset store before each test
        act(() => {
            useAuthStore.setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
                error: null,
            });
        });
    });

    it('should initialize with default values', () => {
        const { result } = renderHook(() => useAuthStore());
        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should set user and isAuthenticated on login', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

        act(() => {
            useAuthStore.setState({ user: mockUser, isAuthenticated: true });
        });

        expect(result.current.user).toEqual(mockUser);
        expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user and isAuthenticated on logout', () => {
        const { result } = renderHook(() => useAuthStore());
        const mockUser = { id: '1', email: 'test@example.com', name: 'Test User' };

        act(() => {
            useAuthStore.setState({ user: mockUser, isAuthenticated: true });
        });

        act(() => {
            result.current.logout();
        });

        expect(result.current.user).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
    });

    it('should update isLoading state', () => {
        const { result } = renderHook(() => useAuthStore());

        act(() => {
            useAuthStore.setState({ isLoading: true });
        });

        expect(result.current.isLoading).toBe(true);

        act(() => {
            useAuthStore.setState({ isLoading: false });
        });

        expect(result.current.isLoading).toBe(false);
    });

    it('should update error state', () => {
        const { result } = renderHook(() => useAuthStore());
        const errorMessage = 'Invalid credentials';

        act(() => {
            useAuthStore.setState({ error: errorMessage });
        });

        expect(result.current.error).toBe(errorMessage);
    });
});
