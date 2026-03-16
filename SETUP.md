# Museum of Jaxsen - Setup Guide

## Current Contentful Schema

Your existing "Art" content type has these fields:
- ✅ `title` - Text
- ✅ `date` - Date
- ✅ `media` - Text (medium)
- ✅ `lowRez` - Asset (image for 3D gallery)
- ✅ `hiRez` - Asset (optional high-res image)
- ✅ `ratio` - Number (width/height ratio)

## Optional E-Commerce Fields to Add

To enable full e-commerce functionality, add these optional fields to your "Art" content type in Contentful:

### 1. **slug** (Short text, unique)
- For SEO-friendly URLs
- If not provided, auto-generated from title

### 2. **description** (Long text)
- Detailed artwork description
- If not provided, auto-generated from title + media

### 3. **price** (Number - Decimal)
- Price in USD
- Default: $500 if not provided

### 4. **available** (Boolean)
- Whether artwork is available for purchase
- Default: true

### 5. **stripeProductId** (Short text, optional)
- Stripe Product ID (if using pre-created products)

### 6. **stripePriceId** (Short text, optional)
- Stripe Price ID (if using pre-created prices)

## How to Add Fields in Contentful

1. Go to **Content model** in Contentful
2. Click on your **"Art"** content type
3. Click **Add field** for each new field
4. Configure as shown above
5. Save and publish

## Environment Variables

Create a `.env` file:

```bash
# Contentful
CONTENTFUL_SPACE_ID=sjvnthjshuvn
CONTENTFUL_ACCESS_TOKEN=your_delivery_api_token

# Stripe
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Getting Your Contentful Access Token

1. Go to **Settings → API keys** in Contentful
2. Create a new key or use existing "Content delivery / preview tokens"
3. Copy the **Content Delivery API - access token**

## Current Data Flow

With your existing schema, the app will:

1. **Fetch artworks** from Contentful "art" content type
2. **Use low-rez image** for 3D gallery display
3. **Calculate dimensions** from ratio field (normalized to 36" height)
4. **Auto-generate slug** from title if not provided
5. **Default values** for missing e-commerce fields:
   - Artist: "Jaxsen Honeycutt"
   - Price: $500
   - Available: true
   - Description: auto-generated

## Testing Without Adding Fields

The app will work immediately with your current schema! Just add your Contentful credentials to `.env`:

```bash
CONTENTFUL_SPACE_ID=sjvnthjshuvn
CONTENTFUL_ACCESS_TOKEN=your_token_here
```

Then run:
```bash
pnpm dev
```

## Adding E-Commerce Fields Later

You can add the optional fields (slug, description, price, available, stripe IDs) to specific artworks as you need them. The app gracefully handles missing fields with defaults.

## Stripe Setup (When Ready)

1. Create Stripe account
2. Get API keys from Stripe Dashboard
3. Add to `.env`
4. Purchase buttons will automatically redirect to Stripe Checkout

That's it! Your existing Contentful data will work out of the box. 🎨
