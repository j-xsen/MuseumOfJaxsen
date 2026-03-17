import type { Artwork } from "./contentful";

export async function createCheckoutSession(artwork: Artwork) {
  try {
    const response = await fetch("/api/create-checkout", {
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
