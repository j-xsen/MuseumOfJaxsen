import { Suspense, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import { type Mesh, Group, MeshStandardMaterial } from "three";
import { useMuseumStore } from "../lib/store";

const FONT_URL = "/fonts/helvetiker_regular.typeface.json";
const FONT_SIZE = 0.18;
const MAX_CHARS_PER_LINE = 15;

// Artwork frame: center Y=1.5, height=2, active scale=1.1
// Frame bottom when active: 1.5 - 1 * 1.1 = 0.4, minus a small gap
const INFO_Y_ACTIVE = 1.5 - 1.1 - 0.1; // 0.3
const INFO_Y_INACTIVE = INFO_Y_ACTIVE + 0.25;

function wrapLine(text: string, maxChars: number): string {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += " " + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines.join("\n");
}

function InfoMesh({ year, medium, artworkId }: { year: number; medium: string; artworkId: string }) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const measured = useRef(false);

  useFrame(() => {
    // Measure once: center X, anchor top of text at local Y=0 so text hangs downward
    if (!measured.current && meshRef.current?.geometry) {
      const geom = meshRef.current.geometry;
      geom.computeBoundingBox();
      const bb = geom.boundingBox;
      if (bb && !bb.isEmpty()) {
        meshRef.current.position.x = -((bb.min.x + bb.max.x) / 2);
        meshRef.current.position.y = -bb.max.y;
        measured.current = true;
      }
    }

    if (matRef.current) {
      const target = activeArtworkId === artworkId ? 1 : 0;
      matRef.current.opacity += (target - matRef.current.opacity) * 0.08;
    }
  });

  const text = `${year}\n${wrapLine(medium, MAX_CHARS_PER_LINE)}`;

  return (
    <Text3D ref={meshRef} font={FONT_URL} size={FONT_SIZE} height={0.04}>
      {text}
      <meshStandardMaterial ref={matRef} color="white" transparent opacity={0} />
    </Text3D>
  );
}

interface ArtworkInfoProps {
  year: number;
  medium: string;
  artworkId: string;
  x: number;
}

export default function ArtworkInfo({ year, medium, artworkId, x }: ArtworkInfoProps) {
  const groupRef = useRef<Group>(null);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);

  useFrame(() => {
    if (!groupRef.current) return;
    const isActive = activeArtworkId === artworkId;
    const targetY = isActive ? INFO_Y_ACTIVE : INFO_Y_INACTIVE;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
  });

  return (
    <group ref={groupRef} position={[x, INFO_Y_INACTIVE, 0.15]}>
      <Suspense fallback={null}>
        <InfoMesh year={year} medium={medium} artworkId={artworkId} />
      </Suspense>
    </group>
  );
}
