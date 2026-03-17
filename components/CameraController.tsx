import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useScroll } from "@react-three/drei";
import { Vector3 } from "three";
import { useMuseumStore } from "../lib/store";
import type { Data } from "../pages/index/+data";

interface CameraControllerProps {
  artworks: Data["artworks"];
  spacing: number;
}

export default function CameraController({ artworks, spacing }: CameraControllerProps) {
  const { camera, viewport } = useThree();
  const scroll = useScroll();
  const setActiveArtworkId = useMuseumStore((state) => state.setActiveArtworkId);
  const tempVec = useRef(new Vector3());
  const activeIdRef = useRef<string | null>(null);

  useEffect(() => {
    camera.lookAt(0, 1.5, 0);
  }, [camera]);

  useFrame(() => {
    const n = artworks.length;
    const scrollGroupX = -(n - 1) * spacing * scroll.offset;

    let closestIndex = 0;
    let closestDist = Infinity;

    artworks.forEach((artwork, i) => {
      const worldX = i * spacing + scrollGroupX;
      tempVec.current.set(worldX, 1.5, 0.1);
      tempVec.current.project(camera);
      const dist = Math.abs(tempVec.current.x);
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

  return null;
}
