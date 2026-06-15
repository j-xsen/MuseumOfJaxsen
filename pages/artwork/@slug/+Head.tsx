import { useData } from "vike-react/useData";
import type { Data } from "./+data";

const BASE_URL = "https://museum.jaxsenville.com";

export default function Head() {
  const { artwork } = useData<Data>();
  const url = `${BASE_URL}/artwork/${artwork.slug}`;

  const ogImage = `${artwork.imageUrl}?w=1200&h=630&fit=fill&f=center`;

  return (
    <>
      <title>{`${artwork.title} - Museum of Jaxsen`}</title>
      <link rel="canonical" href={url} />
      <meta name="description" content={artwork.description} />
      <meta name="author" content={artwork.artist} />

      {/* Open Graph */}
      <meta property="og:title" content={`${artwork.title} by ${artwork.artist}`} />
      <meta property="og:description" content={artwork.description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={`${artwork.title} by ${artwork.artist}`} />
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Museum of Jaxsen" />
      <meta property="og:locale" content="en_US" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={`${artwork.title} by ${artwork.artist}`} />
      <meta name="twitter:description" content={artwork.description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={`${artwork.title} by ${artwork.artist}`} />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "VisualArtwork",
          name: artwork.title,
          url,
          creator: {
            "@type": "Person",
            name: artwork.artist,
          },
          dateCreated: artwork.year.toString(),
          artMedium: artwork.medium,
          description: artwork.description,
          image: artwork.imageUrl,
          width: artwork.dimensions,
          offers: {
            "@type": "Offer",
            price: artwork.price,
            priceCurrency: "USD",
            availability: artwork.available
              ? "https://schema.org/InStock"
              : "https://schema.org/SoldOut",
          },
        })}
      </script>
    </>
  );
}
