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
  const artworks = data != undefined ? "artworks" in data ? data.artworks : [] : null;

  const activeArtworkId = useMuseumStore((state) => state.activeArtworkId);
  const isBackWallView = useMuseumStore((s) => s.isBackWallView);
  const setIsBackWallView = useMuseumStore((s) => s.setIsBackWallView);
  const isCameraTransitioning = useMuseumStore((s) => s.isCameraTransitioning);
  const isBackRoomReady = useMuseumStore((s) => s.isBackRoomReady);

  // Hide all UI while camera is moving, or while waiting for back-room texture to load.
  if (isCameraTransitioning || (isBackWallView && !isBackRoomReady)) return null;

  // Back-wall view: show a simple "back" button and drag hint.
  if (isBackWallView) {
    return (
      <>
        <button
          type="button"
          aria-label="Return to gallery"
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
            fontSize: 16,
            color: "#1a1814",
          }}
        >
          ← Gallery
        </button>
        <div
          role="status"
          aria-live="polite"
          style={{
            position: "absolute",
            bottom: 24,
            left: "50%",
            transform: "translateX(-50%)",
            fontSize: 14,
            color: "rgba(255,255,255,0.75)",
            pointerEvents: "none",
            letterSpacing: "0.04em",
          }}
        >
          drag to look around
        </div>
      </>
    );
  }

  if (!activeArtworkId || artworks == null || artworks.length === 0) return null;
  const artwork = artworks.find((a) => a.id === activeArtworkId);
  if (!artwork) return null;

  return (
    <div
      role="region"
      aria-label={`Artwork detail: ${artwork.title}`}
      aria-live="polite"
      style={{
        position: "absolute",
        bottom: 24,
        left: "50%",
        transform: "translateX(-50%)",
        width: "min(80vw, 320px)",
        pointerEvents: "auto",
        backgroundColor: "#faf8f3",
        border: "1px solid #d4cfc7",
        borderRadius: 2,
        padding: "clamp(10px, 2.5vw, 16px) clamp(12px, 3.5vw, 24px)",
        fontFamily: "system-ui, -apple-system, Georgia, serif",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: "clamp(15px, 4.5vw, 20px)", fontWeight: "bold", color: "#1a1814", lineHeight: 1.2 }}>
        {artwork.title}
      </div>

      {/* #3d3a36 on #faf8f3 ≈ 9:1 — passes AAA */}
      <div style={{ marginTop: 4, fontSize: "clamp(14px, 3.5vw, 16px)", color: "#3d3a36" }}>
        {artwork.artist}
      </div>

      <div style={{ marginTop: 10, marginBottom: 10, height: 1, backgroundColor: "#d4cfc7" }} />

      {/* #5c5750 on #faf8f3 ≈ 5.9:1 — passes AA */}
      <div style={{ fontSize: "clamp(14px, 3vw, 15px)", color: "#5c5750" }}>
        {`${artwork.year} · ${artwork.medium}`}
      </div>

      <div style={{ marginTop: 12, display: "flex", gap: 10 }}>
        <button
          type="button"
          data-gallery-action="order"
          aria-label={
            artwork.available
              ? `Order a print of ${artwork.title} for $${artwork.price}`
              : `${artwork.title} is not available for purchase`
          }
          aria-disabled={!artwork.available}
          onClick={artwork.available ? () => createCheckoutSession(artwork) : undefined}
          style={{
            ...BTN_BASE,
            flex: 1,
            padding: "clamp(9px, 2.5vw, 14px) 8px",
            border: `1px solid ${artwork.available ? "#1a1814" : "#b0aba5"}`,
            borderRadius: 2,
            fontSize: "clamp(14px, 3vw, 15px)",
            fontWeight: "bold",
            // #5c5750 on #faf8f3 ≈ 5.9:1 for disabled state — passes AA
            color: artwork.available ? "#1a1814" : "#5c5750",
            cursor: artwork.available ? "pointer" : "default",
            whiteSpace: "nowrap",
          }}
        >
          {artwork.available ? `Order a Print — $${artwork.price}` : "Not Available"}
        </button>

        <button
          type="button"
          aria-label={`View ${artwork.title} full size`}
          onClick={() => setIsBackWallView(true)}
          style={{
            ...BTN_BASE,
            padding: "clamp(9px, 2.5vw, 14px) clamp(10px, 2.5vw, 16px)",
            border: "1px solid #d4cfc7",
            borderRadius: 2,
            fontSize: "clamp(14px, 3vw, 15px)",
            // #5c5750 on #faf8f3 ≈ 5.9:1 — passes AA
            color: "#5c5750",
          }}
        >
          View Large
        </button>
      </div>
    </div>
  );
}
