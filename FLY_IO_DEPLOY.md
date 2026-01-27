# Fly.io Deployment Guide

## Cost: **FREE** for up to 3 VMs (256MB each) - Perfect for 24/7 deployment!

Fly.io is one of the best options for cheap 24/7 deployment with:
- **Free tier:** 3 shared-cpu VMs with 256MB RAM each
- **Free Postgres:** 3GB storage (shared-cpu)
- **No credit card required** for free tier
- **No spin-down** - truly 24/7
- **Global edge network** for fast performance

## Prerequisites

1. Install Fly CLI:
   ```bash
   # macOS/Linux
   curl -L https://fly.io/install.sh | sh
   
   # Windows (PowerShell)
   iwr https://fly.io/install.ps1 -useb | iex
   ```

2. Sign up and authenticate:
   ```bash
   fly auth signup
   # or if you have account
   fly auth login
   ```

## Deployment Steps

### 1. Initialize Fly App

```bash
cd /path/to/Ultimate-SoulCodex-Engine-of-the-Eternal-Now
fly launch --no-deploy
```

This will:
- Create a `fly.toml` (already provided in repo)
- Ask you to choose an app name
- Select a region (choose closest to your users)
- DON'T deploy yet (we need to set up database first)

### 2. Create PostgreSQL Database

```bash
# Create a Postgres cluster (FREE tier: 1GB storage, 256MB RAM)
fly postgres create --name soulcodex-db --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3

# Attach database to your app (this sets DATABASE_URL automatically)
fly postgres attach soulcodex-db --app soulcodex-engine
```

### 3. Set Environment Variables

```bash
# Required secrets
fly secrets set \
  SESSION_SECRET=$(openssl rand -hex 64) \
  OPENAI_API_KEY=sk_your_key_here \
  STRIPE_SECRET_KEY=sk_test_or_live_key \
  STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret \
  ADMIN_PASSWORD=your_secure_admin_password

# Optional: Email configuration
fly secrets set \
  SENDER_EMAIL=noreply@yourdomain.com \
  MAIL_HOST=smtp.gmail.com \
  MAIL_PORT=587 \
  MAIL_USER=your-email@gmail.com \
  MAIL_PASS=your_app_password

# Optional: Stripe price IDs
fly secrets set \
  STRIPE_PRICE_WEEKLY=price_xxx \
  STRIPE_PRICE_MONTHLY=price_xxx \
  STRIPE_PRICE_YEARLY=price_xxx

# Optional: Push notifications (VAPID keys)
fly secrets set \
  VAPID_PUBLIC_KEY=your_public_key \
  VAPID_PRIVATE_KEY=your_private_key \
  VAPID_SUBJECT=mailto:support@yourdomain.com
```

### 4. Deploy

```bash
fly deploy
```

This will:
- Build your Docker image
- Push to Fly.io registry
- Deploy to your VM
- Run health checks
- Show you the URL (e.g., https://soulcodex-engine.fly.dev)

### 5. Run Database Migrations

```bash
# SSH into your app and run migrations
fly ssh console -C "npm run db:push"
```

### 6. Check Status

```bash
# View app status
fly status

# View logs (real-time)
fly logs

# View app info
fly info
```

## Accessing Your App

Your app will be available at: `https://your-app-name.fly.dev`

## Post-Deployment

### Set Up Stripe Webhook

Update your Stripe webhook URL to:
```
https://your-app-name.fly.dev/api/stripe/webhook
```

### Custom Domain (Optional)

```bash
# Add custom domain
fly certs add yourdomain.com

# Follow DNS instructions shown
# Add A record: @ -> [Fly IP address]
# Add AAAA record: @ -> [Fly IPv6 address]
```

## Monitoring & Scaling

### View Metrics
```bash
fly dashboard
```

### Scale Resources (if needed)
```bash
# Scale memory (still free tier if total ≤ 256MB * 3 VMs)
fly scale memory 512  # Requires paid plan

# Scale to multiple regions for redundancy
fly scale count 2 --region iad,lhr
```

### View Database Metrics
```bash
fly postgres status --app soulcodex-db
```

## Cost Breakdown

### Free Tier (What You Get)
- ✅ **3 shared-cpu VMs** with 256MB RAM each
- ✅ **3GB Postgres database** storage
- ✅ **160GB bandwidth** per month
- ✅ **No credit card required**
- ✅ **No spin-down** - truly 24/7

### If You Need More (Paid)
- **Dedicated CPU VM:** ~$8-30/month
- **More storage:** ~$0.15/GB/month
- **More bandwidth:** ~$0.02/GB
- **Additional databases:** Free if within limits

## Troubleshooting

### Check Deployment Status
```bash
fly status --app soulcodex-engine
```

### View Real-Time Logs
```bash
fly logs -a soulcodex-engine
```

### SSH Into Container
```bash
fly ssh console
```

### Restart App
```bash
fly apps restart soulcodex-engine
```

### Database Connection Issues
```bash
# Check database status
fly postgres status --app soulcodex-db

# Connect to database
fly postgres connect --app soulcodex-db
```

## Continuous Deployment

### Auto-Deploy from GitHub

1. Get a Fly API token:
   ```bash
   fly auth token
   ```

2. Add to GitHub Secrets:
   - Go to your repo → Settings → Secrets → Actions
   - Add secret: `FLY_API_TOKEN` = [your token]

3. Create `.github/workflows/fly-deploy.yml`:
   ```yaml
   name: Deploy to Fly.io
   on:
     push:
       branches: [main]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: superfly/flyctl-actions/setup-flyctl@master
         - run: flyctl deploy --remote-only
           env:
             FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
   ```

## Health Check Endpoint

Fly.io checks `/health` every 30 seconds. Make sure your app responds with 200 OK.

## Backup Strategy

### Database Backups
```bash
# Manual backup
fly postgres backup create --app soulcodex-db

# List backups
fly postgres backup list --app soulcodex-db

# Restore from backup
fly postgres backup restore [backup-id] --app soulcodex-db
```

## Security Best Practices

1. **Never commit secrets** to repository
2. Use `fly secrets` for all sensitive data
3. Enable 2FA on Fly.io account
4. Regularly update dependencies: `npm audit`
5. Monitor logs for suspicious activity

## Limits & Quotas (Free Tier)

- **Total VM hours:** 2,340 hours/month (enough for 3 VMs 24/7)
- **Shared CPU only** (no dedicated CPU)
- **256MB RAM per VM** (max 3 VMs)
- **3GB Postgres storage**
- **160GB bandwidth/month**

## Comparison with Other Platforms

| Feature | Fly.io | Render | Railway |
|---------|--------|--------|---------|
| **Free Tier** | ✅ True 24/7 | ⚠️ Spins down after 15min | ✅ $5 free credit |
| **VM Always On** | ✅ Yes | ❌ No (free) | ✅ Yes |
| **Free Database** | ✅ 3GB Postgres | ✅ 90 days only | ⚠️ Uses credit |
| **Credit Card** | ❌ Not required | ✅ Required | ✅ Required |
| **Deploy Time** | Fast (~2-3 min) | Medium (~3-5 min) | Fast (~2-3 min) |

## Next Steps

1. ✅ Deploy to Fly.io
2. Test all features work correctly
3. Set up Stripe webhooks
4. Configure custom domain (optional)
5. Set up GitHub Actions for auto-deploy
6. Monitor resource usage
7. Plan for scaling if needed

## Support & Resources

- **Fly.io Docs:** https://fly.io/docs/
- **Community Forum:** https://community.fly.io/
- **Status Page:** https://status.fly.io/
- **CLI Reference:** https://fly.io/docs/flyctl/

---

**Winner for cheapest 24/7 deployment! 🏆**
