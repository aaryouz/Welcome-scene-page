import { create } from 'zustand';

type DoorType = 'vcs' | 'founders';
type ZebraState = 'idle' | 'walking' | 'arriving';

type UIState = {
  hover: DoorType | null;
  setHover: (h: UIState['hover']) => void;
  ready: boolean;
  setReady: (r: boolean) => void;

  // Zebra navigation state
  zebraState: ZebraState;
  setZebraState: (state: ZebraState) => void;
  targetDoor: DoorType | null;
  setTargetDoor: (door: DoorType | null) => void;
  zebraPosition: { x: number; y: number };
  setZebraPosition: (pos: { x: number; y: number }) => void;
};

export const useUI = create<UIState>((set) => ({
  hover: null,
  setHover: (hover) => set({ hover }),
  ready: false,
  setReady: (ready) => set({ ready }),

  // Zebra navigation defaults
  zebraState: 'idle',
  setZebraState: (zebraState) => set({ zebraState }),
  targetDoor: null,
  setTargetDoor: (targetDoor) => set({ targetDoor }),
  zebraPosition: { x: 0, y: 0 },
  setZebraPosition: (zebraPosition) => set({ zebraPosition }),
}));
