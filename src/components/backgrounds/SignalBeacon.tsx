"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import * as THREE from "three";

function Beacon() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.005;
      meshRef.current.rotation.z += 0.002;
    }
  });

  return (
    <Sphere args={[1.5, 64, 64]} ref={meshRef}>
      <MeshDistortMaterial
        color="#ffffff"
        emissive="#4f46e5" // Indigo-600
        emissiveIntensity={0.5}
        roughness={0.2}
        metalness={0.8}
        distort={0.4}
        speed={2}
      />
    </Sphere>
  );
}

export function SignalBeacon() {
  return (
    <div className="absolute inset-0 bg-neutral-950">
      <Canvas camera={{ position: [0, 0, 5] }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Beacon />
      </Canvas>
    </div>
  );
}
