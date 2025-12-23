
import React, { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Mesh, Vector3 } from 'three';
import { Bullet } from './GameScene';

interface BulletSystemProps {
    bulletsRef: React.MutableRefObject<Bullet[]>;
}

export const BulletSystem: React.FC<BulletSystemProps> = ({ bulletsRef }) => {
    // We map 1-to-1 meshes to the bullet pool
    const meshesRef = useRef<(Mesh | null)[]>([]);

    useFrame((state, delta) => {
        const bullets = bulletsRef.current;
        const speed = 120; // Fast laser speed

        bullets.forEach((bullet, i) => {
            if (bullet.active) {
                // Move bullet
                bullet.position.z -= speed * delta;

                // Deactivate if too far
                if (bullet.position.z < -250) {
                    bullet.active = false;
                }
            }

            // Update Mesh
            const mesh = meshesRef.current[i];
            if (mesh) {
                mesh.visible = bullet.active;
                if (bullet.active) {
                    mesh.position.copy(bullet.position);
                }
            }
        });
    });

    // Create the visual pool
    const bulletMeshes = useMemo(() => {
        return bulletsRef.current.map((bullet, i) => (
            <mesh 
                key={bullet.id} 
                ref={(el) => (meshesRef.current[i] = el)}
                rotation={[Math.PI / 2, 0, 0]}
                visible={false}
            >
                <cylinderGeometry args={[0.1, 0.1, 3, 8]} />
                <meshBasicMaterial color="#a3e635" toneMapped={false} />
            </mesh>
        ));
    }, [bulletsRef]);

    return <group>{bulletMeshes}</group>;
};
