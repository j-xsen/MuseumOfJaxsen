// Re-export types and functions from contentful module
export type { Artwork } from "./contentful";
export {
  fetchArtworks,
  fetchArtworkBySlug as getArtworkBySlug,
  fetchArtworkById as getArtworkById,
} from "./contentful";

// Keep static data as fallback for development
import type { Artwork } from "./contentful";

export const FALLBACK_ARTWORKS: Artwork[] = [
  {
    id: "1",
    slug: "sunset-dreams",
    title: "Sunset Dreams",
    artist: "Jaxsen Honeycutt",
    year: 2024,
    description: "A vibrant exploration of color and light, capturing the ephemeral beauty of twilight.",
    imageUrl: "/artworks/sunset-dreams.jpg",
    imageUrlFullRes: "/artworks/sunset-dreams.jpg",
    price: 500,
    dimensions: { width: 24, height: 36 },
    medium: "Oil on Canvas",
    available: true,
  },
  {
    id: "2",
    slug: "urban-reflections",
    title: "Urban Reflections",
    artist: "Jaxsen Honeycutt",
    year: 2024,
    description: "An abstract interpretation of city life, where glass and steel meet organic forms.",
    imageUrl: "/artworks/urban-reflections.jpg",
    imageUrlFullRes: "/artworks/urban-reflections.jpg",
    price: 750,
    dimensions: { width: 30, height: 40 },
    medium: "Acrylic on Canvas",
    available: true,
  },
  {
    id: "3",
    slug: "whispers-of-nature",
    title: "Whispers of Nature",
    artist: "Jaxsen Honeycutt",
    year: 2023,
    description: "A serene landscape that invites contemplation and connection with the natural world.",
    imageUrl: "/artworks/whispers-of-nature.jpg",
    imageUrlFullRes: "/artworks/whispers-of-nature.jpg",
    price: 600,
    dimensions: { width: 28, height: 42 },
    medium: "Watercolor on Paper",
    available: true,
  },
];
