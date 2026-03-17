import { useData } from "vike-react/useData";
import { useMuseumStore } from "../lib/store";
import { createCheckoutSession } from "../lib/stripe";
import type { Data } from "../pages/index/+data";

const BTN_BASE: React.CSSProperties = {
  border: "none",
  background: "none",
  cursor: "pointer",
  fontFamily: "system-ui, -apple-system, Georgia, serif",
};

export default function ArtworkDetailOverlay() {
  const data = useData<Data | { artwork?: unknown }>();
  const artworks = "artworks" in data ? data.artworks : [];

  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const isBackWallView = useMuseumStore((s) => s.isBackWallView);
  const setIsBackWallView = useMuseumStore((s) => s.setIsBackWallView);

  // Back-wall view: show a simple "back" button and drag hint
  if (isBackWallView) {
    return (
      <>
        <button
          onClick={() => setIsBackWallView(false)}
          style={{
            ...BTN_BASE,
            position: "absolute",
            top: 24,
            left: 24,
            pointerEvents: "auto",
            backgroundColor: "#faf8f3",
            border: "1px solid #d4cfc7",
            borderRadius: 2,
            padding: "10px 18px",
            fontSize: 15,
            color: "#1a1814",
          }}
        >
          ← Gallery
        </button>
        <div
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 13,
            color: "rgba(255,255,255,0.55)",
            pointerEvents: "none",
            letterSpacing: "0.04em",
          }}
        >
          drag to look around
        </div>
      </>
    );
  }

  if (!activeArtworkId || artworks.length === 0) return null;
  const artwork = artworks.find((a) => a.id === activeArtworkId);
  if (!artwork) return null;

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
      <div style={{ fontSize: 20, fontWeight: "bold", color: "#1a1814", lineHeight: 1.2 }}>
        {artwork.title}
      </div>

      <div style={{ marginTop: 8, fontSize: 16, color: "#5a5650" }}>
        {artwork.artist}
      </div>

      <div style={{ marginTop: 20, marginBottom: 20, height: 1, backgroundColor: "#d4cfc7" }} />

      <div style={{ fontSize: 15, color: "#7a7670" }}>
        {`${artwork.year} · ${artwork.medium}`}
      </div>

      <div style={{ marginTop: 24, display: "flex", gap: 10 }}>
        <button
          onClick={artwork.available ? () => createCheckoutSession(artwork) : undefined}
          style={{
            ...BTN_BASE,
            flex: 1,
            padding: "14px 8px",
            border: `1px solid ${artwork.available ? "#1a1814" : "#c0bbb5"}`,
            borderRadius: 2,
            fontSize: 15,
            fontWeight: "bold",
            color: artwork.available ? "#1a1814" : "#c0bbb5",
            cursor: artwork.available ? "pointer" : "default",
          }}
        >
          {artwork.available ? `Acquire — $${artwork.price}` : "Not Available"}
        </button>

        <button
          onClick={() => setIsBackWallView(true)}
          style={{
            ...BTN_BASE,
            padding: "14px 16px",
            border: "1px solid #d4cfc7",
            borderRadius: 2,
            fontSize: 15,
            color: "#7a7670",
          }}
        >
          Details
        </button>
      </div>
    </div>
  );
}
