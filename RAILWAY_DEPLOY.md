# Railway Deployment Guide

**Primary deployment option for Soul Codex.** Pivot from Fly.io — Railway offers the simplest setup with integrated PostgreSQL.

## Cost: **$5 FREE CREDIT/month** - Good for small 24/7 apps

Railway offers a simple deployment experience:
- **$5 free credit** per month (no credit card for first month)
- **Always on** - no spin-down
- **Usage-based pricing** after free credit
- **One-click PostgreSQL**
- **GitHub auto-deploy**

## Free Credit Breakdown

With $5 free credit/month, you can run:
- **~500 hours** of small app runtime (sufficient for 24/7)
- **Small PostgreSQL database** (~1GB)
- **5GB bandwidth**

**Typical usage for Soul Codex:** ~$3-7/month depending on traffic

## Prerequisites

1. Sign up at [railway.app](https://railway.app)
2. Connect your GitHub account
3. Have credit card ready (required after first month)

## Deployment Steps

### 1. Deploy from GitHub

1. **Go to Railway Dashboard**
   - Visit [railway.app](https://railway.app)
   - Click "New Project"

2. **Deploy from GitHub Repo**
   - Click "Deploy from GitHub repo"
   - Authorize Railway to access your repos
   - Select: `ultimate-soulcodex/Ultimate-SoulCodex-Engine-of-the-Eternal-Now`

3. **Railway Uses Dockerfile**
   - Railway builds with the `Dockerfile` (builder: DOCKERFILE in railway.json)
   - No Nixpacks/Node version issues — Docker ensures Node 20 and correct build

### 2. Add PostgreSQL Database

1. In your project:
   - Click "New" → "Database" → "Add PostgreSQL"
   - Database will be created automatically
   - `DATABASE_URL` is automatically injected

### 3. Set Environment Variables

Click on your service → "Variables" tab:

**Required:**
```bash
NODE_ENV=production
SESSION_SECRET=[generate: openssl rand -hex 64]
OPENAI_API_KEY=sk_your_key_here
STRIPE_SECRET_KEY=sk_test_or_live
STRIPE_WEBHOOK_SECRET=whsec_your_secret
ADMIN_PASSWORD=your_secure_password
```

**Optional (Email):**
```bash
SENDER_EMAIL=noreply@yourdomain.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your_app_password
```

**Optional (Stripe Subscriptions):**
```bash
STRIPE_PRICE_WEEKLY=price_xxx
STRIPE_PRICE_MONTHLY=price_xxx
STRIPE_PRICE_YEARLY=price_xxx
```

**Optional (Push Notifications):**
```bash
VAPID_PUBLIC_KEY=your_key
VAPID_PRIVATE_KEY=your_key
VAPID_SUBJECT=mailto:support@yourdomain.com
```

### 4. Deploy & Run Migrations

1. **Deploy** - Railway automatically builds and deploys
2. **Run Migrations:**
   - Click on your service
   - Go to "Settings" → "Deploy"
   - Or use Railway CLI:
     ```bash
     # Install Railway CLI
     npm install -g @railway/cli
     
     # Login
     railway login
     
     # Link to project
     railway link
     
     # Run migrations
     railway run npm run db:push
     ```

### 5. Get Your URL

Your app will be at: `https://your-app.up.railway.app`

To add a custom domain:
- Go to "Settings" → "Domains"
- Click "Generate Domain" or "Custom Domain"

## Railway CLI Usage

### Install
```bash
npm install -g @railway/cli
```

### Login & Link
```bash
railway login
railway link
```

### Common Commands
```bash
# Deploy
railway up

# Run migrations
railway run npm run db:push

# View logs
railway logs

# SSH into container
railway shell

# Check status
railway status

# List all services
railway service
```

## Monitoring & Logs

### View Logs
```bash
# Via CLI
railway logs --follow

# Via Dashboard
# Click on service → "Logs" tab
```

### Metrics
Railway dashboard shows:
- CPU usage
- Memory usage
- Network I/O
- **Cost estimate** (very important!)

### Cost Monitoring

**Important:** Monitor your usage to avoid unexpected charges!

1. Dashboard shows **estimated monthly cost**
2. Set up **usage alerts** in settings
3. View **detailed usage** breakdown

## Pricing Details

### Free Tier
- **$5 free credit/month** (no credit card first month)
- After free credit: **pay per usage**

### Estimated Costs for Soul Codex

| Resource | Usage | Est. Cost/Month |
|----------|-------|-----------------|
| App (nano) | 730 hours | ~$3-5 |
| PostgreSQL | 1GB | ~$1-2 |
| Bandwidth | 5GB | ~$0.50 |
| **TOTAL** | | **~$4-7.50/month** |

### If You Need More

| Plan | Price | Includes |
|------|-------|----------|
| Developer | $5 credit | Pay per usage |
| Pro | $20/month | $10 credit + priority |
| Team | Custom | Enterprise features |

## Continuous Deployment

Railway automatically deploys when you push to your GitHub branch!

**To disable auto-deploy:**
- Go to service settings
- Toggle off "Auto Deploy"

## Custom Domain Setup

1. Click on service → "Settings" → "Domains"
2. Click "Custom Domain"
3. Enter your domain
4. Add CNAME record to your DNS:
   ```
   CNAME: yourdomain.com → your-app.up.railway.app
   ```
5. SSL certificate is automatically provisioned

## Webhooks Setup

### Stripe Webhook URL
```
https://your-app.up.railway.app/api/stripe/webhook
```

## Scaling

### Vertical Scaling (More Resources)
Railway automatically scales based on usage. You can set limits:
- Go to "Settings" → "Resources"
- Set memory and CPU limits

### Horizontal Scaling (More Instances)
- Available on Pro plan
- Can run multiple replicas
- Automatic load balancing

## Database Management

### Connect to PostgreSQL
```bash
# Via Railway CLI
railway connect postgres

# Or get connection string
railway variables
# Look for DATABASE_URL
```

### Backup Database
```bash
# Manual backup
railway run pg_dump $DATABASE_URL > backup.sql

# Restore
railway run psql $DATABASE_URL < backup.sql
```

### Database Limits
- **Free tier:** Limited by $5 credit (typically 1-2GB)
- **Usage-based:** $0.50/GB/month

## Troubleshooting

### Build Fails
- **Dockerfile build:** Railway uses `Dockerfile` (see railway.json). Build runs `npm ci` then `npm run build`.
- **Check build logs:** `railway logs --build` or Dashboard → Deployments → Build logs
- **If Docker ignored:** Ensure `railway.json` has `"builder": "DOCKERFILE"`. Filename must be exactly `Dockerfile` at repo root.

### App Crashes on Startup (VAPID / Push)
- **Leave VAPID keys empty** or add valid keys. Placeholder values like `your_public_key_here` will crash.
- Generate real keys: `npx web-push generate-vapid-keys`
- Or remove VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY from variables — app uses temp keys (subscriptions won't persist across restarts).

### Build Succeeds but App Won't Start
- **Required vars:** `NODE_ENV=production` (set in Dockerfile), `DATABASE_URL` (if using DB), `SESSION_SECRET`, `ADMIN_PASSWORD`
- **PORT:** Railway injects PORT — app listens on `process.env.PORT`. No config needed.

### App Crashes
```bash
# View runtime logs
railway logs

# Check variables
railway variables

# Restart
railway restart
```

### Database Issues
```bash
# Check database status
railway status

# Test connection
railway run node -e "import('pg').then(({ Pool }) => { const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()').then(r => console.log(r.rows)).finally(() => pool.end()); });"
```

### Cost Overruns
1. Check metrics dashboard
2. Set resource limits
3. Optimize app (reduce memory, CPU)
4. Consider cheaper alternatives if consistently over budget

## Environment Migration

### From Development to Production
```bash
# Export variables from one env
railway variables --environment production

# Import to another
# (manually set in dashboard)
```

## Security Best Practices

1. **Secrets Management**
   - Use Railway's environment variables (encrypted)
   - Never commit secrets to repo

2. **2FA**
   - Enable 2FA on Railway account

3. **Access Control**
   - Limit team member permissions
   - Use GitHub deploy keys

4. **Monitoring**
   - Enable log retention
   - Set up alerts for errors

## Cost Optimization Tips

1. **Optimize Memory Usage**
   - Node.js apps can be memory-intensive
   - Use `--max-old-space-size=512` flag to limit

2. **Reduce Bandwidth**
   - Enable compression
   - Use CDN for static assets (Cloudflare)

3. **Database Optimization**
   - Regular VACUUM
   - Index optimization
   - Clean up old data

4. **Sleep Unused Services**
   - If not needed 24/7, use Render instead (free with spin-down)

## Cloudflare DNS + CDN (Optional)

If you want Cloudflare in front of Railway for DNS or caching, follow
[CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md) after your Railway service is live.

## Comparison with Other Platforms

| Feature | Railway | Fly.io | Koyeb | Render |
|---------|---------|--------|-------|--------|
| **Free Tier** | $5 credit | ✅ True free | ✅ True free | ⚠️ Spins down |
| **Always On** | ✅ Yes | ✅ Yes | ✅ Yes | ❌ (free) |
| **Database** | ✅ Included | ✅ Free 3GB | Need external | 90 days |
| **CC Required** | 1st month no | ❌ No | ❌ No | ✅ Yes |
| **Est. Cost** | $4-7/mo | $0 | $0 | $0 (spins) |
| **Setup** | ⭐⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐ Medium | ⭐⭐⭐⭐ Easy | ⭐⭐⭐⭐⭐ Easy |

## When to Choose Railway

✅ **Choose Railway if:**
- You want the simplest setup
- You need integrated PostgreSQL
- $4-7/month is acceptable
- You value excellent DX

❌ **Consider alternatives if:**
- Budget is absolutely $0
- You don't need database
- You prefer more free tier options

## Next Steps

1. ✅ Deploy to Railway
2. ✅ Set up environment variables
3. ✅ Run database migrations
4. Test all features
5. Set up Stripe webhooks
6. Configure custom domain (optional)
7. Monitor usage and costs
8. Set up usage alerts

## Support & Resources

- **Railway Docs:** https://docs.railway.app
- **Discord Community:** https://discord.gg/railway
- **Status Page:** https://status.railway.app
- **Pricing Calculator:** https://railway.app/pricing

---

**Great choice if you value simplicity and are willing to pay ~$5/month! 🚂**
