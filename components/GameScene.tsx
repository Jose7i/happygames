
import React, { useRef, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Stars } from '@react-three/drei';
import { Group, Vector3 } from 'three';
import { Ship } from './Ship';
import { AsteroidField, PowerUpField } from './AsteroidField';
import { BulletSystem } from './BulletSystem';
import { SpaceEnvironment } from './SpaceEnvironment';
import { useGameStore } from '../store';

export interface Bullet {
  position: Vector3;
  active: boolean;
  id: number;
}

export const GameScene: React.FC = () => {
  const shipRef = useRef<Group>(null);
  const status = useGameStore((state) => state.status);
  const gameId = useGameStore((state) => state.gameId);
  
  // Bullet Pool Initialization
  const bulletPoolSize = 30;
  const bulletsRef = useRef<Bullet[]>([]);

  // Initialize pool once
  if (bulletsRef.current.length === 0) {
      for (let i = 0; i < bulletPoolSize; i++) {
          bulletsRef.current.push({
              position: new Vector3(0, 0, 0),
              active: false,
              id: i
          });
      }
  }

  const fireBullet = (x: number, y: number, z: number) => {
      // Find first inactive bullet
      const bullet = bulletsRef.current.find(b => !b.active);
      if (bullet) {
          bullet.active = true;
          bullet.position.set(x, y, z - 1.5); // Spawn slightly ahead of ship
      }
  };

  return (
    <Canvas
      dpr={[1, 2]}
      gl={{ antialias: true, toneMappingExposure: 1.5 }}
      camera={{ position: [0, 2, 10], fov: 45 }}
    >
      <ambientLight intensity={0.2} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#06b6d4" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#ec4899" />
      
      <SpaceEnvironment />
      
      <Ship 
        key={`ship-${gameId}`} 
        ref={shipRef} 
        isPlaying={status === 'playing'} 
        onFire={fireBullet}
      />
      
      <BulletSystem bulletsRef={bulletsRef} />

      <AsteroidField 
        key={`asteroids-${gameId}`} 
        shipRef={shipRef} 
        bulletsRef={bulletsRef}
        count={100} 
        isPlaying={status === 'playing'} 
      />
      
      <PowerUpField key={`powerups-${gameId}`} shipRef={shipRef} count={10} isPlaying={status === 'playing'} />
      
      <fog attach="fog" args={['#000000', 30, 220]} />
    </Canvas>
  );
};