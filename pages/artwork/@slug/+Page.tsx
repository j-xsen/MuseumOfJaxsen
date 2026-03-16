import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { Container, Text } from "@react-three/uikit";
import { createCheckoutSession } from "../../../lib/stripe";

export default function ArtworkDetailPage() {
  const { artwork } = useData<Data>();

  const handlePurchase = async () => {
    await createCheckoutSession(artwork);
  };

  return (
    <Container
      flexDirection="column"
      padding={32}
      gap={16}
      backgroundColor="#ffffff"
      borderRadius={8}
      maxWidth={600}
      margin="auto"
    >
      <Text fontSize={32} fontWeight="bold">
        {artwork.title}
      </Text>

      <Text fontSize={18} color="#666666">
        by {artwork.artist}, {artwork.year}
      </Text>

      <Container
        width="100%"
        aspectRatio={artwork.dimensions.width / artwork.dimensions.height}
        backgroundColor="#f0f0f0"
        borderRadius={4}
      />

      <Text fontSize={16} lineHeight={1.6}>
        {artwork.description}
      </Text>

      <Container flexDirection="row" gap={16} marginTop={16}>
        <Container flexDirection="column" gap={4}>
          <Text fontSize={14} color="#666666">
            Medium
          </Text>
          <Text fontSize={16}>{artwork.medium}</Text>
        </Container>

        <Container flexDirection="column" gap={4}>
          <Text fontSize={14} color="#666666">
            Dimensions
          </Text>
          <Text fontSize={16}>
            {artwork.dimensions.width}" × {artwork.dimensions.height}"
          </Text>
        </Container>
      </Container>

      <Container
        marginTop={24}
        padding={16}
        backgroundColor={artwork.available ? "#4CAF50" : "#999999"}
        borderRadius={4}
        justifyContent="center"
        alignItems="center"
        cursor={artwork.available ? "pointer" : "default"}
        onClick={artwork.available ? handlePurchase : undefined}
      >
        <Text fontSize={18} fontWeight="bold" color="#ffffff">
          {artwork.available ? `Purchase - $${artwork.price}` : "Sold"}
        </Text>
      </Container>

      <Container marginTop={16} justifyContent="center">
        <Text fontSize={14} color="#666666">
          <a href="/" style={{ color: "inherit" }}>
            ← Back to Gallery
          </a>
        </Text>
      </Container>
    </Container>
  );
}
