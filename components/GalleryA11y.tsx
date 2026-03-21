import { useEffect, useRef, useState } from "react";
import { useData } from "vike-react/useData";
import { useMuseumStore } from "../lib/store";
import type { Data } from "../pages/index/+data";

export default function GalleryA11y() {
  const data = useData<Data | { artworks?: unknown }>();
  const artworks = data != null && "artworks" in data && Array.isArray((data as Data).artworks)
    ? (data as Data).artworks
    : [];

  const activeArtworkId = useMuseumStore((s) => s.activeArtworkId);
  const openArtworkDetail = useMuseumStore((s) => s.openArtworkDetail);
  const setActiveArtworkId = useMuseumStore((s) => s.setActiveArtworkId);

  // Slide the nav panel into view while any button in it has focus
  const [navFocused, setNavFocused] = useState(false);

  // Announcement for screen readers when the active artwork changes
  const [announcement, setAnnouncement] = useState("");
  const clearTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const artwork = artworks.find((a) => a.id === activeArtworkId);
    if (!artwork) return;
    if (clearTimer.current) clearTimeout(clearTimer.current);
    setAnnouncement(
      `${artwork.title} by ${artwork.artist}, ${artwork.year}. ` +
      `${artwork.medium}. ` +
      (artwork.available ? `Available for $${artwork.price}.` : "Sold.")
    );
    clearTimer.current = setTimeout(() => setAnnouncement(""), 3000);
  }, [activeArtworkId]);

  if (artworks.length === 0) return null;

  return (
    <>
      {/* Screen reader live region — announces the artwork as the gallery scrolls */}
      <div
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        {announcement}
      </div>

      {/* Skip-link style nav: hidden above the viewport, slides down on focus.
          This gives keyboard users a visible, usable list instead of orphaned focus rings. */}
      <nav
        aria-label="Gallery artworks"
        onFocus={(e) => {
          setNavFocused(true);
          // If focus arrived from outside the nav (Tab or Shift+Tab),
          // redirect it to the currently active artwork button.
          const nav = e.currentTarget;
          if (!nav.contains(e.relatedTarget as Node)) {
            const activeBtn = nav.querySelector<HTMLButtonElement>('[aria-pressed="true"]');
            activeBtn?.focus();
          }
        }}
        onBlur={() => setNavFocused(false)}
        onKeyDown={(e) => { if (e.key === "Escape") { setNavFocused(false); (e.currentTarget as HTMLElement).blur(); } }}
        style={{
          position: "fixed",
          top: navFocused ? 0 : "-100%",
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: "#faf8f3",
          borderBottom: "1px solid #d4cfc7",
          padding: "12px 20px",
          fontFamily: "system-ui, -apple-system, Georgia, serif",
          transition: "top 0.15s ease",
          maxHeight: "50vh",
          overflowY: "auto",
        }}
      >
        <p style={{
          fontSize: "13px",
          color: "#5c5750",
          marginBottom: "10px",
          letterSpacing: "0.03em",
          lineHeight: 1.6,
        }}>
          <strong>Tab</strong> or <strong>← →</strong> to browse · <strong>Enter</strong> to select · <strong>Esc</strong> to close
        </p>
        <ul role="list" style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {artworks.map((artwork) => {
            const isActive = artwork.id === activeArtworkId;
            return (
              <li key={artwork.id}>
                <button
                  type="button"
                  aria-pressed={isActive}
                  onFocus={() => {
                    setActiveArtworkId(artwork.id);
                    openArtworkDetail(artwork.id);
                  }}
                  onClick={() => {
                    setActiveArtworkId(artwork.id);
                    openArtworkDetail(artwork.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      setNavFocused(false);
                      setTimeout(() => {
                        document.querySelector<HTMLButtonElement>('[data-gallery-action="order"]')?.focus();
                      }, 50);
                    }
                  }}
                  style={{
                    background: isActive ? "#1a1814" : "none",
                    border: `1px solid ${isActive ? "#1a1814" : "#d4cfc7"}`,
                    color: isActive ? "#faf8f3" : "#1a1814",
                    fontSize: "14px",
                    padding: "6px 14px",
                    cursor: "pointer",
                    fontFamily: "inherit",
                    borderRadius: "2px",
                    outline: "2px solid transparent",
                    outlineOffset: "2px",
                  }}
                  onFocusCapture={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.outlineColor = "#1a1814";
                  }}
                  onBlurCapture={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.outlineColor = "transparent";
                  }}
                >
                  {artwork.title}
                  {!artwork.available && (
                    <span style={{ marginLeft: "6px", fontSize: "12px", opacity: 0.6 }}>(Sold)</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
