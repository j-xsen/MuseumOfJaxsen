import { Suspense, useEffect, useRef, useState } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useData } from "vike-react/useData";
import Floor from "./Floor";
import Wall from "./Wall";
import Artwork from "./Artwork";
import ArtworkLabel from "./ArtworkLabel";
import CameraAnimator from "./CameraAnimator";
import BackRoom from "./BackRoom";
import LogoDecal from "./LogoDecal";
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
        <LogoDecal />
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

// Keep BackRoom mounted once the user has visited — the wall/floor geometry must
// persist so there's no visible pop when returning from the back-wall view.
// BackWallArtwork (the hi-res image) is gated inside BackRoom by isBackWallView,
// so textures are only fetched when the user actually hits Details.
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

  // Respond to artwork navigation triggered externally (e.g. keyboard focus from GalleryA11y).
  // If activeArtworkId in the store differs from what this controller last set, snap to it.
  const activeArtworkId = useMuseumStore((s) => s.activeArtworkId);
  useEffect(() => {
    if (!activeArtworkId || activeArtworkId === activeIdRef.current) return;
    const index = artworks.findIndex((a) => a.id === activeArtworkId);
    if (index !== -1) {
      targetIndex.current = index;
      rawAccum.current = 0;
      activeIdRef.current = activeArtworkId;
    }
  }, [activeArtworkId]); // eslint-disable-line react-hooks/exhaustive-deps

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

    const onKeyDown = (e: KeyboardEvent) => {
      if (isBackRef.current) return;
      if (e.key === "ArrowLeft") {
        targetIndex.current = Math.max(0, targetIndex.current - 1);
        rawAccum.current = 0;
      } else if (e.key === "ArrowRight") {
        targetIndex.current = Math.min(artworks.length - 1, targetIndex.current + 1);
        rawAccum.current = 0;
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [gl]);

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05);
    const n = artworks.length;
    const timeSince = Date.now() - lastScrollTime.current;
    const isScrolling = timeSince < 200;

    if (isScrolling) {
      // Drain the accumulator one step at a time, carrying the remainder so
      // visualOffset transitions smoothly instead of snapping to zero on commit.
      while (Math.abs(rawAccum.current) > COMMIT_THRESHOLD) {
        const dir = Math.sign(rawAccum.current);
        const next = targetIndex.current + dir;
        if (next < 0 || next >= n) { rawAccum.current = 0; break; }
        targetIndex.current = next;
        rawAccum.current -= dir * COMMIT_THRESHOLD;
      }
    } else {
      rawAccum.current *= 0.78;
      if (Math.abs(rawAccum.current) < 0.5) rawAccum.current = 0;
    }

    const visualOffset = -Math.tanh(rawAccum.current / COMMIT_THRESHOLD) * MAX_VISUAL_DRAG;
    const targetX = -(targetIndex.current * spacing) + visualOffset;

    // Frame-rate independent lerp (≈0.2 per frame at 60 fps)
    displayX.current += (targetX - displayX.current) * (1 - Math.pow(0.8, dt * 60));

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
