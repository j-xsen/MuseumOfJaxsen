# Contentful Setup Guide

## 1. Create Contentful Content Type

In your Contentful space, create a content type called **"Artwork"** with the following fields:

| Field Name | Field ID | Type | Required | Unique |
|------------|----------|------|----------|--------|
| Title | `title` | Short text | Yes | No |
| Slug | `slug` | Short text | Yes | Yes |
| Artist | `artist` | Short text | Yes | No |
| Year | `year` | Integer | Yes | No |
| Description | `description` | Long text | Yes | No |
| Image | `image` | Media (single image) | Yes | No |
| Price | `price` | Number (decimal) | Yes | No |
| Dimensions Width | `dimensionsWidth` | Number (decimal) | Yes | No |
| Dimensions Height | `dimensionsHeight` | Number (decimal) | Yes | No |
| Medium | `medium` | Short text | Yes | No |
| Available | `available` | Boolean | Yes | No |
| Stripe Product ID | `stripeProductId` | Short text | No | No |
| Stripe Price ID | `stripePriceId` | Short text | No | No |

## 2. Environment Variables

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

### Contentful
- `CONTENTFUL_SPACE_ID`: Your Contentful Space ID
- `CONTENTFUL_ACCESS_TOKEN`: Content Delivery API access token

### Stripe
- `STRIPE_SECRET_KEY`: Your Stripe secret key (sk_test_... or sk_live_...)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`: Your Stripe publishable key
- `NEXT_PUBLIC_APP_URL`: Your app URL (e.g., https://yourmuseum.com)

## 3. Stripe Setup (Optional)

If you want to use Stripe Products/Prices instead of on-the-fly pricing:

1. Create a Product in Stripe for each artwork
2. Create a Price for each Product
3. Add the `stripeProductId` and `stripePriceId` to your Contentful entries

If you don't add these IDs, the checkout will create prices dynamically.

## 4. Image Requirements

For best 3D rendering results:
- Upload high-quality images (at least 1500px on longest side)
- Use proper aspect ratios matching actual artwork dimensions
- Supported formats: JPG, PNG, WebP

## 5. Deploy to Vercel

The `/api/create-checkout.ts` serverless function will automatically work on Vercel.

Add your environment variables in Vercel dashboard under:
**Settings → Environment Variables**
