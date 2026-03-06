"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import * as THREE from "three";

function DigitalTerrain() {
  const meshRef = useRef<THREE.Mesh>(null);
  const timeRef = useRef(0);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    timeRef.current += delta * 0.3; // Slow animation speed

    const geometry = meshRef.current.geometry;
    const positionAttribute = geometry.attributes.position;

    // Create slow wave effect using sine wave
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);

      // Create wave pattern
      const wave1 = Math.sin(x * 0.1 + timeRef.current) * 2;
      const wave2 = Math.sin(y * 0.15 + timeRef.current * 0.8) * 1.5;

      positionAttribute.setZ(i, wave1 + wave2);
    }

    positionAttribute.needsUpdate = true;
    geometry.computeVertexNormals();
  });

  return (
    <mesh ref={meshRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -15, 0]}>
      <planeGeometry args={[100, 100, 50, 50]} />
      <meshBasicMaterial
        color="#00ffff"
        wireframe={true}
        transparent={true}
        opacity={0.3}
      />
    </mesh>
  );
}

export function CaseStudiesBackground() {
  return (
    <div className="fixed inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 5, 20], fov: 75 }}
        gl={{ antialias: true, alpha: true }}>
        <fog attach="fog" args={["#000000", 10, 50]} />
        <DigitalTerrain />
      </Canvas>
    </div>
  );
}
