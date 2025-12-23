
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Group, MathUtils, Vector3 } from 'three';
import { useGameStore } from '../store';
import { audioManager } from '../utils/audio';
import { Bullet } from './GameScene';

type ObstacleType = 'dodecahedron' | 'box' | 'tetrahedron' | 'octahedron';
type PowerUpType = 'shield' | 'score' | 'slow';

interface AsteroidFieldProps {
  count: number;
  shipRef: React.RefObject<Group>;
  bulletsRef: React.MutableRefObject<Bullet[]>;
  isPlaying: boolean;
}

interface PowerUpFieldProps {
  count: number;
  shipRef: React.RefObject<Group>;
  isPlaying: boolean;
}

// Reusable dummy object for math
const tempVec = new Vector3();

const AsteroidItem: React.FC<{ 
  initialPos: [number, number, number]; 
  type: ObstacleType;
  shipRef: React.RefObject<Group>; 
  bulletsRef: React.MutableRefObject<Bullet[]>;
  isPlaying: boolean 
}> = ({ initialPos, type, shipRef, bulletsRef, isPlaying }) => {
  const meshRef = useRef<Group>(null);
  const speedRef = useRef(Math.random() * 0.2 + 0.1);
  const rotationSpeedRef = useRef({
    x: Math.random() * 0.05,
    y: Math.random() * 0.05
  });
  
  const scale = useMemo(() => Math.random() * 0.5 + 0.5, []);
  
  const endGame = useGameStore((state) => state.endGame);
  const globalSpeed = useGameStore((state) => state.speed);
  const increaseScore = useGameStore((state) => state.increaseScore);
  const shieldActive = useGameStore((state) => state.shieldActive);
  const deactivateShield = useGameStore((state) => state.deactivateShield);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    if (isPlaying) {
      meshRef.current.position.z += globalSpeed * delta + speedRef.current;
      meshRef.current.rotation.x += rotationSpeedRef.current.x;
      meshRef.current.rotation.y += rotationSpeedRef.current.y;

      // Respawn Logic
      const respawn = () => {
        if (!meshRef.current) return;
        meshRef.current.position.z = -200 - Math.random() * 100;
        meshRef.current.position.x = (Math.random() - 0.5) * 30;
        meshRef.current.position.y = (Math.random() - 0.5) * 16;
      };

      if (meshRef.current.position.z > 20) {
        respawn();
        increaseScore(1);
      }

      // 1. Check Collision with Ship
      if (shipRef.current) {
        const shipPos = shipRef.current.position;
        const asteroidPos = meshRef.current.position;
        
        if (Math.abs(asteroidPos.z - shipPos.z) < 2) {
            const distance = tempVec.copy(asteroidPos).distanceTo(shipPos);
            if (distance < 1.2) {
                if (shieldActive) {
                    audioManager.playShieldBreak();
                    deactivateShield();
                    respawn();
                } else {
                    audioManager.playExplosion();
                    endGame();
                }
            }
        }
      }

      // 2. Check Collision with Bullets
      // Optimize: Only check if asteroid is within readable Z range (-250 to 0)
      if (meshRef.current.position.z > -250 && meshRef.current.position.z < 0) {
          const bullets = bulletsRef.current;
          for (let i = 0; i < bullets.length; i++) {
              const b = bullets[i];
              if (b.active) {
                  // Quick Z check first
                  if (Math.abs(b.position.z - meshRef.current.position.z) < 2) {
                       const dist = b.position.distanceTo(meshRef.current.position);
                       // Asteroid radius approx 1.0 * scale
                       if (dist < 1.0 * scale + 0.2) {
                           // Hit!
                           b.active = false; // Destroy bullet
                           audioManager.playExplosion();
                           increaseScore(10); // Bonus score for shooting
                           respawn();
                           break; // Only one bullet per asteroid frame
                       }
                  }
              }
          }
      }

    }
  });

  const materialProps = {
    color: "#333",
    emissive: "#b91c1c",
    emissiveIntensity: 0.5,
    wireframe: true
  };

  const coreMaterialProps = {
    color: "black"
  };

  return (
    <group ref={meshRef} position={initialPos} scale={[scale, scale, scale]}>
      {type === 'dodecahedron' && (
        <>
          <mesh><dodecahedronGeometry args={[1, 0]} /><meshStandardMaterial {...materialProps} /></mesh>
          <mesh><dodecahedronGeometry args={[0.95, 0]} /><meshStandardMaterial {...coreMaterialProps} /></mesh>
        </>
      )}
      {type === 'box' && (
        <>
          <mesh><boxGeometry args={[1.5, 1.5, 1.5]} /><meshStandardMaterial {...materialProps} /></mesh>
          <mesh><boxGeometry args={[1.4, 1.4, 1.4]} /><meshStandardMaterial {...coreMaterialProps} /></mesh>
        </>
      )}
      {type === 'tetrahedron' && (
        <>
          <mesh><tetrahedronGeometry args={[1.2, 0]} /><meshStandardMaterial {...materialProps} /></mesh>
          <mesh><tetrahedronGeometry args={[1.1, 0]} /><meshStandardMaterial {...coreMaterialProps} /></mesh>
        </>
      )}
      {type === 'octahedron' && (
        <>
          <mesh><octahedronGeometry args={[1.2, 0]} /><meshStandardMaterial {...materialProps} /></mesh>
          <mesh><octahedronGeometry args={[1.1, 0]} /><meshStandardMaterial {...coreMaterialProps} /></mesh>
        </>
      )}
    </group>
  );
};

const PowerUpItem: React.FC<{
    initialPos: [number, number, number];
    type: PowerUpType;
    shipRef: React.RefObject<Group>;
    isPlaying: boolean;
}> = ({ initialPos, type, shipRef, isPlaying }) => {
    const meshRef = useRef<Group>(null);
    const globalSpeed = useGameStore((state) => state.speed);
    const increaseScore = useGameStore((state) => state.increaseScore);
    const activateShield = useGameStore((state) => state.activateShield);
    const increaseSpeed = useGameStore((state) => state.increaseSpeed);

    useFrame((state, delta) => {
        if (!meshRef.current) return;

        if (isPlaying) {
            meshRef.current.position.z += globalSpeed * delta; 
            
            meshRef.current.rotation.y += delta * 2;
            meshRef.current.rotation.z += delta;

            if (meshRef.current.position.z > 20) {
                meshRef.current.position.z = -300 - Math.random() * 200; 
                meshRef.current.position.x = (Math.random() - 0.5) * 20;
                meshRef.current.position.y = (Math.random() - 0.5) * 10;
            }

            if (shipRef.current) {
                const shipPos = shipRef.current.position;
                const itemPos = meshRef.current.position;

                if (Math.abs(itemPos.z - shipPos.z) < 2) {
                    const distance = tempVec.copy(itemPos).distanceTo(shipPos);
                    if (distance < 1.5) {
                        audioManager.playPowerup(type);

                        if (type === 'shield') {
                            activateShield();
                        } else if (type === 'score') {
                            increaseScore(500);
                        } else if (type === 'slow') {
                            increaseSpeed(-2);
                        }

                        meshRef.current.position.z = -400 - Math.random() * 300;
                        meshRef.current.position.x = (Math.random() - 0.5) * 20;
                        meshRef.current.position.y = (Math.random() - 0.5) * 10;
                    }
                }
            }
        }
    });

    return (
        <group ref={meshRef} position={initialPos}>
            {type === 'shield' && (
                <mesh>
                    <icosahedronGeometry args={[0.8, 0]} />
                    <meshStandardMaterial color="#00ffff" emissive="#00ffff" emissiveIntensity={2} wireframe />
                </mesh>
            )}
            {type === 'score' && (
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                    <torusGeometry args={[0.6, 0.2, 8, 20]} />
                    <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={2} />
                </mesh>
            )}
            {type === 'slow' && (
                <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={2} wireframe />
                </mesh>
            )}
        </group>
    );
}

export const PowerUpField: React.FC<PowerUpFieldProps> = ({ count, shipRef, isPlaying }) => {
    const powerUps = useMemo(() => {
        const types: PowerUpType[] = ['shield', 'score', 'slow'];
        return new Array(count).fill(0).map(() => ({
            position: [
                (Math.random() - 0.5) * 25,
                (Math.random() - 0.5) * 15,
                -100 - Math.random() * 400 
            ] as [number, number, number],
            type: types[Math.floor(Math.random() * types.length)]
        }));
    }, [count]);

    return (
        <group>
            {powerUps.map((data, i) => (
                <PowerUpItem 
                    key={`pu-${i}`}
                    initialPos={data.position}
                    type={data.type}
                    shipRef={shipRef}
                    isPlaying={isPlaying}
                />
            ))}
        </group>
    );
};

export const AsteroidField: React.FC<AsteroidFieldProps> = ({ count, shipRef, bulletsRef, isPlaying }) => {
  const asteroids = useMemo(() => {
    const types: ObstacleType[] = ['dodecahedron', 'box', 'tetrahedron', 'octahedron'];
    return new Array(count).fill(0).map(() => ({
      position: [
        (Math.random() - 0.5) * 30,
        (Math.random() - 0.5) * 20,
        -20 - Math.random() * 250   
      ] as [number, number, number],
      type: types[Math.floor(Math.random() * types.length)]
    }));
  }, [count]);

  return (
    <group>
      {asteroids.map((data, i) => (
        <AsteroidItem 
            key={i} 
            initialPos={data.position} 
            type={data.type}
            shipRef={shipRef} 
            bulletsRef={bulletsRef}
            isPlaying={isPlaying} 
        />
      ))}
    </group>
  );
};