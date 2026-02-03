# Migration Guide: Stripe → Lemon Squeezy

## 🎯 Why Migrate?

- ✅ **No business registration** - Just sign up and go
- ✅ **Automatic tax handling** - They're the Merchant of Record
- ✅ **Simpler compliance** - They handle everything
- ✅ **Built for SaaS** - Perfect for subscriptions

## 📦 Installation

```bash
npm install @lemonsqueezy/lemonsqueezy.js
```

## 🔑 Setup Steps

### 1. Sign Up at Lemon Squeezy
- Go to https://lemonsqueezy.com
- Create account (no business registration needed!)
- Get your API key from Settings → API

### 2. Create Products & Prices
- Create 3 products: Weekly, Monthly, Yearly
- Note the variant IDs (these replace Stripe price IDs)

### 3. Update Environment Variables

Replace in `.env`:
```env
# OLD (Stripe)
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_WEEKLY=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...

# NEW (Lemon Squeezy)
LEMONSQUEEZY_API_KEY=your_api_key_here
LEMONSQUEEZY_WEBHOOK_SECRET=your_webhook_secret_here
LEMONSQUEEZY_STORE_ID=your_store_id_here
LEMONSQUEEZY_VARIANT_WEEKLY=variant_id_here
LEMONSQUEEZY_VARIANT_MONTHLY=variant_id_here
LEMONSQUEEZY_VARIANT_YEARLY=variant_id_here
```

## 🔄 Code Changes Needed

### 1. Update `subscription-service.ts`
- Replace `Stripe` import with `@lemonsqueezy/lemonsqueezy.js`
- Update checkout session creation
- Update webhook handlers
- Update subscription status checks

### 2. Update `routes.ts`
- Replace Stripe webhook endpoint with Lemon Squeezy webhook
- Update webhook signature verification
- Update subscription endpoints

### 3. Update Frontend (if custom checkout)
- Replace Stripe checkout with Lemon Squeezy checkout
- Or use Lemon Squeezy's hosted checkout (easier!)

## 📚 Key API Differences

### Checkout Sessions
**Stripe:**
```typescript
const session = await stripe.checkout.sessions.create({...});
```

**Lemon Squeezy:**
```typescript
const checkout = await lemonSqueezy.checkouts.create({
  storeId: storeId,
  variantId: variantId,
  customPrice: price,
  // ...
});
```

### Webhooks
**Stripe:** Uses `stripe-signature` header
**Lemon Squeezy:** Uses HMAC signature in request body

### Subscription Status
**Stripe:** `active`, `past_due`, `canceled`, etc.
**Lemon Squeezy:** `active`, `past_due`, `cancelled`, `expired`, etc.

## 🚀 Quick Start (After Setup)

1. Install package: `npm install @lemonsqueezy/lemonsqueezy.js`
2. Update environment variables
3. I can help migrate the code files
4. Test with Lemon Squeezy's test mode
5. Go live!

## ⚠️ Important Notes

- **Webhook URL:** Update in Lemon Squeezy dashboard to point to your server
- **Test Mode:** Lemon Squeezy has test mode like Stripe
- **Customer IDs:** Lemon Squeezy uses different customer ID format
- **Subscription IDs:** Different format, but same concept

## 💰 Cost Comparison

**Stripe:** 2.9% + $0.30 per transaction (but you handle taxes)
**Lemon Squeezy:** 5% + $0.50 per transaction (they handle taxes)

**Net difference:** ~2.1% more, but you save:
- Time on tax compliance
- Business registration costs
- Accounting complexity
- Legal setup

**Worth it?** For most small SaaS projects, **YES!**

## 🆘 Need Help?

I can:
1. ✅ Migrate `subscription-service.ts` to Lemon Squeezy
2. ✅ Update `routes.ts` webhook handling
3. ✅ Update environment variable structure
4. ✅ Test the integration

Just say the word! 🚀
