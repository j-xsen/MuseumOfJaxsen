import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useData } from "vike-react/useData";
import Floor from "./Floor";
import Wall from "./Wall";
import Artwork from "./Artwork";
import ArtworkLabel from "./ArtworkLabel";
import CameraAnimator from "./CameraAnimator";
import BackRoom from "./BackRoom";
import { useMuseumStore } from "../lib/store";
import type { Data } from "../pages/index/+data";
import { Group } from "three";

export type PlaneProps = {
  width: number;
  height: number;
  position: [number, number, number];
};

function Structure() {
  const data = useData<Data | { artwork?: any }>();

  const artworks = "artworks" in data ? data.artworks : [];
  const isGalleryPage = artworks.length > 0;

  if (!isGalleryPage) {
    return (
      <group>
        <ambientLight intensity={0.8} />
        <color attach="background" args={["#f5f5f5"]} />
      </group>
    );
  }

  const spacing = 3;
  const wallWidth = artworks.length * spacing + 2;

  return (
    <group>
      {/* Low ambient so track lights and shadows read clearly */}
      <ambientLight intensity={0.3} />

      {/* Soft fill from above — no shadow, just keeps darks from being black */}
      <directionalLight position={[0, 10, 4]} intensity={0.25} />

      {/* Track lights: three ceiling spots spaced across the gallery */}
      {([-3, 0, 3] as number[]).map((x) => (
        <spotLight
          key={x}
          position={[x, 7.5, 2.5]}
          target-position={[x, 0, 0]}
          intensity={28}
          angle={0.35}
          penumbra={0.6}
          distance={14}
          decay={2}
          castShadow
          shadow-mapSize={[1024, 1024]}
          shadow-bias={-0.001}
        />
      ))}

      <Suspense fallback={null}>
        <Wall height={9} width={wallWidth} position={[0, 1, 0]} />
        <Floor height={6} width={wallWidth} position={[0, -1, 0]} />
      </Suspense>

      <CameraAnimator />
      <LazyBackRoom artworks={artworks} wallWidth={wallWidth} />

      <GalleryController artworks={artworks} spacing={spacing}>
        {artworks.map((artwork, index) => (
          <group key={artwork.id}>
            <Artwork
              artwork={artwork}
              position={[index * spacing, 1.5, 0.1]}
              index={index}
            />
            <ArtworkLabel title={artwork.title} artworkId={artwork.id} x={index * spacing} />
          </group>
        ))}
      </GalleryController>
    </group>
  );
}

// Only mount BackRoom once the user has triggered the back-wall view — keeps initial load fast
function LazyBackRoom({ artworks, wallWidth }: { artworks: Data["artworks"]; wallWidth: number }) {
  const isBackWallView = useMuseumStore((s) => s.isBackWallView);
  const [everActivated, setEverActivated] = useState(false);

  useEffect(() => {
    if (isBackWallView && !everActivated) setEverActivated(true);
  }, [isBackWallView, everActivated]);

  if (!everActivated) return null;
  return <BackRoom artworks={artworks} wallWidth={wallWidth} />;
}

interface GalleryControllerProps {
  artworks: Data["artworks"];
  spacing: number;
  children: React.ReactNode;
}

function GalleryController({ artworks, spacing, children }: GalleryControllerProps) {
  const { gl } = useThree();
  const groupRef = useRef<Group>(null);
  const setActiveArtworkId = useMuseumStore((state) => state.setActiveArtworkId);
  const activeIdRef = useRef<string | null>(null);
  const isBackWallView = useMuseumStore((s) => s.isBackWallView);
  const isBackRef = useRef(isBackWallView);

  useEffect(() => { isBackRef.current = isBackWallView; }, [isBackWallView]);

  // Scroll state — all mutable, never trigger re-renders
  const targetIndex = useRef(0);
  const rawAccum = useRef(0);
  const displayX = useRef(0);
  const lastScrollTime = useRef(0);

  const COMMIT_THRESHOLD = 100;
  const MAX_VISUAL_DRAG = spacing * 0.3;

  useEffect(() => {
    if (artworks.length > 0) {
      setActiveArtworkId(artworks[0].id);
      activeIdRef.current = artworks[0].id;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      if (isBackRef.current) return;
      e.preventDefault();
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 24;
      if (e.deltaMode === 2) delta *= 400;
      rawAccum.current += delta;
      lastScrollTime.current = Date.now();
    };

    let lastTouchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (isBackRef.current) return;
      lastTouchX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isBackRef.current) return;
      const dx = lastTouchX - e.touches[0].clientX;
      lastTouchX = e.touches[0].clientX;
      rawAccum.current += dx * 2;
      lastScrollTime.current = Date.now();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
    };
  }, [gl]);

  useFrame(() => {
    const n = artworks.length;
    const timeSince = Date.now() - lastScrollTime.current;
    const isScrolling = timeSince < 150;

    if (isScrolling) {
      if (Math.abs(rawAccum.current) > COMMIT_THRESHOLD) {
        const dir = Math.sign(rawAccum.current);
        targetIndex.current = Math.max(0, Math.min(n - 1, targetIndex.current + dir));
        rawAccum.current = 0;
      }
    } else {
      rawAccum.current *= 0.78;
      if (Math.abs(rawAccum.current) < 0.5) rawAccum.current = 0;
    }

    const visualOffset = -Math.tanh(rawAccum.current / COMMIT_THRESHOLD) * MAX_VISUAL_DRAG;
    const targetX = -(targetIndex.current * spacing) + visualOffset;

    displayX.current += (targetX - displayX.current) * 0.12;

    if (groupRef.current) {
      groupRef.current.position.x = displayX.current;
    }

    let closestIndex = 0;
    let closestDist = Infinity;
    artworks.forEach((_, i) => {
      const dist = Math.abs(i * spacing + displayX.current);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = i;
      }
    });

    const closestId = artworks[closestIndex].id;
    if (closestId !== activeIdRef.current) {
      activeIdRef.current = closestId;
      setActiveArtworkId(closestId);
    }
  });

  return <group ref={groupRef}>{children}</group>;
}

export default Structure;
