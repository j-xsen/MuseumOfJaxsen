import {createClient, type Entry, type Asset, EntryFieldTypes} from "contentful";

// Contentful Content Type Interface (matches your "art" content type)
export interface ContentfulArtworkSkeleton {
  contentTypeId: "art";
  fields: {
    title: EntryFieldTypes.Text;
    date: EntryFieldTypes.Date; // Date string from Contentful
    media?: EntryFieldTypes.Text;
    lowRez: EntryFieldTypes.AssetLink;
    hiRez?: EntryFieldTypes.AssetLink;
    ratio: EntryFieldTypes.Number;
    // Optional fields for e-commerce (you'll need to add these to Contentful)
    slug?: EntryFieldTypes.Text;
    description?: EntryFieldTypes.Text;
    price?: EntryFieldTypes.Number;
    available?: EntryFieldTypes.Boolean;
    stripeProductId?: EntryFieldTypes.Text;
    stripePriceId?: EntryFieldTypes.Text;
  }
}

export interface Artwork {
  id: string;
  slug: string;
  title: string;
  artist: string;
  year: number;
  description: string;
  imageUrl: string;       // sized front-wall texture (w=1600)
  imageUrlHiRez?: string; // full-res back-wall texture (separate hiRez asset)
  imageUrlFullRes: string; // raw lowRez asset, no params — back-wall fallback when hiRez absent
  price: number;
  dimensions: {
    width: number;
    height: number;
  };
  medium: string;
  available: boolean;
  stripeProductId?: string;
  stripePriceId?: string;
}

// Initialize Contentful client
export const contentfulClient = createClient({
  space: process.env.CONTENTFUL_SPACE_ID || "",
  accessToken: process.env.CONTENTFUL_ACCESS_TOKEN || "",
});

// Transform Contentful entry to Artwork type
export function transformArtwork(entry: Entry<ContentfulArtworkSkeleton>): Artwork {
  const fields = entry.fields;

  // Parse year from date field
  const date = new Date(fields.date as string);
  const year = date.getFullYear();

  const title = fields.title as string;

  // Get image URLs
  const lowRezAsset = fields.lowRez as Asset;
  const hiRezAsset = fields.hiRez as Asset | undefined;
  // Cap front-wall textures via Contentful's Image API — without params the CDN
  // serves the original uploaded file at full resolution, which is expensive for
  // a small 3-D plane. 1600px covers retina at the largest rendered size.
  const rawImageUrl = lowRezAsset?.fields?.file?.url ? `https:${lowRezAsset.fields.file.url}` : "";
  const imageUrl = rawImageUrl ? `${rawImageUrl}?w=1600&q=85` : "";
  // Hi-rez keeps no params — it should load at full quality for the back-wall detail view.
  const imageUrlHiRez = hiRezAsset?.fields?.file?.url ? `https:${hiRezAsset.fields.file.url}` : undefined;

  // Calculate dimensions from ratio
  // Assuming ratio is width/height, normalize to reasonable size
  const ratio = fields.ratio;
  const baseHeight = 36; // inches
  const width = baseHeight * (ratio as number);
  const height = baseHeight;

  // Generate slug from title if not provided
  const slug = fields.slug as string || (title.toLowerCase().replace(/[^a-z0-9]+/g, "-"));

  return {
    id: entry.sys.id,
    slug,
    title: title,
    artist: "Jaxsen Honeycutt", // Default artist
    year,
    description: fields.description as string || `${fields.title} - Created ${year}. Medium: ${fields.media || "Mixed Media"}`,
    imageUrl,
    imageUrlHiRez,
    imageUrlFullRes: rawImageUrl,
    price: fields.price as number || 20, // Default price
    dimensions: {
      width: Math.round(width),
      height: Math.round(height),
    },
    medium: fields.media as string || "Mixed Media",
    available: fields.available !== undefined ? fields.available as boolean : true,
    stripeProductId: fields.stripeProductId as string,
    stripePriceId: fields.stripePriceId as string,
  };
}

// Fetch all artworks
export async function fetchArtworks(): Promise<Artwork[]> {
  const entries = await contentfulClient.getEntries<ContentfulArtworkSkeleton>({
    content_type: "art",
    order: ["-fields.date"],
  });

  return entries.items.map(transformArtwork);
}

// Fetch artwork by slug
export async function fetchArtworkBySlug(slug: string): Promise<Artwork | null> {
  // Fetch all artworks and find by slug (since slug might be generated)
  const allArtworks = await fetchArtworks();
  return allArtworks.find((artwork) => artwork.slug === slug) || null;
}

// Fetch artwork by ID
export async function fetchArtworkById(id: string): Promise<Artwork | null> {
  try {
    const entry = await contentfulClient.getEntry<ContentfulArtworkSkeleton>(id);
    return transformArtwork(entry);
  } catch (error) {
    return null;
  }
}
