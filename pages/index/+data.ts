import { fetchArtworks } from "../../lib/artworks";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data() {
  const artworks = await fetchArtworks();

  return {
    artworks,
  };
}
