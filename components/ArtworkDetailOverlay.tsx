import { useData } from "vike-react/useData";
import { useMuseumStore } from "../lib/store";
import { createCheckoutSession } from "../lib/stripe";
import type { Data } from "../pages/index/+data";

export default function ArtworkDetailOverlay() {
  const data = useData<Data | { artwork?: unknown }>();
  const artworks = "artworks" in data ? data.artworks : [];

  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);

  if (!activeArtworkId || artworks.length === 0) return null;

  const artwork = artworks.find((a) => a.id === activeArtworkId);
  if (!artwork) return null;

  const handlePurchase = async () => {
    await createCheckoutSession(artwork);
  };

  return (
    <div
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "80vw",
        maxWidth: 320,
        pointerEvents: "auto",
        backgroundColor: "#faf8f3",
        border: "1px solid #d4cfc7",
        borderRadius: 2,
        padding: "28px 24px 24px",
        fontFamily: "system-ui, -apple-system, Georgia, serif",
        boxSizing: "border-box",
      }}
    >
      {/* Title */}
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#1a1814", lineHeight: 1.2 }}>
        {artwork.title}
      </div>

      {/* Artist */}
      <div style={{ marginTop: 8, fontSize: 16, color: "#5a5650" }}>
        {artwork.artist}
      </div>

      {/* Divider */}
      <div style={{ marginTop: 20, marginBottom: 20, height: 1, backgroundColor: "#d4cfc7" }} />

      {/* Metadata — year and medium only */}
      <div style={{ fontSize: 15, color: "#7a7670" }}>
        {`${artwork.year} · ${artwork.medium}`}
      </div>

      {/* Purchase row */}
      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        <button
          onClick={artwork.available ? handlePurchase : undefined}
          style={{
            flex: 1,
            padding: "14px 8px",
            border: `1px solid ${artwork.available ? "#1a1814" : "#c0bbb5"}`,
            borderRadius: 2,
            background: "none",
            fontSize: 15,
            fontWeight: "bold",
            color: artwork.available ? "#1a1814" : "#c0bbb5",
            cursor: artwork.available ? "pointer" : "default",
            fontFamily: "inherit",
          }}
        >
          {artwork.available ? `Acquire — $${artwork.price}` : "Not Available"}
        </button>

        <button
          onClick={() => { window.location.href = `/artwork/${artwork.slug}`; }}
          style={{
            padding: "14px 16px",
            border: "1px solid #d4cfc7",
            borderRadius: 2,
            background: "none",
            fontSize: 15,
            color: "#7a7670",
            cursor: "pointer",
            fontFamily: "inherit",
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}
