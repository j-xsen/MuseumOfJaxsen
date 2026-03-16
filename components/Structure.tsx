import { ScrollControls, Scroll } from "@react-three/drei";
import { useData } from "vike-react/useData";
import Floor from "./Floor";
import Wall from "./Wall";
import Artwork from "./Artwork";
import { useMuseumStore } from "../lib/store";
import { useEffect } from "react";
import type { Data } from "../pages/index/+data";

export type PlaneProps = {
  width: number;
  height: number;
  position: [number, number, number];
};

function Structure() {
  const { artworks } = useData<Data>();
  const spacing = 3; // Space between artworks
  const wallWidth = artworks.length * spacing + 2;

  return (
    <group>
      <ambientLight intensity={0.5} />
      <directionalLight position={[0, 5, 5]} intensity={0.8} castShadow />
      <spotLight position={[0, 3, 2]} intensity={0.5} angle={0.3} penumbra={1} />

      <Wall height={5} width={wallWidth} position={[0, 1, 0]} />
      <Floor height={6} width={wallWidth} position={[0, -1, 0]} />

      <ScrollControls pages={3} damping={0.2}>
        <Scroll>
          <ArtworkGallery artworks={artworks} spacing={spacing} />
        </Scroll>
      </ScrollControls>
    </group>
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
        const xPosition = (index - (artworks.length - 1) / 2) * spacing;
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
