'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User, AuthState } from '@/types';
import { authAPI, setAuthTokens, clearAuthTokens } from '@/lib/api';
import Cookies from 'js-cookie';

interface AuthStore extends AuthState {
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUserData: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: undefined,
      token: undefined,
      refreshToken: undefined,
      isAuthenticated: false,
      isLoading: false,
      error: undefined,

      // Actions
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: undefined });
        
        try {
          const response = await authAPI.login({ email, password });
          const { access, refresh, user } = response.data;
          
          // Store tokens
          setAuthTokens(access, refresh);
          
          // Store user in cookies
          Cookies.set('user', JSON.stringify(user), { expires: 7 });
          
          set({
            user,
            token: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: undefined });
        
        try {
          const response = await authAPI.register(userData);
          const { access, refresh, user } = response.data;
          
          // Store tokens
          setAuthTokens(access, refresh);
          
          // Store user in cookies
          Cookies.set('user', JSON.stringify(user), { expires: 7 });
          
          set({
            user,
            token: access,
            refreshToken: refresh,
            isAuthenticated: true,
            isLoading: false,
            error: undefined,
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Registration failed';
          set({
            isLoading: false,
            error: errorMessage,
            isAuthenticated: false,
          });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        
        try {
          await authAPI.logout();
        } catch (error) {
          // Continue with logout even if API call fails
          console.error('Logout API call failed:', error);
        } finally {
          // Clear all auth data
          clearAuthTokens();
          
          set({
            user: undefined,
            token: undefined,
            refreshToken: undefined,
            isAuthenticated: false,
            isLoading: false,
            error: undefined,
          });
        }
      },

      refreshUserData: async () => {
        const { token } = get();
        if (!token) return;
        
        try {
          const response = await authAPI.getProfile();
          const user = response.data;
          
          // Update user in cookies
          Cookies.set('user', JSON.stringify(user), { expires: 7 });
          
          set({ user });
        } catch (error) {
          console.error('Failed to refresh user data:', error);
        }
      },

      clearError: () => set({ error: undefined }),
      
      setLoading: (loading: boolean) => set({ isLoading: loading }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => ({
        getItem: (name) => {
          // Try to get from cookies first, fallback to localStorage
          const cookieValue = Cookies.get('user');
          if (cookieValue && name === 'auth-storage') {
            try {
              const user = JSON.parse(cookieValue);
              const token = Cookies.get('access_token');
              const refreshToken = Cookies.get('refresh_token');
              
              return JSON.stringify({
                state: {
                  user,
                  token,
                  refreshToken,
                  isAuthenticated: !!token,
                  isLoading: false,
                  error: undefined,
                },
                version: 0,
              });
            } catch {
              return null;
            }
          }
          return localStorage.getItem(name);
        },
        setItem: (name, value) => {
          localStorage.setItem(name, value);
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      })),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
