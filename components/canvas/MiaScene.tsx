"use client";

import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

const PARTICLE_COUNT = 2400;

function ParticleField() {
  const meshRef = useRef<THREE.Points>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const sizes = new Float32Array(PARTICLE_COUNT);

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 3 + Math.random() * 9;

      positions[i3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i3 + 2] = r * Math.cos(phi) - 2;

      // Violet → fuchsia gradient
      const t = Math.random();
      colors[i3] = 0.35 + t * 0.35;     // R
      colors[i3 + 1] = 0.08 + t * 0.12; // G
      colors[i3 + 2] = 0.7 + t * 0.3;   // B

      sizes[i] = Math.random() * 0.035 + 0.005;
    }

    return { positions, colors, sizes };
  }, []);

  // Subtle mouse tracking
  useMemo(() => {
    if (typeof window === "undefined") return;
    const onMove = (e: MouseEvent) => {
      mouseRef.current.x = (e.clientX / window.innerWidth - 0.5) * 0.4;
      mouseRef.current.y = -(e.clientY / window.innerHeight - 0.5) * 0.4;
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();

    meshRef.current.rotation.y =
      t * 0.018 + mouseRef.current.x * 0.5;
    meshRef.current.rotation.x =
      Math.sin(t * 0.008) * 0.12 + mouseRef.current.y * 0.3;
    meshRef.current.rotation.z = t * 0.006;
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-size"
          count={PARTICLE_COUNT}
          array={sizes}
          itemSize={1}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        vertexColors
        transparent
        opacity={0.55}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function OrbitRing({
  radius,
  speed,
  color,
  opacity,
}: {
  radius: number;
  speed: number;
  color: string;
  opacity: number;
}) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.getElapsedTime();
    ref.current.rotation.x = t * speed * 0.7;
    ref.current.rotation.y = t * speed;
    ref.current.rotation.z = t * speed * 0.4;
  });

  return (
    <mesh ref={ref}>
      <torusGeometry args={[radius, 0.008, 8, 120]} />
      <meshBasicMaterial color={color} transparent opacity={opacity} />
    </mesh>
  );
}

export function MiaScene() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <ParticleField />
      <OrbitRing radius={2.8} speed={0.12} color="#7c3aed" opacity={0.18} />
      <OrbitRing radius={4.2} speed={0.07} color="#a855f7" opacity={0.12} />
      <OrbitRing radius={5.8} speed={0.04} color="#6d28d9" opacity={0.08} />
    </>
  );
}
