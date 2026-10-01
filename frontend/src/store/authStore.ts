import { create } from 'zustand';
import {
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  ResetPasswordPayload,
  User,
} from '../types/user';
import { authService } from '../services/auth.service';
import { useComplaintStore } from './complaintStore';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<User>;
  register: (payload: RegisterPayload) => Promise<AuthResponse>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => Promise<User>;
  checkAuth: () => Promise<User | null>;
  forgotPassword: (email: string) => Promise<{
    message: string;
    detail?: string;
    sent?: boolean;
    smtp_error?: string;
    reset_url?: string;
  }>;
  resetPassword: (payload: ResetPasswordPayload) => Promise<{ message: string }>;
  updateProfile: (payload: Partial<User>) => Promise<User>;
  clearError: () => void;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  switchRole: async (role: UserRole) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.switchRole(role);
      let user = response.user;
      if (!user) {
        user = await authService.getCurrentUser();
      }
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return user;
    } catch (err: any) {
      set({ isLoading: false });
      throw err;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.login(credentials);
      let user = response.user;
      if (!user) {
        user = await authService.getCurrentUser();
      }
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return user;
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Authentication failed. Please check your credentials.';
      if (typeof data === 'string') {
        msg = data;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.non_field_errors) {
        msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      } else if (data?.captcha_code) {
        msg = Array.isArray(data.captcha_code) ? data.captcha_code[0] : data.captcha_code;
      } else if (data?.email) {
        msg = Array.isArray(data.email) ? data.email[0] : data.email;
      } else if (data?.password) {
        msg = Array.isArray(data.password) ? data.password[0] : data.password;
      } else if (data?.message) {
        msg = data.message;
      } else if (data && typeof data === 'object') {
        const firstVal = Object.values(data)[0];
        msg = Array.isArray(firstVal) ? String(firstVal[0]) : String(firstVal);
      } else if (err.message) {
        msg = err.message;
      }
      set({ error: msg, isLoading: false, isAuthenticated: false });
      throw new Error(msg);
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await authService.register(payload);
      let user = response.user;
      if (!user && response.tokens?.access) {
        user = await authService.getCurrentUser();
      }
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false, error: null });
      } else {
        set({ isLoading: false, error: null });
      }
      return response;
    } catch (err: any) {
      const data = err.response?.data;
      let msg = 'Registration failed. Please check your inputs.';
      if (typeof data === 'string') {
        msg = data;
      } else if (data?.detail) {
        msg = data.detail;
      } else if (data?.email) {
        msg = Array.isArray(data.email) ? data.email[0] : data.email;
      } else if (data?.password) {
        msg = Array.isArray(data.password) ? data.password[0] : data.password;
      } else if (data?.non_field_errors) {
        msg = Array.isArray(data.non_field_errors) ? data.non_field_errors[0] : data.non_field_errors;
      } else if (data?.message) {
        msg = data.message;
      } else if (err.message) {
        msg = err.message;
      }
      set({ error: msg, isLoading: false });
      throw new Error(msg);
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
    } finally {
      useComplaintStore.getState().resetState();
      set({ user: null, isAuthenticated: false, isLoading: false, error: null });
    }
  },

  checkAuth: async () => {
    const token = localStorage.getItem('civicsetu_access_token');
    if (!token) {
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
    try {
      const user = await authService.getCurrentUser();
      set({ user, isAuthenticated: true, isLoading: false, error: null });
      return user;
    } catch {
      localStorage.removeItem('civicsetu_access_token');
      localStorage.removeItem('civicsetu_refresh_token');
      set({ user: null, isAuthenticated: false, isLoading: false });
      return null;
    }
  },

  forgotPassword: async (email) => {
    return await authService.forgotPassword({ email });
  },

  resetPassword: async (payload) => {
    return await authService.resetPassword(payload);
  },

  updateProfile: async (payload) => {
    const updated = await authService.updateProfile(payload);
    set((state) => ({
      user: state.user ? { ...state.user, ...updated } : (updated as User),
    }));
    return updated;
  },
}));

export default useAuthStore;
