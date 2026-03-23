import type { PageContextServer } from "vike/types";
import Stripe from "stripe";

export type Data = Awaited<ReturnType<typeof data>>;

export async function data(pageContext: PageContextServer) {
  const sessionId = pageContext.urlParsed.search?.session_id;

  if (!sessionId || !process.env.STRIPE_SECRET_KEY) {
    return { revenue: null, artworkTitle: null };
  }

  try {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
    });
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return {
      revenue: session.amount_total ? session.amount_total / 100 : null,
      artworkTitle: session.metadata?.artworkTitle ?? null,
    };
  } catch {
    return { revenue: null, artworkTitle: null };
  }
}
