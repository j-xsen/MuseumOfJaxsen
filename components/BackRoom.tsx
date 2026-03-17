import { Suspense, useEffect, useMemo, useRef } from "react";
import { Plane, useTexture, useKTX2 } from "@react-three/drei";
import { DoubleSide, RepeatWrapping, SpotLight } from "three";
import { useMuseumStore } from "../lib/store";
import type { Data } from "../pages/index/+data";

interface BackRoomProps {
  artworks: Data["artworks"];
  wallWidth: number;
}

function BackWallArtwork({ artwork }: { artwork: Data["artworks"][number] }) {
  const rawTexture = useTexture(artwork.imageUrlHiRez ?? artwork.imageUrl);

  // Viewing the back face of a plane horizontally mirrors the UVs.
  // Clone and flip U to compensate.
  const texture = useMemo(() => {
    const t = rawTexture.clone();
    t.wrapS = RepeatWrapping;
    t.repeat.set(-1, 1);
    t.offset.set(1, 0);
    t.needsUpdate = true;
    return t;
  }, [rawTexture]);

  const aspect = artwork.dimensions.width / artwork.dimensions.height;
  const maxH = 5.5;
  const maxW = 8;
  let artW = maxH;
  let artH = artW * aspect;
  if (artW > maxW) {
    artW = maxW;
    artH = artW / aspect;
  }

  return (
    <mesh position={[0, 1.8, 7.97]}>
      <planeGeometry args={[artW, artH]} />
      <meshStandardMaterial map={texture} roughness={1} metalness={0} side={DoubleSide} />
    </mesh>
  );
}

function BackWallSpot({ artworkY }: { artworkY: number }) {
  const ref = useRef<SpotLight>(null);

  // Set target imperatively — JSX target-position doesn't update the target object
  useEffect(() => {
    if (!ref.current) return;
    ref.current.target.position.set(0, artworkY, 8);
    ref.current.target.updateMatrixWorld();
  }, [artworkY]);

  return (
    <spotLight
      ref={ref}
      position={[0, 7.5, 4]}
      intensity={80}
      angle={0.45}
      penumbra={0.5}
      distance={16}
      decay={2}
      castShadow
      shadow-mapSize={[1024, 1024]}
      shadow-bias={-0.001}
    />
  );
}

function BackWallSurfaces({ wallWidth }: { wallWidth: number }) {
  const wallTex = useKTX2("/textures/wall.ktx2", "/basis/");
  const floorTex = useKTX2("/textures/floor.ktx2", "/basis/");

  const tiledWall = useMemo(() => {
    const t = wallTex.clone();
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(wallWidth / 3, 9 / 3);
    t.needsUpdate = true;
    return t;
  }, [wallTex, wallWidth]);

  const tiledFloor = useMemo(() => {
    const t = floorTex.clone();
    t.wrapS = t.wrapT = RepeatWrapping;
    t.repeat.set(wallWidth / 2, 6 / 2);
    t.needsUpdate = true;
    return t;
  }, [floorTex, wallWidth]);

  return (
    <>
      <Plane receiveShadow args={[wallWidth, 9]} position={[0, 1, 8]} rotation={[0, Math.PI, 0]}>
        <meshStandardMaterial map={tiledWall} roughness={0.88} metalness={0.02} />
      </Plane>
      <Plane receiveShadow args={[wallWidth, 6]} position={[0, -1, 6]} rotation={[-1.5, 0, 0]}>
        <meshStandardMaterial map={tiledFloor} roughness={0.4} metalness={0.15} />
      </Plane>
    </>
  );
}

export default function BackRoom({ artworks, wallWidth }: BackRoomProps) {
  const activeArtworkId = useMuseumStore((s) => s.activeArtworkId);
  const artwork = artworks.find((a) => a.id === activeArtworkId);

  return (
    <group>
      {/* Back wall + floor extension — fall back to flat colour until textures load */}
      <Suspense fallback={
        <>
          <Plane receiveShadow args={[wallWidth, 9]} position={[0, 1, 8]} rotation={[0, Math.PI, 0]}>
            <meshStandardMaterial color="#e8e4de" roughness={0.88} metalness={0.02} />
          </Plane>
          <Plane receiveShadow args={[wallWidth, 6]} position={[0, -1, 6]} rotation={[-1.5, 0, 0]}>
            <meshStandardMaterial color="#c8bba8" roughness={0.4} metalness={0.15} />
          </Plane>
        </>
      }>
        <BackWallSurfaces wallWidth={wallWidth} />
      </Suspense>

      {/* Track spot aimed at the artwork center */}
      <BackWallSpot artworkY={1.8} />
      {/* Warm side fills so the painting isn't harshly single-lit */}
      <pointLight position={[-2, 3, 6]} intensity={12} distance={8} decay={2} color="#fff4e0" />
      <pointLight position={[2, 3, 6]} intensity={12} distance={8} decay={2} color="#fff4e0" />

      {artwork && (
        <Suspense fallback={null}>
          <BackWallArtwork artwork={artwork} />
        </Suspense>
      )}
    </group>
  );
}
