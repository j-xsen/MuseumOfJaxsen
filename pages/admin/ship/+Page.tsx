"use client";

import { useState } from "react";

const CARRIERS = ["USPS", "UPS", "FedEx", "DHL", "Other"];

export default function Page() {
  const [orderId, setOrderId] = useState("");
  const [carrier, setCarrier] = useState("USPS");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const apiBase = import.meta.env.DEV ? "http://localhost:3001" : "";
      const res = await fetch(`${apiBase}/api/ship-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, trackingNumber, carrier }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      } else {
        setStatus("success");
        setMessage("Shipping email sent successfully.");
        setOrderId("");
        setTrackingNumber("");
        setCarrier("USPS");
      }
    } catch {
      setStatus("error");
      setMessage("Failed to reach the server.");
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "3rem 2rem",
    }}>
      <div style={{ maxWidth: "480px", width: "100%" }}>

        <p style={labelStyle}>Museum of Jaxsen</p>

        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "normal",
          letterSpacing: "0.03em",
          color: "#e8e0d4",
          marginBottom: "0.75rem",
        }}>
          Mark as Shipped
        </h1>

        <div style={{ width: "40px", height: "1px", backgroundColor: "#2a2418", marginBottom: "2.5rem" }} />

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>

          <div>
            <label style={labelStyle}>Payment ID</label>
            <input
              type="text"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              placeholder="pi_... or cs_..."
              required
              style={inputStyle}
            />
            <p style={hintStyle}>Find this in Stripe Dashboard → Payments — copy the Payment ID (pi_...)</p>
          </div>

          <div>
            <label style={labelStyle}>Carrier</label>
            <select
              value={carrier}
              onChange={e => setCarrier(e.target.value)}
              style={inputStyle}
            >
              {CARRIERS.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={labelStyle}>Tracking Number</label>
            <input
              type="text"
              value={trackingNumber}
              onChange={e => setTrackingNumber(e.target.value)}
              placeholder="Enter tracking number"
              required
              style={inputStyle}
            />
          </div>

          {message && (
            <p style={{
              fontSize: "0.85rem",
              color: status === "success" ? "#8aab78" : "#b87070",
              margin: 0,
            }}>
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={status === "loading"}
            style={{
              padding: "0.75rem 1.5rem",
              backgroundColor: "transparent",
              border: "1px solid #4a4035",
              color: status === "loading" ? "#6a6050" : "#c8b99a",
              fontFamily: "Georgia, 'Times New Roman', serif",
              fontSize: "0.8rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              cursor: status === "loading" ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {status === "loading" ? "Sending…" : "Send Shipping Email"}
          </button>

        </form>
      </div>
    </main>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.7rem",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  color: "#5a5040",
  marginBottom: "0.5rem",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.6rem 0.75rem",
  backgroundColor: "#111008",
  border: "1px solid #2a2418",
  color: "#e8e0d4",
  fontFamily: "Georgia, 'Times New Roman', serif",
  fontSize: "0.95rem",
  outline: "none",
  boxSizing: "border-box",
};

const hintStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "#4a4035",
  marginTop: "0.4rem",
  marginBottom: 0,
};
