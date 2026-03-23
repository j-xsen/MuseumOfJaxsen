import type { Artwork } from "./contentful";
import { track } from "./analytics";

export async function createCheckoutSession(artwork: Artwork) {
  track("checkout_initiated", { title: artwork.title, price: artwork.price });
  try {
    const apiBase = import.meta.env.DEV ? "http://localhost:3001" : "";
    const response = await fetch(`${apiBase}/api/create-checkout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        artworkId: artwork.id,
        artworkTitle: artwork.title,
        price: artwork.price,
        imageUrl: artwork.imageUrl,
        stripePriceId: artwork.stripePriceId,
      }),
    });

    if (!response.ok) {
      // throw new Error("Failed to create checkout session");
      console.error("Failed to create checkout session");
      alert("Unable to process checkout. Please try again.");
      return;
    }

    const { url } = await response.json();

    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    console.error("Checkout error:", error);
    alert("Unable to process checkout. Please try again.");
  }
}
