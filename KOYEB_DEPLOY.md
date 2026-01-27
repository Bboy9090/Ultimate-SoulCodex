# Koyeb Deployment Guide

## Cost: **FREE** with generous limits - Great for 24/7 deployment!

Koyeb offers one of the most generous free tiers:
- **Free tier:** 1 web service + 1 database
- **Always on** - no spin-down
- **No credit card required**
- **Global edge network**
- **Automatic HTTPS**
- **GitHub auto-deploy**

## Free Tier Limits

- **2 GB RAM** (shared)
- **1 GB disk storage**
- **100 GB bandwidth/month**
- **No credit card required**
- **No time limits** (unlike free trials)

## Prerequisites

1. Sign up at [https://koyeb.com](https://koyeb.com)
2. Connect your GitHub account

## Deployment Steps

### Method 1: Deploy from GitHub (Recommended)

1. **Fork or Push Repository to GitHub**
   - Ensure your code is in a GitHub repository

2. **Create New App in Koyeb**
   - Go to [Koyeb Dashboard](https://app.koyeb.com/)
   - Click "Create App"
   - Select "GitHub" as source

3. **Configure Deployment**
   - Repository: Select your repository
   - Branch: `main` (or your primary branch)
   - Build method: Dockerfile
   - Build command: (leave empty, uses Dockerfile)
   - Run command: `npm start`

4. **Configure Service**
   - Name: `soulcodex-engine`
   - Instance type: Free (nano)
   - Region: Pick closest to your users (Washington DC, Frankfurt, Singapore)
   - Port: 3000

5. **Add Environment Variables**

   Click "Advanced" → "Environment variables":

   ```
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET=[generate with: openssl rand -hex 64]
   OPENAI_API_KEY=sk_your_key_here
   STRIPE_SECRET_KEY=sk_test_or_live
   STRIPE_WEBHOOK_SECRET=whsec_your_secret
   ADMIN_PASSWORD=your_secure_password
   ```

   Optional variables:
   ```
   SENDER_EMAIL=noreply@yourdomain.com
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_USER=your-email@gmail.com
   MAIL_PASS=your_app_password
   STRIPE_PRICE_WEEKLY=price_xxx
   STRIPE_PRICE_MONTHLY=price_xxx
   STRIPE_PRICE_YEARLY=price_xxx
   VAPID_PUBLIC_KEY=your_key
   VAPID_PRIVATE_KEY=your_key
   VAPID_SUBJECT=mailto:support@yourdomain.com
   ```

6. **Add Database**

   For free PostgreSQL database:
   
   **Option A: Use Neon (Recommended for Free)**
   - Sign up at [neon.tech](https://neon.tech)
   - Create a free database (3GB storage)
   - Copy connection string
   - Add to Koyeb: `DATABASE_URL=postgresql://...`

   **Option B: Use Supabase (Free)**
   - Sign up at [supabase.com](https://supabase.com)
   - Create project (500MB storage free)
   - Get connection string from Settings → Database
   - Add to Koyeb: `DATABASE_URL=postgresql://...`

7. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes for build and deployment
   - Your app will be at: `https://your-app-name.koyeb.app`

8. **Run Database Migrations**
   
   Use Koyeb CLI or run via SSH:
   ```bash
   # Install Koyeb CLI
   curl -fsSL https://cli.koyeb.com/install.sh | sh
   
   # Login
   koyeb login
   
   # Run migrations
   koyeb exec soulcodex-engine -- npm run db:push
   ```

### Method 2: Deploy with Docker Image

If you prefer to build locally:

```bash
# Build and push to Docker Hub
docker build -t yourusername/soulcodex-engine .
docker push yourusername/soulcodex-engine

# Then in Koyeb dashboard:
# - Choose "Docker" as source
# - Image: yourusername/soulcodex-engine
# - Configure as above
```

## Post-Deployment

### Set Up Stripe Webhook

Update Stripe webhook URL to:
```
https://your-app-name.koyeb.app/api/stripe/webhook
```

### Custom Domain

1. Go to your app in Koyeb dashboard
2. Click "Domains"
3. Add custom domain
4. Update DNS records:
   ```
   CNAME: your-domain.com → your-app.koyeb.app
   ```
5. SSL will be automatically provisioned

### Health Checks

Koyeb automatically checks your `/health` endpoint every 30 seconds.

## Monitoring

### View Logs
```bash
# Install CLI
curl -fsSL https://cli.koyeb.com/install.sh | sh

# View logs
koyeb logs soulcodex-engine --follow
```

### Dashboard Metrics
- CPU usage
- Memory usage
- Request rate
- Response time
- Bandwidth

## Scaling (Paid Plans)

If you outgrow free tier:

| Plan | Price | RAM | CPU | Disk |
|------|-------|-----|-----|------|
| Free | $0 | 2GB | Shared | 1GB |
| Nano | $5.50/mo | 2GB | 1 vCPU | 10GB |
| Small | $11/mo | 4GB | 2 vCPU | 20GB |

## Database Options Comparison

### Neon (Best for Free Tier)
- ✅ **Free:** 3GB storage, always on
- ✅ **No credit card required**
- ✅ **Serverless** - scales to zero when not in use
- ✅ **Fast** - optimized for edge
- 🔗 [neon.tech](https://neon.tech)

### Supabase (Alternative Free)
- ✅ **Free:** 500MB storage
- ✅ **Includes auth, storage, realtime**
- ⚠️ **2 projects max** on free tier
- 🔗 [supabase.com](https://supabase.com)

### ElephantSQL (Alternative Free)
- ✅ **Free:** 20MB storage (very limited)
- ✅ **Reliable**
- ⚠️ **Small storage** - not suitable for production
- 🔗 [elephantsql.com](https://elephantsql.com)

## Continuous Deployment

Koyeb automatically deploys when you push to your GitHub branch. No additional setup needed!

## Troubleshooting

### Check Deployment Status
```bash
koyeb status soulcodex-engine
```

### View Logs
```bash
koyeb logs soulcodex-engine --follow
```

### Restart Service
```bash
koyeb restart soulcodex-engine
```

### Common Issues

**Build fails:**
- Check Dockerfile is correct
- Verify package.json has all dependencies
- Check build logs in dashboard

**App crashes on start:**
- Verify environment variables are set
- Check DATABASE_URL is correct
- Review application logs

**Can't connect to database:**
- Verify DATABASE_URL format
- Check firewall rules (Neon/Supabase)
- Ensure database is not paused

## Security Best Practices

1. **Use secrets for sensitive data** - Never commit to repo
2. **Enable 2FA** on Koyeb account
3. **Rotate secrets regularly**
4. **Monitor logs** for suspicious activity
5. **Keep dependencies updated**: `npm audit`

## Backup Strategy

### Database Backups (Neon)
- Automatic daily backups included
- Point-in-time recovery available
- Manual backups via pg_dump

### Code Backups
- Code is in GitHub (already backed up)
- Docker images stored in registry

## Cost Comparison

| Platform | Monthly Cost | Always On? | Database | CC Required? |
|----------|--------------|------------|----------|--------------|
| **Koyeb** | **$0** | ✅ Yes | Need external | ❌ No |
| **Fly.io** | **$0** | ✅ Yes | ✅ Included | ❌ No |
| **Render** | $0 | ❌ Spins down | 90 days only | ✅ Yes |
| **Railway** | $0 credit | ✅ Yes | Uses credit | ✅ Yes |

## Recommended Setup (100% Free)

1. **Hosting:** Koyeb (free tier)
2. **Database:** Neon (3GB free)
3. **Domain:** Cloudflare (free DNS + CDN)
4. **Email:** Gmail App Password (free)
5. **SSL:** Automatic (included)

**Total Cost: $0/month** 🎉

## Next Steps

1. ✅ Deploy to Koyeb
2. ✅ Set up Neon database
3. ✅ Run migrations
4. ✅ Test all features
5. Set up Stripe webhooks
6. Configure custom domain (optional)
7. Monitor resource usage

## Support & Resources

- **Koyeb Docs:** https://koyeb.com/docs
- **Community:** https://community.koyeb.com
- **Status:** https://status.koyeb.com
- **CLI Docs:** https://koyeb.com/docs/cli

---

**Excellent choice for free 24/7 deployment with generous limits! 🚀**
