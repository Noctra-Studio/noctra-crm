"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Grid } from "@react-three/drei";

function MovingGrid() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const gridRef = useRef<any>(null);

  useFrame((state) => {
    if (gridRef.current) {
      // Move the grid slowly to create a sense of forward motion
      gridRef.current.position.z = (state.clock.getElapsedTime() * 0.5) % 1;
    }
  });

  return (
    <group rotation={[Math.PI / 2.5, 0, 0]} position={[0, -2, -5]}>
      <Grid
        ref={gridRef}
        args={[20, 20]}
        cellSize={0.5}
        cellThickness={1}
        cellColor="#333333"
        sectionSize={2}
        sectionThickness={1.5}
        sectionColor="#444444"
        fadeDistance={15}
        fadeStrength={1}
        infiniteGrid
      />
    </group>
  );
}

export function GridStructure() {
  return (
    <div className="absolute inset-0 bg-neutral-950">
      <Canvas camera={{ position: [0, 2, 5], fov: 60 }}>
        <fog attach="fog" args={["#0a0a0a", 5, 20]} />
        <MovingGrid />
      </Canvas>
    </div>
  );
}
