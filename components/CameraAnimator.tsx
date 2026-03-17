import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { useMuseumStore } from "../lib/store";

// Camera position never changes — the gallery group moves, not the camera
const CAMERA_POS = new Vector3(0, 1.3, 4);

export default function CameraAnimator() {
  const { camera, gl } = useThree();
  const isBackWallView = useMuseumStore((s) => s.isBackWallView);
  const isBackRef = useRef(isBackWallView);

  useEffect(() => {
    isBackRef.current = isBackWallView;
    if (!isBackWallView) lookOffset.current = { x: 0, y: 0 };
  }, [isBackWallView]);

  // θ = π → looking at gallery (z=0), θ = 0 → looking at back wall (z=8)
  // Sweeping θ from π→0 rotates the view clockwise around Y, avoiding any flip.
  const theta = useRef(Math.PI);

  // Look-around offset: x/y pan of the target point on the back wall surface
  const lookOffset = useRef({ x: 0, y: 0 });
  const drag = useRef({ active: false, startX: 0, startY: 0, baseX: 0, baseY: 0 });

  useEffect(() => {
    const el = gl.domElement;

    const startDrag = (x: number, y: number) => {
      if (!isBackRef.current) return;
      drag.current = {
        active: true,
        startX: x,
        startY: y,
        baseX: lookOffset.current.x,
        baseY: lookOffset.current.y,
      };
    };
    const moveDrag = (x: number, y: number) => {
      const d = drag.current;
      if (!d.active) return;
      const dx = (x - d.startX) / window.innerWidth * 5;
      const dy = (y - d.startY) / window.innerHeight * 3;
      lookOffset.current = {
        x: Math.max(-3, Math.min(3, d.baseX - dx)),
        y: Math.max(-1.5, Math.min(2, d.baseY - dy)),
      };
    };
    const endDrag = () => { drag.current.active = false; };

    const onTouchStart = (e: TouchEvent) => {
      startDrag(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => moveDrag(e.touches[0].clientX, e.touches[0].clientY);

    el.addEventListener("mousedown", (e) => startDrag(e.clientX, e.clientY));
    window.addEventListener("mousemove", (e) => moveDrag(e.clientX, e.clientY));
    window.addEventListener("mouseup", endDrag);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: true });
    el.addEventListener("touchend", endDrag, { passive: true });

    // Cursor feedback while in back-wall view
    el.addEventListener("mouseenter", () => { if (isBackRef.current) el.style.cursor = "grab"; });
    el.addEventListener("mousedown", () => { if (isBackRef.current) el.style.cursor = "grabbing"; });
    window.addEventListener("mouseup", () => { if (isBackRef.current) el.style.cursor = "grab"; });
  }, [gl]);

  useFrame(() => {
    const targetTheta = isBackRef.current ? 0 : Math.PI;
    theta.current += (targetTheta - theta.current) * 0.06;

    // How far into detail view (0 = gallery, 1 = back wall)
    const detailProgress = 1 - theta.current / Math.PI;

    const dist = 4;
    // sin(π)=0,cos(π)=-1 → looks at z=0 (gallery)
    // sin(0)=0, cos(0)=+1 → looks at z=8 (back wall)
    const lx = Math.sin(theta.current) * dist + lookOffset.current.x * detailProgress;
    // In gallery: slight upward tilt (0.2). In detail: look higher up the back wall (1.5) so tall pieces aren't cut off.
    const ly = 0.2 + 0.325 * detailProgress + lookOffset.current.y * detailProgress;
    const lz = Math.cos(theta.current) * dist;

    camera.position.copy(CAMERA_POS);
    camera.lookAt(
      CAMERA_POS.x + lx,
      CAMERA_POS.y + ly,
      CAMERA_POS.z + lz,
    );
  });

  return null;
}
