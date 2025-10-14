import { create } from 'zustand';

type UIState = {
  hover: 'vcs' | 'founders' | null;
  setHover: (h: UIState['hover']) => void;
  ready: boolean;
  setReady: (r: boolean) => void;
};

export const useUI = create<UIState>((set) => ({
  hover: null,
  setHover: (hover) => set({ hover }),
  ready: false,
  setReady: (ready) => set({ ready }),
}));
