// https://vike.dev/Head

const BASE_URL = "https://museum.jaxsenville.com";

export function Head() {
  const title = "Museum of Jaxsen";
  const description =
    "3D museum of artworks by Jaxsen Honeycutt and the opportunity to purchase physical prints of the artworks!";
  const image = `${BASE_URL}/android-chrome-512x512.png`;

  return (
    <>
      <title>{title}</title>
      <link rel="canonical" href={BASE_URL} />
      <meta name="description" content={description} />
      <meta name="author" content="Jaxsen Honeycutt" />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta property="og:url" content={BASE_URL} />
      <meta property="og:site_name" content={title} />
      <meta property="og:image" content={image} />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={image} />

      {/* JSON-LD */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: title,
          url: BASE_URL,
          description,
          author: { "@type": "Person", name: "Jaxsen Honeycutt" },
        })}
      </script>

      {/* Favicons */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="manifest" href="/site.webmanifest" />

      {/* Umami Analytics */}
      <script defer src="https://umami-psi-inky.vercel.app/script.js" data-website-id="57dfafa4-9794-4eef-b0c2-9cde909e712c"></script>
    </>
  );
}
