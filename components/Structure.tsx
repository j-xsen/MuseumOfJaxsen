import { ScrollControls, Scroll } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import { useData } from "vike-react/useData";
import { usePageContext } from "vike-react/usePageContext";
import Floor from "./Floor";
import Wall from "./Wall";
import Artwork from "./Artwork";
import CameraController from "./CameraController";
import { useMuseumStore } from "../lib/store";
import { useEffect } from "react";
import type { Data } from "../pages/index/+data";

export type PlaneProps = {
  width: number;
  height: number;
  position: [number, number, number];
};

function Structure() {
  const pageContext = usePageContext();
  const data = useData<Data | { artwork?: any }>();

  // Check if we're on the index page (has artworks array)
  const artworks = "artworks" in data ? data.artworks : [];
  const isGalleryPage = artworks.length > 0;

  if (!isGalleryPage) {
    // Simple lighting for detail pages
    return (
      <group>
        <ambientLight intensity={0.8} />
        <color attach="background" args={["#f5f5f5"]} />
      </group>
    );
  }

  const spacing = 3; // Space between artworks
  const wallWidth = artworks.length * spacing + 2;

  return (
    <group>
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1.5} castShadow />
      <spotLight position={[0, 3, 2]} intensity={0.5} angle={0.3} penumbra={1} />

      <Wall height={5} width={wallWidth} position={[(artworks.length - 1) * spacing / 2, 1, 0]} />
      <Floor height={6} width={wallWidth} position={[(artworks.length - 1) * spacing / 2, -1, 0]} />

      <GalleryScrollControls artworks={artworks} spacing={spacing} />
    </group>
  );
}

interface GalleryScrollControlsProps {
  artworks: Data["artworks"];
  spacing: number;
}

function GalleryScrollControls({ artworks, spacing }: GalleryScrollControlsProps) {
  const { viewport } = useThree();
  const pages = 1 + ((artworks.length - 1) * spacing) / viewport.width;
  return (
    <ScrollControls pages={pages} damping={0.2} horizontal>
      <CameraController artworks={artworks} spacing={spacing} />
      <Scroll>
        <ArtworkGallery artworks={artworks} spacing={spacing} />
      </Scroll>
    </ScrollControls>
  );
}

interface ArtworkGalleryProps {
  artworks: Data["artworks"];
  spacing: number;
}

function ArtworkGallery({ artworks, spacing }: ArtworkGalleryProps) {
  const setActiveArtworkId = useMuseumStore((state) => state.setActiveArtworkId);

  useEffect(() => {
    // Set first artwork as active by default
    if (artworks.length > 0) {
      setActiveArtworkId(artworks[0].id);
    }
  }, [setActiveArtworkId, artworks]);

  return (
    <group>
      {artworks.map((artwork, index) => {
        const xPosition = index * spacing;
        return (
          <Artwork
            key={artwork.id}
            artwork={artwork}
            position={[xPosition, 1.5, 0.1]}
            index={index}
          />
        );
      })}
    </group>
  );
}

export default Structure;
