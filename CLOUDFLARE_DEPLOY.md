# Cloudflare Deployment (DNS + CDN for Railway)

This guide covers using Cloudflare for DNS and CDN while Railway runs the Node + Vite app.

## Prerequisites

- A Railway deployment running and healthy
- A domain managed in Cloudflare

## 1) Add the custom domain in Railway

1. Open your Railway project.
2. Go to **Settings → Domains**.
3. Add your domain (e.g., `app.yourdomain.com`).
4. Copy the DNS target Railway provides (typically a CNAME target).

## 2) Configure Cloudflare DNS

In Cloudflare **DNS** for your domain:

- **Type:** CNAME
- **Name:** `app` (or your chosen subdomain)
- **Target:** the Railway CNAME target
- **Proxy status:** **Proxied** (orange cloud)

If Railway gives an A record instead, use that A record in Cloudflare instead of CNAME.

## 3) SSL/TLS settings

In Cloudflare **SSL/TLS** settings:

- Set **Encryption mode** to **Full** (or **Full (strict)** if you have a valid origin cert).
- Enable **Always Use HTTPS**.

## 4) Verify the deployment

Once DNS propagates:

- Visit `https://app.yourdomain.com/health` and confirm it returns `{"status":"ok"}`.
- Visit `https://app.yourdomain.com/` and confirm the frontend loads.

## Optional: Cache static assets

For better performance, you can add a Cloudflare Cache Rule to cache `/_assets/*` or `/assets/*` if your build outputs hashed files. Avoid caching API routes (`/api/*`).

## Troubleshooting

- **502/525 errors:** Verify SSL mode is **Full** and the Railway service is running.
- **DNS not resolving:** Confirm the CNAME/A record matches Railway and wait for propagation.
- **Stale assets:** Purge cache in Cloudflare after deploying new builds.
