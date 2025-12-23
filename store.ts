import { create } from 'zustand';

interface GameState {
  score: number;
  status: 'menu' | 'playing' | 'gameover';
  speed: number;
  gameId: number;
  shieldActive: boolean;
  startGame: () => void;
  endGame: () => void;
  resetGame: () => void;
  increaseScore: (amount: number) => void;
  increaseSpeed: (amount: number) => void;
  activateShield: () => void;
  deactivateShield: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  score: 0,
  status: 'menu',
  speed: 10,
  gameId: 0,
  shieldActive: false,
  startGame: () => set((state) => ({ status: 'playing', score: 0, speed: 10, shieldActive: false, gameId: state.gameId + 1 })),
  endGame: () => set({ status: 'gameover' }),
  resetGame: () => set((state) => ({ status: 'menu', score: 0, speed: 10, shieldActive: false, gameId: state.gameId + 1 })),
  increaseScore: (amount) => set((state) => ({ score: state.score + amount })),
  increaseSpeed: (amount) => set((state) => ({ speed: Math.max(5, state.speed + amount) })), // Ensure speed doesn't go below 5
  activateShield: () => set({ shieldActive: true }),
  deactivateShield: () => set({ shieldActive: false }),
}));