import { fetchArtworks } from "../../../lib/artworks";

// Generate static routes for all artworks (for prerendering)
export async function onBeforePrerenderStart() {
  const artworks = await fetchArtworks();
  return artworks.map((artwork) => `/artwork/${artwork.slug}`);
}
