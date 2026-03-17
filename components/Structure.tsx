import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useData } from "vike-react/useData";
import Floor from "./Floor";
import Wall from "./Wall";
import Artwork from "./Artwork";
import ArtworkLabel from "./ArtworkLabel";
import { useMuseumStore } from "../lib/store";
import type { Data } from "../pages/index/+data";
import type * as THREE from "three";
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
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1.5} castShadow />
      <spotLight position={[0, 3, 2]} intensity={0.5} angle={0.3} penumbra={1} />

      <Wall height={9} width={wallWidth} position={[0, 1, 0]} />
      <Floor height={6} width={wallWidth} position={[0, -1, 0]} />

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

  // Scroll state — all mutable, never trigger re-renders
  const targetIndex = useRef(0);
  const rawAccum = useRef(0);   // accumulated raw input in px
  const displayX = useRef(0);   // current smoothed group X
  const lastScrollTime = useRef(0);

  // px of input to commit to next artwork; visual drag maxes out before this
  const COMMIT_THRESHOLD = 100;
  const MAX_VISUAL_DRAG = spacing * 0.3;

  const { camera } = useThree();

  useEffect(() => {
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  useEffect(() => {
    if (artworks.length > 0) {
      setActiveArtworkId(artworks[0].id);
      activeIdRef.current = artworks[0].id;
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = gl.domElement;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      let delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (e.deltaMode === 1) delta *= 24;   // line mode → px
      if (e.deltaMode === 2) delta *= 400;  // page mode → px
      rawAccum.current += delta;
      lastScrollTime.current = Date.now();
    };

    let lastTouchX = 0;
    const onTouchStart = (e: TouchEvent) => {
      lastTouchX = e.touches[0].clientX;
    };
    const onTouchMove = (e: TouchEvent) => {
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
      // Commit to next/prev artwork when input crosses threshold
      if (Math.abs(rawAccum.current) > COMMIT_THRESHOLD) {
        const dir = Math.sign(rawAccum.current);
        targetIndex.current = Math.max(0, Math.min(n - 1, targetIndex.current + dir));
        rawAccum.current = 0;
      }
    } else {
      // Input stopped — spring rawAccum back to 0
      rawAccum.current *= 0.78;
      if (Math.abs(rawAccum.current) < 0.5) rawAccum.current = 0;
    }

    // tanh gives exponential feel: small input → tiny nudge, large input → saturates
    const visualOffset = -Math.tanh(rawAccum.current / COMMIT_THRESHOLD) * MAX_VISUAL_DRAG;
    const targetX = -(targetIndex.current * spacing) + visualOffset;

    // Spring the group toward target
    displayX.current += (targetX - displayX.current) * 0.12;

    if (groupRef.current) {
      groupRef.current.position.x = displayX.current;
    }

    // Update active artwork to whichever is closest to screen center (x=0)
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
