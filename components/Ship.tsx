
import React, { useRef, forwardRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Group, MathUtils } from 'three';
import { Trail } from '@react-three/drei';
import { useGameStore } from '../store';
import { audioManager } from '../utils/audio';

interface ShipProps {
  isPlaying: boolean;
  onFire: (x: number, y: number, z: number) => void;
}

export const Ship = forwardRef<Group, ShipProps>(({ isPlaying, onFire }, ref) => {
  const localRef = useRef<Group>(null);
  const shipGroup = (ref as React.MutableRefObject<Group>) || localRef;
  const targetPosition = useRef({ x: 0, y: 0 });
  const shieldActive = useGameStore((state) => state.shieldActive);
  const lastFireTime = useRef(0);

  // Handle firing input
  useEffect(() => {
    const handlePointerDown = () => {
        if (!isPlaying) return;
        
        const now = Date.now();
        if (now - lastFireTime.current > 150) { // 150ms cooldown
            if (shipGroup.current) {
                const { x, y, z } = shipGroup.current.position;
                onFire(x, y, z);
                audioManager.playLaser();
                lastFireTime.current = now;
            }
        }
    };

    window.addEventListener('pointerdown', handlePointerDown);
    return () => window.removeEventListener('pointerdown', handlePointerDown);
  }, [isPlaying, onFire, shipGroup]);

  useFrame((state) => {
    if (!isPlaying) {
        if (shipGroup.current) {
            shipGroup.current.rotation.z = Math.sin(state.clock.elapsedTime) * 0.1;
            shipGroup.current.position.y = Math.sin(state.clock.elapsedTime * 2) * 0.2;
        }
        return;
    }

    const { x, y } = state.mouse;
    const limitX = 8;
    const limitY = 4;

    targetPosition.current.x = x * limitX;
    targetPosition.current.y = y * limitY;

    if (shipGroup.current) {
      shipGroup.current.position.x = MathUtils.lerp(shipGroup.current.position.x, targetPosition.current.x, 0.1);
      shipGroup.current.position.y = MathUtils.lerp(shipGroup.current.position.y, targetPosition.current.y, 0.1);

      const tilt = (targetPosition.current.x - shipGroup.current.position.x) * 1.5;
      shipGroup.current.rotation.z = MathUtils.lerp(shipGroup.current.rotation.z, -tilt, 0.1);
      shipGroup.current.rotation.x = MathUtils.lerp(shipGroup.current.rotation.x, (targetPosition.current.y - shipGroup.current.position.y) * 0.5, 0.1);
    }
  });

  return (
    <group ref={shipGroup}>
      {/* Shield Bubble */}
      {shieldActive && (
        <mesh>
            <sphereGeometry args={[1.5, 32, 32]} />
            <meshStandardMaterial 
                color="#00ffff" 
                transparent 
                opacity={0.3} 
                emissive="#00ffff"
                emissiveIntensity={0.5}
                wireframe
            />
        </mesh>
      )}

      {/* Main Body */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <coneGeometry args={[0.6, 2.5, 5]} />
        <meshStandardMaterial color="#22d3ee" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Engine Glow */}
      <mesh position={[0, 0, 1.3]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.3, 0.1, 0.5, 8]} />
        <meshBasicMaterial color="#00ffff" />
      </mesh>

      {/* Wings with Trails */}
      <group position={[0, 0, 0.5]}>
        <Trail 
            width={0.4} 
            length={8} 
            color="#0ea5e9" 
            attenuation={(t) => t * t}
        >
            <mesh position={[0.8, -0.2, 0]} rotation={[0, 0, -0.5]}>
                <boxGeometry args={[1, 0.1, 1.5]} />
                <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
            </mesh>
        </Trail>
        
        <Trail 
            width={0.4} 
            length={8} 
            color="#0ea5e9" 
            attenuation={(t) => t * t}
        >
            <mesh position={[-0.8, -0.2, 0]} rotation={[0, 0, 0.5]}>
                <boxGeometry args={[1, 0.1, 1.5]} />
                <meshStandardMaterial color="#0ea5e9" roughness={0.4} />
            </mesh>
        </Trail>
      </group>
    </group>
  );
});

Ship.displayName = 'Ship';