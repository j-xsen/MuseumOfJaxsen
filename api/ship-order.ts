import type { VercelRequest, VercelResponse } from "@vercel/node";
import Stripe from "stripe";
import { Resend } from "resend";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-02-25.clover",
});

const resend = new Resend(process.env.RESEND_API_KEY!);

const TRACKING_URLS: Record<string, string> = {
  USPS: "https://tools.usps.com/go/TrackConfirmAction?tLabels=",
  UPS: "https://www.ups.com/track?tracknum=",
  FedEx: "https://www.fedex.com/apps/fedextrack/?tracknumbers=",
  DHL: "https://www.dhl.com/en/express/tracking.html?AWB=",
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { orderId, trackingNumber, carrier } = req.body;

  if (!orderId || !trackingNumber || !carrier) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    let session: Stripe.Checkout.Session;

    if (orderId.startsWith("pi_")) {
      // Payment Intent ID — look up the associated checkout session
      const sessions = await stripe.checkout.sessions.list({
        payment_intent: orderId,
        limit: 1,
        expand: ["data.line_items"],
      });
      if (!sessions.data.length) {
        return res.status(404).json({ error: "No checkout session found for this payment" });
      }
      session = sessions.data[0];
    } else {
      // Checkout Session ID
      session = await stripe.checkout.sessions.retrieve(orderId, {
        expand: ["line_items"],
      });
    }

    const customerEmail = session.customer_details?.email;
    const customerName = session.customer_details?.name;

    if (!customerEmail) {
      return res.status(400).json({ error: "No customer email found for this session" });
    }

    const artworkTitle =
      session.line_items?.data[0]?.description ||
      "your artwork";

    const trackingUrl = TRACKING_URLS[carrier]
      ? `${TRACKING_URLS[carrier]}${encodeURIComponent(trackingNumber)}`
      : null;

    const fromEmail = process.env.RESEND_FROM_EMAIL!;

    await resend.emails.send({
      from: `Museum of Jaxsen <${fromEmail}>`,
      to: customerEmail,
      subject: "Your artwork has shipped",
      html: shippingEmailHtml({
        customerName,
        artworkTitle,
        carrier,
        trackingNumber,
        trackingUrl,
      }),
    });

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error("Ship order error:", error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : "Internal server error",
    });
  }
}

function shippingEmailHtml({
  customerName,
  artworkTitle,
  carrier,
  trackingNumber,
  trackingUrl,
}: {
  customerName: string | null | undefined;
  artworkTitle: string;
  carrier: string;
  trackingNumber: string;
  trackingUrl: string | null;
}) {
  const greeting = customerName ? `Dear ${customerName},` : "Dear Collector,";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background-color:#0d0d0d;font-family:Georgia,'Times New Roman',serif;color:#e8e0d4;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0d0d0d;padding:48px 24px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <tr>
            <td style="padding-bottom:32px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:#5a5040;">
                Museum of Jaxsen
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:24px;">
              <h1 style="margin:0;font-size:24px;font-weight:normal;letter-spacing:0.03em;color:#e8e0d4;">
                Your artwork has shipped.
              </h1>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:32px;">
              <div style="width:40px;height:1px;background-color:#2a2418;"></div>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:24px;">
              <p style="margin:0;font-size:15px;line-height:1.8;color:#a09880;">
                ${greeting}
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:32px;">
              <p style="margin:0;font-size:15px;line-height:1.8;color:#a09880;">
                <em>${artworkTitle}</em> is on its way to you. Below are your tracking details.
              </p>
            </td>
          </tr>

          <tr>
            <td style="padding-bottom:32px;">
              <table width="100%" cellpadding="0" cellspacing="0"
                style="background-color:#111008;border:1px solid #2a2418;padding:24px;">
                <tr>
                  <td style="padding-bottom:12px;">
                    <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5a5040;">
                      Carrier
                    </p>
                    <p style="margin:4px 0 0;font-size:15px;color:#e8e0d4;">${carrier}</p>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#5a5040;">
                      Tracking Number
                    </p>
                    <p style="margin:4px 0 0;font-size:15px;color:#e8e0d4;font-family:monospace;">
                      ${trackingNumber}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          ${trackingUrl ? `
          <tr>
            <td style="padding-bottom:40px;text-align:center;">
              <a href="${trackingUrl}"
                style="display:inline-block;font-size:12px;letter-spacing:0.15em;text-transform:uppercase;
                       color:#c8b99a;text-decoration:none;border-bottom:1px solid #4a4035;padding-bottom:3px;">
                Track Your Package
              </a>
            </td>
          </tr>
          ` : ""}

          <tr>
            <td style="padding-bottom:48px;">
              <p style="margin:0;font-size:14px;line-height:1.8;color:#6a6050;">
                Thank you for your support. It means a great deal that this work will find a home with you.
              </p>
            </td>
          </tr>

          <tr>
            <td style="border-top:1px solid #1a1810;padding-top:24px;text-align:center;">
              <p style="margin:0;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#3a3428;">
                Museum of Jaxsen &mdash; Original Works by Jaxsen Honeycutt
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
