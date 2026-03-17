import { Suspense, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Text3D } from "@react-three/drei";
import { type Mesh, Group, MeshStandardMaterial, Euler, Quaternion } from "three";
import { useMuseumStore } from "../lib/store";

const FONT_URL = "/fonts/helvetiker_regular.typeface.json";
const FONT_SIZE = 0.18;
const MAX_CHARS_PER_LINE = 15;

// Artwork frame: center Y=1.5, height=2, active scale=1.1
// Frame top when active: 1.5 + (2/2 * 1.1) = 2.6, plus a small gap
const LABEL_Y_ACTIVE = 1.5 + 1.1 + 0.1; // 2.7
const LABEL_Y_INACTIVE = LABEL_Y_ACTIVE - 0.25;

function wrapTitle(title: string, maxChars: number): string {
  const words = title.split(" ");
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

function LabelMesh({ title, artworkId }: { title: string; artworkId: string }) {
  const meshRef = useRef<Mesh>(null);
  const matRef = useRef<MeshStandardMaterial>(null);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const measured = useRef(false);

  useFrame(() => {
    // Measure once: shift mesh so X is centered and Y bottom sits at local Y=0
    if (!measured.current && meshRef.current?.geometry) {
      const geom = meshRef.current.geometry;
      geom.computeBoundingBox();
      const bb = geom.boundingBox;
      if (bb && !bb.isEmpty()) {
        meshRef.current.position.x = -((bb.min.x + bb.max.x) / 2);
        meshRef.current.position.y = -bb.min.y;
        measured.current = true;
      }
    }

    if (matRef.current) {
      const target = activeArtworkId === artworkId ? 1 : 0;
      matRef.current.opacity += (target - matRef.current.opacity) * 0.08;
    }
  });

  return (
    <Text3D ref={meshRef} font={FONT_URL} size={FONT_SIZE} height={0.04}>
      {wrapTitle(title, MAX_CHARS_PER_LINE)}
      <meshStandardMaterial ref={matRef} color="black" transparent opacity={0} />
    </Text3D>
  );
}

interface ArtworkLabelProps {
  title: string;
  artworkId: string;
  x: number;
}

const pitchDown = new Quaternion().setFromEuler(new Euler(0.175, 0, 0));

export default function ArtworkLabel({ title, artworkId, x }: ArtworkLabelProps) {
  const groupRef = useRef<Group>(null);
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    const isActive = activeArtworkId === artworkId;
    const targetY = isActive ? LABEL_Y_ACTIVE : LABEL_Y_INACTIVE;
    groupRef.current.position.y += (targetY - groupRef.current.position.y) * 0.08;
    // Billboard facing camera, then pitch down slightly so text reads flat
    groupRef.current.quaternion.copy(camera.quaternion).multiply(pitchDown);
  });

  return (
    <group ref={groupRef} position={[x, LABEL_Y_INACTIVE, 0.15]}>
      <Suspense fallback={null}>
        <LabelMesh title={title} artworkId={artworkId} />
      </Suspense>
    </group>
  );
}
