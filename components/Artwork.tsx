import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useMuseumStore } from "../lib/store";
import type { Artwork as ArtworkType } from "../lib/artworks";
import * as THREE from "three";
import { Vector3, type Mesh, type PointLight } from "three";
import { useTexture } from "@react-three/drei";

// Shared temp — avoids allocating a new Vector3 every frame per artwork
const _scale = new Vector3();

interface ArtworkProps {
  artwork: ArtworkType;
  position: [number, number, number];
  index: number;
}

export default function Artwork({ artwork, position, index }: ArtworkProps) {
  const meshRef = useRef<Mesh>(null);
  const lightRef = useRef<PointLight>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const [hovered, setHovered] = useState(false);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const openArtworkDetail = useMuseumStore((state) => state.openArtworkDetail);
  const texture = useTexture(artwork.imageUrl);

  const isActive = activeArtworkId === artwork.id;

  // Scale artwork based on real dimensions (normalized)
  const aspectRatio = artwork.dimensions.height / artwork.dimensions.width;
  const height = 2;
  const width = height * aspectRatio;

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const lerpK = 1 - Math.pow(0.9, dt * 60); // ≈0.1 at 60fps, frame-rate independent

    if (meshRef.current) {
      const targetScale = isActive ? 1.1 : hovered ? 1.05 : 1;
      _scale.set(targetScale, targetScale, targetScale);
      meshRef.current.scale.lerp(_scale, lerpK);
    }

    // Animate light intensity instead of mounting/unmounting the light.
    // Mount/unmount forces a full shadow-map recalculation every switch — that's the lag spike.
    if (lightRef.current) {
      const targetIntensity = isActive ? 1.2 : 0;
      lightRef.current.intensity += (targetIntensity - lightRef.current.intensity) * lerpK;
    }

    // Animate material properties in useFrame to avoid React re-renders on every artwork switch
    if (matRef.current) {
      const targetEmissiveIntensity = isActive ? 0.35 : 0.08;
      matRef.current.emissiveIntensity += (targetEmissiveIntensity - matRef.current.emissiveIntensity) * lerpK;
    }
  });

  return (
    <mesh
      ref={meshRef}
      position={position}
      castShadow
      receiveShadow
      onClick={() => openArtworkDetail(artwork.id)}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <boxGeometry args={[width, height, 0.15]} />
      <meshStandardMaterial
        ref={matRef}
        color="#fff"
        metalness={0.1}
        roughness={0.8}
        emissive="#fff8e8"
        emissiveIntensity={0.08}
      />
      <mesh position={[0, 0, 0.08]} castShadow>
        <planeGeometry args={[width * 0.9, height * 0.9]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
      {/* Always present — intensity animates to 0 when inactive to avoid shadow-map recalculation */}
      <pointLight ref={lightRef} position={[0, 0, 0.6]} intensity={0} distance={4} decay={2} color="#fff4d0" />
    </mesh>
  );
}