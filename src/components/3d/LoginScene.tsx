"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Points, PointMaterial } from "@react-three/drei";
import * as THREE from "three";

// Simpler Constellation Effect
function Constellation() {
  const ref = useRef<THREE.Group>(null!);

  useFrame((state) => {
    if (ref.current) {
      // Gentle rotation
      ref.current.rotation.y = state.clock.getElapsedTime() * 0.05;

      // Mouse parallax (subtle)
      const x = state.pointer.x * 0.2;
      const y = state.pointer.y * 0.2;
      ref.current.rotation.x = THREE.MathUtils.lerp(
        ref.current.rotation.x,
        y,
        0.1
      );
      ref.current.rotation.z = THREE.MathUtils.lerp(
        ref.current.rotation.z,
        x,
        0.1
      );
    }
  });

  return (
    <group ref={ref}>
      <Points limit={5000} range={10}>
        <PointMaterial
          transparent
          color="#888888"
          size={0.015}
          sizeAttenuation={true}
          depthWrite={false}
        />
      </Points>
    </group>
  );
}

export default function LoginScene() {
  return (
    <div className="w-full h-full absolute inset-0 bg-black">
      <Canvas camera={{ position: [0, 0, 3] }}>
        <color attach="background" args={["#050505"]} />
        <fog attach="fog" args={["#050505", 1, 10]} />
        <Constellation />
      </Canvas>
    </div>
  );
}
