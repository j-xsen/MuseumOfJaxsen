import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { artworkId, artworkTitle, price, imageUrl, stripePriceId } = req.body;

    if (!artworkId || !artworkTitle || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || req.headers.origin || "http://localhost:3000";

    const country = req.headers['x-vercel-ip-country'];
    const shippingRate = country === 'US'
      ? process.env.STRIPE_SHIPPING_RATE_US!
      : process.env.STRIPE_SHIPPING_RATE_INTL!;

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: stripePriceId
        ? [
            {
              price: stripePriceId,
              quantity: 1,
            },
          ]
        : [
            {
              price_data: {
                currency: "usd",
                product_data: {
                  name: `${artworkTitle} 8.5"x11" Print`,
                  images: imageUrl ? [imageUrl] : [],
                  description: `Art print on 8.5"×11" Glossy Photo Paper. Image fills the full sheet (may be cropped to fit). Ships via USPS.`,
                },
                unit_amount: Math.round(price * 100), // Convert to cents
              },
              quantity: 1,
            },
          ],
      success_url: `${origin}/purchase/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata: {
        artworkId,
      },
      shipping_address_collection: {
        allowed_countries: ["US", "CA", "GB", "AU"],
      },
      shipping_options: [{ shipping_rate: shippingRate }],
    });

    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error("Stripe checkout error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}
