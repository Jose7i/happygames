
import React, { Suspense } from 'react';
import { GameScene } from './components/GameScene';
import { HUD } from './components/HUD';
import { useGameStore } from './store';
import { audioManager } from './utils/audio';

const App: React.FC = () => {
  const status = useGameStore((state) => state.status);
  const startGame = useGameStore((state) => state.startGame);
  const resetGame = useGameStore((state) => state.resetGame);
  const score = useGameStore((state) => state.score);

  const handleStart = () => {
    audioManager.init();
    audioManager.playClick();
    startGame();
  };

  const handleReset = () => {
    audioManager.playClick();
    resetGame();
  };

  const handleRetry = () => {
    audioManager.playClick();
    startGame();
  };

  const handleHover = () => {
    audioManager.playHover();
  };

  return (
    <div className="relative w-full h-full bg-black text-white font-mono">
      {/* 3D Scene Layer */}
      <div className="absolute inset-0 z-0">
        <Suspense fallback={<div className="flex items-center justify-center h-full">Loading Assets...</div>}>
          <GameScene />
        </Suspense>
      </div>

      {/* UI Overlay Layer */}
      <div className="absolute inset-0 z-10 pointer-events-none">
        
        {/* HUD (Always visible when playing) */}
        {status === 'playing' && <HUD />}

        {/* Start Menu */}
        {status === 'menu' && (
          <div className="flex flex-col items-center justify-center h-full bg-black/60 backdrop-blur-sm pointer-events-auto">
            <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 mb-8 animate-pulse text-center">
              NEON VOID<br/>RUNNER
            </h1>
            <p className="mb-8 text-cyan-200 text-lg">Use Mouse to Steer. Dodge the Obsidian Shards.</p>
            <button
              onClick={handleStart}
              onMouseEnter={handleHover}
              className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded shadow-[0_0_20px_rgba(8,145,178,0.6)] transition-all transform hover:scale-105"
            >
              INITIALIZE LAUNCH
            </button>
          </div>
        )}

        {/* Game Over Screen */}
        {status === 'gameover' && (
          <div className="flex flex-col items-center justify-center h-full bg-red-900/40 backdrop-blur-md pointer-events-auto">
            <h2 className="text-5xl font-bold text-red-500 mb-4 tracking-widest">CRITICAL FAILURE</h2>
            <div className="text-2xl mb-8">Final Score: <span className="text-white font-bold">{Math.floor(score)}</span></div>
            <button
              onClick={handleRetry}
              onMouseEnter={handleHover}
              className="px-8 py-3 bg-white text-red-900 font-bold rounded hover:bg-gray-200 transition-colors mb-4"
            >
              RETRY MISSION
            </button>
            <button
              onClick={handleReset}
              onMouseEnter={handleHover}
              className="text-sm text-gray-400 hover:text-white underline"
            >
              Back to Menu
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
