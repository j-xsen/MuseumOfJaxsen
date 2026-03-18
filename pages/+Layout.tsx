import "./Layout.css";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import Structure from "../components/Structure";
import { Fullscreen } from "@react-three/uikit";
import ArtworkDetailOverlay from "../components/ArtworkDetailOverlay";
import { usePageContext } from "vike-react/usePageContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { urlPathname } = usePageContext();

  if (urlPathname.startsWith("/purchase/success")) {
    return <>{children}</>;
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
      }}
    >
      <Canvas
        gl={{ antialias: true, alpha: false, localClippingEnabled: true }}
        shadows
        camera={{ fov: 80, near: 0.1, far: 100, position: [0, 1.3, 4] }}
        dpr={[1, 2]}
        style={{ width: "100%", height: "100%" }}
      >
        <Structure />
        <Fullscreen>{children}</Fullscreen>
      </Canvas>
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <ArtworkDetailOverlay />
      </div>
    </div>
  );
}
