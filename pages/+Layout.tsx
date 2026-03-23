import "./Layout.css";

import { ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import Structure from "../components/Structure";
import { Fullscreen } from "@react-three/uikit";
import ArtworkDetailOverlay from "../components/ArtworkDetailOverlay";
import GalleryA11y from "../components/GalleryA11y";
import { usePageContext } from "vike-react/usePageContext";

export default function Layout({ children }: { children: ReactNode }) {
  const { urlPathname } = usePageContext();

  if (urlPathname.startsWith("/purchase/success") || urlPathname.startsWith("/admin") || urlPathname.startsWith("/artwork/")) {
    return <>{children}</>;
  }

  return (
    <div
      role="region"
      aria-label="Art gallery — use arrow keys or scroll to browse artworks"
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
      <GalleryA11y />
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1 }}>
        <ArtworkDetailOverlay />
      </div>
    </div>
  );
}
