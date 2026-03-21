import { useState } from "react";
import { useData } from "vike-react/useData";
import type { Data } from "./+data";
import { createCheckoutSession } from "../../../lib/stripe.js";

export default function ArtworkDetailPage() {
  const { artwork } = useData<Data>();
  const [loading, setLoading] = useState(false);

  const handlePurchase = async () => {
    setLoading(true);
    await createCheckoutSession(artwork);
  };

  return (
    <main style={{ minHeight: "100vh", paddingBottom: "4rem" }}>

      {/* Artwork image */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem 0" }}>
        <img
          src={artwork.imageUrl}
          alt={artwork.title}
          style={{
            width: "100%",
            aspectRatio: `${artwork.dimensions.width} / ${artwork.dimensions.height}`,
            objectFit: "cover",
            display: "block",
          }}
        />
      </div>

      {/* Content */}
      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1.5rem" }}>

        {/* "Museum of Jaxsen" label — #9d9180 = ~6.9:1 contrast */}
        <p style={{
          fontSize: "0.875rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#9d9180",
          marginBottom: "1.5rem",
        }}>
          Museum of Jaxsen
        </p>

        <h1 style={{
          fontSize: "clamp(1.5rem, 5vw, 2rem)",
          fontWeight: "normal",
          letterSpacing: "0.03em",
          color: "#e8e0d4",
          marginBottom: "0.5rem",
        }}>
          {artwork.title}
        </h1>

        {/* Artist / year — bumped to 1rem, color lifted to #9d9180 */}
        <p style={{
          fontSize: "1rem",
          color: "#9d9180",
          marginBottom: "1.5rem",
        }}>
          {artwork.artist} · {artwork.year}
        </p>

        <div style={{
          width: "40px",
          height: "1px",
          backgroundColor: "#4a4035",
          marginBottom: "1.5rem",
        }} />

        <p style={{
          fontSize: "1rem",
          lineHeight: 1.8,
          color: "#a09880",
          marginBottom: "2rem",
        }}>
          {artwork.description}
        </p>

        {/* Specs — labels lifted from 0.65rem/#4a4035 to 0.875rem/#9d9180 */}
        <div style={{ display: "flex", gap: "2.5rem", marginBottom: "2rem", flexWrap: "wrap" }}>
          <div>
            <p style={{
              fontSize: "0.875rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#9d9180",
              marginBottom: "0.3rem",
            }}>
              Medium
            </p>
            <p style={{ fontSize: "1rem", color: "#a09880" }}>{artwork.medium}</p>
          </div>
          <div>
            <p style={{
              fontSize: "0.875rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: "#9d9180",
              marginBottom: "0.3rem",
            }}>
              Dimensions
            </p>
            <p style={{ fontSize: "1rem", color: "#a09880" }}>
              {artwork.dimensions.width}&quot; × {artwork.dimensions.height}&quot;
            </p>
          </div>
        </div>

        <div style={{
          width: "40px",
          height: "1px",
          backgroundColor: "#4a4035",
          marginBottom: "2rem",
        }} />

        {artwork.available ? (
          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "2.5rem",
            gap: "1rem",
          }}>
            <p style={{ fontSize: "1.25rem", color: "#e8e0d4" }}>${artwork.price}</p>
            <button
              onClick={handlePurchase}
              disabled={loading}
              style={{
                background: "none",
                border: "1px solid #6a5c4a",
                color: "#c8b99a",
                fontSize: "0.875rem",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
                padding: "0.75rem 1.75rem",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              {loading ? "Redirecting…" : "Purchase"}
            </button>
          </div>
        ) : (
          /* "Sold" — lifted from 0.72rem/#4a4035 to 0.875rem/#9d9180 */
          <p style={{
            fontSize: "0.875rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            color: "#9d9180",
            marginBottom: "2.5rem",
          }}>
            Sold
          </p>
        )}

        {/* Back link — bumped from 0.75rem to 0.875rem */}
        <a
          href="/"
          style={{
            fontSize: "0.875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c8b99a",
            textDecoration: "none",
            borderBottom: "1px solid #6a5c4a",
            paddingBottom: "2px",
          }}
        >
          Return to the Gallery
        </a>

      </div>
    </main>
  );
}
