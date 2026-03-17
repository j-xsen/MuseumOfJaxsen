import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { useMuseumStore } from "../lib/store";
import type { Artwork as ArtworkType } from "../lib/artworks";
import { Vector3, type Mesh } from "three";
import { useTexture } from "@react-three/drei";

interface ArtworkProps {
  artwork: ArtworkType;
  position: [number, number, number];
  index: number;
}

export default function Artwork({ artwork, position, index }: ArtworkProps) {
  const meshRef = useRef<Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const openArtworkDetail = useMuseumStore((state) => state.openArtworkDetail);
  const texture = useTexture(artwork.imageUrl);

  const isActive = activeArtworkId === artwork.id;

  // Scale artwork based on real dimensions (normalized)
  const aspectRatio = artwork.dimensions.height / artwork.dimensions.width;
  const height = 2;
  const width = height * aspectRatio;

  useFrame(() => {
    if (meshRef.current) {
      const targetScale = isActive ? 1.1 : hovered ? 1.05 : 1;
      meshRef.current.scale.lerp(
        new Vector3(targetScale, targetScale, targetScale),
        0.1
      );
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
        color={isActive ? "#fff" : "#aaa"}
        metalness={0.1}
        roughness={0.8}
        emissive={isActive ? "#fff8e8" : "#221f1c"}
        emissiveIntensity={isActive ? 0.35 : 0.08}
      />
      <mesh position={[0, 0, 0.08]} castShadow>
        <planeGeometry args={[width * 0.9, height * 0.9]} />
        <meshStandardMaterial map={texture} roughness={1} metalness={0} />
      </mesh>
      {/* Soft warm light emanating from the active frame */}
      {isActive && (
        <pointLight position={[0, 0, 0.6]} intensity={1.2} distance={4} decay={2} color="#fff4d0" />
      )}
    </mesh>
  );
}