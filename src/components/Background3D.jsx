import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, Float, Sphere, Torus, Icosahedron } from '@react-three/drei';
import * as THREE from 'three';

const INITIAL_PARTICLES = Array.from({ length: 15 }).map(() => ({
    position: [
        (Math.random() - 0.5) * 15,
        (Math.random() - 0.5) * 15,
        -5 - Math.random() * 5
    ],
    size: Math.random() * 0.3 + 0.1
}));

function FloatingShapes() {
    const group = useRef();

    // Slowly rotate the entire group of shapes
    useFrame((state) => {
        if (group.current) {
            group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.1) * 0.2;
            group.current.rotation.x = Math.cos(state.clock.elapsedTime * 0.1) * 0.1;
        }
    });

    const materialProps = useMemo(() => ({
        thickness: 2,
        roughness: 0.1,
        transmission: 1, // glass-like look
        ior: 1.5,
        chromaticAberration: 0.1,
        backside: true,
        transparent: true,
        opacity: 0.8,
    }), []);

    return (
        <group ref={group}>
            <Float speed={1.5} rotationIntensity={1.5} floatIntensity={2} position={[-2.5, 1, -3]}>
                <Sphere args={[1.2, 64, 64]}>
                    <meshPhysicalMaterial {...materialProps} color="#a8c88c" />
                </Sphere>
            </Float>

            <Float speed={2} rotationIntensity={2} floatIntensity={1.5} position={[2.5, -1.5, -2]}>
                <Torus args={[0.8, 0.3, 32, 64]} rotation={[Math.PI / 4, 0, 0]}>
                    <meshPhysicalMaterial {...materialProps} color="#d2b48c" ior={1.3} />
                </Torus>
            </Float>

            <Float speed={1} rotationIntensity={1} floatIntensity={3} position={[0, -2.5, -4]}>
                <Icosahedron args={[1.5, 0]}>
                    <meshPhysicalMaterial {...materialProps} color="#c2a078" wireframe={false} flatShading />
                </Icosahedron>
            </Float>

            {/* Very faint background particles */}
            {INITIAL_PARTICLES.map((p, i) => (
                <Float key={i} speed={1} rotationIntensity={1} floatIntensity={2} position={p.position}>
                    <Sphere args={[p.size, 16, 16]}>
                        <meshStandardMaterial color="#ffffff" transparent opacity={0.2} roughness={0.1} />
                    </Sphere>
                </Float>
            ))}
        </group>
    );
}

export default function Background3D() {
    return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
            <Canvas camera={{ position: [0, 0, 6], fov: 45 }} dpr={[1, 2]}>
                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#fff1e6" />
                <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#e6f5ea" />
                <Environment preset="city" />
                <FloatingShapes />
            </Canvas>
        </div>
    );
}
