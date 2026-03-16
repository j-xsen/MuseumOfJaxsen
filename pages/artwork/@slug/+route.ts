import type { RouteSync } from "vike/types";

// Only match valid artwork slugs (no file extensions or special patterns)
export const route: RouteSync = (pageContext) => {
  const url = pageContext.urlPathname;

  // Extract slug from /artwork/:slug pattern
  const match = url.match(/^\/artwork\/([^/]+)$/);

  if (!match) {
    return false;
  }

  const slug = match[1];

  // Reject URLs with file extensions or invalid patterns
  if (
    slug.includes(".") || // Has file extension
    slug.startsWith("_") || // Private/system files
    slug === "api" ||
    slug === "assets"
  ) {
    return false;
  }

  return {
    routeParams: { slug },
  };
};
