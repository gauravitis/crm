import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  user: any | null;
  isLoading: boolean;
  error: string | null;
  setUser: (user: any) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useStore = create&lt;AppState&gt;()(
  devtools(
    persist(
      (set) => ({
        user: null,
        isLoading: false,
        error: null,
        setUser: (user) => set({ user }),
        setLoading: (loading) => set({ isLoading: loading }),
        setError: (error) => set({ error }),
      }),
      {
        name: 'app-storage',
      }
    )
  )
);
