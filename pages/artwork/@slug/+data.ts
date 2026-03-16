import type { PageContextServer } from "vike/types";
import { getArtworkBySlug } from "../../../lib/artworks";
import {render} from "vike/abort";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const { slug } = pageContext.routeParams;

  const artwork = await getArtworkBySlug(slug);

  if (!artwork) {
    // Return 404 instead of throwing error
    throw render(404, "Artwork not found");
  }

  return {
    artwork,
  };
}
