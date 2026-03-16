import type { Config } from "vike/types";
import vikePhoton from "vike-photon/config";
import vikeReact from "vike-react/config";

// Default config (can be overridden by pages)
// https://vike.dev/config

export default {
  // https://vike.dev/head-tags
  title: "Museum of Jaxsen",

  description: "Museum of art by Jaxsen Honeycutt alongside the opportunity to purchase physical prints.",
  extends: [vikeReact, vikePhoton],
  prerender: true,
} satisfies Config;
