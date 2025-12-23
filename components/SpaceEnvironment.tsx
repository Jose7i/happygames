import React, { useRef } from 'react';
import { Stars } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useGameStore } from '../store';
import * as THREE from 'three';

export const SpaceEnvironment: React.FC = () => {
    const gridRef = useRef<THREE.GridHelper>(null);
    const speed = useGameStore((state) => state.speed);
    const status = useGameStore((state) => state.status);

    useFrame((state, delta) => {
        if (gridRef.current && status === 'playing') {
            // Move grid to simulate speed
            gridRef.current.position.z += speed * delta;
            // Reset position more frequently relative to size, or just loop
            // Since grid is uniform, we just need to loop it by one cell unit or similar
            if (gridRef.current.position.z > 20) {
                gridRef.current.position.z = 0;
            }
        }
    });

    return (
        <group>
            <color attach="background" args={['#050505']} />
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
            
            {/* Moving Floor Grid for Speed Reference - Increased size to 400 */}
            <gridHelper 
                ref={gridRef}
                args={[400, 100, 0x111111, 0x222222]} 
                position={[0, -5, 0]} 
                rotation={[0, 0, 0]}
            />
            
            {/* Distant Grid (Ceiling) - Increased size to 400 */}
            <gridHelper 
                args={[400, 100, 0x111111, 0x111111]} 
                position={[0, 15, 0]} 
            />
        </group>
    );
};