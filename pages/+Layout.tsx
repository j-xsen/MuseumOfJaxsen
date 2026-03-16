import "./Layout.css";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import Structure from "../components/Structure";
import { Fullscreen } from "@react-three/uikit";

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: false, localClippingEnabled: true }}
        shadows
        camera={{ fov: 80, near: 0.1, far: 100, position: [-12.2, 1.3, 4], rotation: [.05,0,0] }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Structure />
        <Fullscreen>{children}</Fullscreen>
      </Canvas>
    </div>
  );
}
