import React, { useEffect } from 'react';
import { useGameStore } from '../store';

export const HUD: React.FC = () => {
  const score = useGameStore((state) => state.score);
  const speed = useGameStore((state) => state.speed);
  const shieldActive = useGameStore((state) => state.shieldActive);
  const increaseSpeed = useGameStore((state) => state.increaseSpeed);

  // Difficulty ramping
  useEffect(() => {
    const interval = setInterval(() => {
        increaseSpeed(0.5);
    }, 5000);
    return () => clearInterval(interval);
  }, [increaseSpeed]);

  return (
    <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none">
      <div className="flex flex-col gap-2">
        <div className="text-4xl font-black text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
          {Math.floor(score).toString().padStart(6, '0')}
        </div>
        <div className="text-xs text-cyan-700 font-bold tracking-widest uppercase">
          Score
        </div>
        
        {/* Shield Indicator */}
        {shieldActive && (
            <div className="mt-4 px-4 py-2 bg-cyan-900/50 border border-cyan-500 text-cyan-400 font-bold rounded animate-pulse">
                SHIELD ACTIVE
            </div>
        )}
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <div className="text-2xl font-bold text-purple-400">
          SPEED: {Math.floor(speed * 10)} km/s
        </div>
        <div className="w-48 h-2 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
          <div 
            className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 transition-all duration-300"
            style={{ width: `${Math.min((speed / 50) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
};