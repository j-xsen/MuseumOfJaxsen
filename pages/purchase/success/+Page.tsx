import { useEffect } from "react";
import { track } from "../../../lib/analytics";

export default function Page() {
  useEffect(() => {
    track("purchase_complete");
  }, []);
  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 2rem",
    }}>
      <div style={{
        maxWidth: "540px",
        width: "100%",
        textAlign: "center",
      }}>
        <p style={{
          fontSize: "0.875rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#9d9180",
          marginBottom: "2rem",
        }}>
          Museum of Jaxsen
        </p>

        <h1 style={{
          fontSize: "1.75rem",
          fontWeight: "normal",
          letterSpacing: "0.03em",
          marginBottom: "1.5rem",
          color: "#e8e0d4",
        }}>
          Your purchase is confirmed.
        </h1>

        <div style={{
          width: "40px",
          height: "1px",
          backgroundColor: "#4a4035",
          margin: "0 auto 2rem",
        }} />

        <p style={{
          fontSize: "1rem",
          lineHeight: 1.8,
          color: "#a09880",
          marginBottom: "1rem",
        }}>
          A receipt has been sent to your email address.
        </p>

        <p style={{
          fontSize: "1rem",
          lineHeight: 1.8,
          color: "#a09880",
          marginBottom: "3rem",
        }}>
          Tracking information will be provided once the artwork has shipped.
        </p>

        <a
          href="/"
          style={{
            fontSize: "0.875rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            color: "#c8b99a",
            textDecoration: "none",
            borderBottom: "1px solid #4a4035",
            paddingBottom: "2px",
          }}
        >
          Return to the Gallery
        </a>
      </div>
    </main>
  );
}
