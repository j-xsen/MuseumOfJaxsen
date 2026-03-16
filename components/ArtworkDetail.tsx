import { Container, Text, DefaultProperties } from "@react-three/uikit";
import { useData } from "vike-react/useData";
import { useMuseumStore } from "../lib/store";
import { createCheckoutSession } from "../lib/stripe";
import type { Data } from "../pages/index/+data";

export default function ArtworkDetail() {
  const { artworks } = useData<Data>();
  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const isDetailViewOpen = useMuseumStore((state) => state.isDetailViewOpen);
  const closeArtworkDetail = useMuseumStore((state) => state.closeArtworkDetail);

  if (!isDetailViewOpen || !activeArtworkId) {
    return null;
  }

  const artwork = artworks.find((a) => a.id === activeArtworkId);

  if (!artwork) {
    return null;
  }

  const handlePurchase = async () => {
    await createCheckoutSession(artwork);
  };

  return (
      <Container
        positionType="absolute"
        positionBottom={32}
        positionLeft={32}
        flexDirection="column"
        padding={24}
        gap={12}
        backgroundColor="#ffffff"
        borderRadius={8}
        maxWidth={400}
        onClick={(e) => e.stopPropagation?.()}
      >
        {/* Close button */}
        <Container
          positionType="absolute"
          positionTop={8}
          positionRight={8}
          width={32}
          height={32}
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          onClick={closeArtworkDetail}
        >
          <Text fontSize={24} fontWeight="bold">
            ×
          </Text>
        </Container>

        <Text fontSize={24} fontWeight="bold">
          {artwork.title}
        </Text>

        <Text fontSize={14} color="#666666">
          {artwork.artist}, {artwork.year}
        </Text>

        <Text fontSize={14} lineHeight={1.5}>
          {artwork.description}
        </Text>

        <Container
          marginTop={8}
          padding={12}
          backgroundColor={artwork.available ? "#4CAF50" : "#999999"}
          borderRadius={4}
          justifyContent="center"
          alignItems="center"
          cursor={artwork.available ? "pointer" : "default"}
          onClick={artwork.available ? handlePurchase : undefined}
        >
          <Text fontSize={16} fontWeight="bold" color="#ffffff">
            {artwork.available ? `Purchase - $${artwork.price}` : "Sold"}
          </Text>
        </Container>

        <Container
          marginTop={4}
          padding={12}
          backgroundColor="#2196F3"
          borderRadius={4}
          justifyContent="center"
          alignItems="center"
          cursor="pointer"
          onClick={() => {
            window.location.href = `/artwork/${artwork.slug}`;
          }}
        >
          <Text fontSize={14} fontWeight="medium" color="#ffffff">
            View Full Details →
          </Text>
        </Container>
      </Container>
  );
}
