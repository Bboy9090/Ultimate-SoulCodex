# 🚀 Migration Guide: Replit → Cost-Effective Deployment

This guide will help you migrate your Ultimate Soul Codex application from Replit to a more cost-effective platform that won't shut you down for payment issues.

## 🎯 Quick Recommendation: Fly.io (FREE 24/7)

**Best option:** Fly.io offers completely FREE 24/7 hosting with:
- ✅ **$0/month** forever (no credit card required)
- ✅ True 24/7 (no spin-down like other free platforms)
- ✅ Includes 3GB PostgreSQL database
- ✅ 160GB bandwidth/month
- ✅ Global edge network
- ✅ Easy deployment with included configuration files

## 📋 Pre-Migration Checklist

Before you start, gather these credentials from your current Replit setup:

- [ ] **Database Data** - Export your PostgreSQL database if you want to keep existing data
- [ ] **Environment Variables** from Replit Secrets:
  - `OPENAI_API_KEY` or `GEMINI_API_KEY`
  - `STRIPE_SECRET_KEY`
  - `STRIPE_WEBHOOK_SECRET`
  - `STRIPE_PRICE_WEEKLY`, `STRIPE_PRICE_MONTHLY`, `STRIPE_PRICE_YEARLY`
  - `ADMIN_PASSWORD`
  - Any email configuration (SMTP credentials)
  - VAPID keys for push notifications

## 🚀 Option 1: Fly.io (FREE - RECOMMENDED)

### Why Fly.io?
- **Cost:** $0/month (completely free)
- **Reliability:** True 24/7, no sleep/spin-down
- **Database:** Free 3GB PostgreSQL included
- **Setup Time:** ~15-20 minutes
- **Credit Card:** Not required

### Migration Steps

#### 1. Install Fly CLI

**macOS/Linux:**
```bash
curl -L https://fly.io/install.sh | sh
```

**Windows (PowerShell):**
```powershell
iwr https://fly.io/install.ps1 -useb | iex
```

**Add to PATH** (if needed):
```bash
# Add to ~/.bashrc or ~/.zshrc
export PATH="$HOME/.fly/bin:$PATH"
```

#### 2. Sign Up & Authenticate

```bash
# Sign up (first time users)
fly auth signup

# Or login if you have account
fly auth login
```

#### 3. Initialize Your App

```bash
# Navigate to your repository
cd Ultimate-SoulCodex-Engine-of-the-Eternal-Now

# Launch app (using existing fly.toml)
fly launch --no-deploy

# Choose your app name (or accept suggested)
# Choose region (closest to your users, e.g., 'iad' for US East)
```

#### 4. Create PostgreSQL Database

```bash
# Create free PostgreSQL instance
fly postgres create --name soulcodex-db \
  --initial-cluster-size 1 \
  --vm-size shared-cpu-1x \
  --volume-size 3

# Attach database to your app (automatically sets DATABASE_URL)
fly postgres attach soulcodex-db
```

#### 5. Set Environment Variables

```bash
# Generate session secret
SESSION_SECRET=$(openssl rand -hex 64)

# Set all required secrets
fly secrets set \
  SESSION_SECRET="$SESSION_SECRET" \
  OPENAI_API_KEY="your_openai_key_here" \
  GEMINI_API_KEY="your_gemini_key_here" \
  STRIPE_SECRET_KEY="your_stripe_key" \
  STRIPE_WEBHOOK_SECRET="your_webhook_secret" \
  ADMIN_PASSWORD="your_secure_password"

# Optional: Stripe price IDs
fly secrets set \
  STRIPE_PRICE_WEEKLY="price_xxx" \
  STRIPE_PRICE_MONTHLY="price_xxx" \
  STRIPE_PRICE_YEARLY="price_xxx"

# Optional: Email configuration
fly secrets set \
  SENDER_EMAIL="noreply@yourdomain.com" \
  MAIL_HOST="smtp.gmail.com" \
  MAIL_PORT="587" \
  MAIL_USER="your-email@gmail.com" \
  MAIL_PASS="your_app_password"

# Optional: Push notifications
fly secrets set \
  VAPID_PUBLIC_KEY="your_public_key" \
  VAPID_PRIVATE_KEY="your_private_key" \
  VAPID_SUBJECT="mailto:support@yourdomain.com"
```

#### 6. Deploy Your Application

```bash
# Build and deploy
fly deploy

# Wait for deployment to complete (~2-5 minutes)
```

#### 7. Verify Deployment

```bash
# Check app status
fly status

# View logs
fly logs

# Open in browser
fly open
```

Your app will be available at: `https://your-app-name.fly.dev`

#### 8. Migrate Database Data (Optional)

If you want to keep your existing Replit data:

```bash
# From Replit, export your database
pg_dump $DATABASE_URL > replit_backup.sql

# Import to Fly.io
fly postgres connect -a soulcodex-db
# Then in psql:
\i replit_backup.sql
```

#### 9. Update Stripe Webhook URL

In your Stripe Dashboard:
1. Go to Developers → Webhooks
2. Update webhook endpoint to: `https://your-app-name.fly.dev/api/stripe/webhook`
3. Test the webhook

#### 10. Verify Everything Works

Test these features:
- [ ] User registration and login
- [ ] Profile generation
- [ ] AI chat functionality
- [ ] Stripe payments
- [ ] Push notifications
- [ ] Database persistence

### Ongoing Management

```bash
# View logs
fly logs --follow

# Check status
fly status

# View metrics
fly dashboard

# Update app (after git push)
fly deploy

# Scale if needed (requires paid plan)
fly scale memory 512  # More RAM if needed
```

---

## 🚂 Option 2: Railway (~$5/month)

### Why Railway?
- **Cost:** $5 free credit/month (~$4-7 actual usage)
- **Ease:** Easiest setup, one-click deploy
- **Database:** Integrated PostgreSQL
- **Setup Time:** ~10 minutes
- **Credit Card:** Not required for first month

### Migration Steps

#### 1. Deploy from GitHub

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project" → "Deploy from GitHub repo"
4. Select your repository
5. Railway auto-detects configuration (railway.json exists)

#### 2. Add PostgreSQL

1. Click "New" → "Database" → "Add PostgreSQL"
2. `DATABASE_URL` is automatically set

#### 3. Set Environment Variables

In Railway dashboard, click your service → "Variables":

```
NODE_ENV=production
SESSION_SECRET=[generate with: openssl rand -hex 64]
OPENAI_API_KEY=your_key
GEMINI_API_KEY=your_key
STRIPE_SECRET_KEY=your_key
STRIPE_WEBHOOK_SECRET=your_secret
ADMIN_PASSWORD=your_password
```

#### 4. Deploy

Railway automatically builds and deploys. Get your URL from the dashboard.

#### 5. Update Stripe Webhook

Update webhook URL to: `https://your-app.up.railway.app/api/stripe/webhook`

### Railway CLI (Optional)

```bash
# Install
npm install -g @railway/cli

# Login and link
railway login
railway link

# Deploy from CLI
railway up

# View logs
railway logs
```

**Full Railway Guide:** See [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)

---

## 💰 Option 3: Koyeb + Neon (FREE)

### Why Koyeb?
- **Cost:** $0/month (completely free)
- **Resources:** 2GB RAM (more than Fly.io)
- **Setup:** GUI-based, easy
- **Database:** Use free Neon database separately
- **Credit Card:** Not required

### Migration Steps

#### 1. Deploy to Koyeb

1. Go to [koyeb.com](https://koyeb.com)
2. Sign up (no credit card)
3. Create new service from GitHub
4. Select your repository
5. Koyeb auto-detects Node.js

#### 2. Create Neon Database

1. Go to [neon.tech](https://neon.tech)
2. Sign up (no credit card)
3. Create new project
4. Copy connection string

#### 3. Set Environment Variables in Koyeb

Add all environment variables including `DATABASE_URL` from Neon.

**Full Koyeb Guide:** See [KOYEB_DEPLOY.md](./KOYEB_DEPLOY.md)

---

## 🖥️ Option 4: Self-Hosted VPS (€4/month)

### Why VPS?
- **Cost:** €4-6/month (Hetzner, DigitalOcean)
- **Control:** Full server access
- **Resources:** 4GB RAM, 2 vCPU (much more than PaaS)
- **Learning:** Gain DevOps skills
- **Multiple Apps:** Can host multiple projects

### Providers

1. **Hetzner** - €4.15/month (Best value)
2. **DigitalOcean** - $6/month ($200 free credit for 60 days)
3. **Oracle Cloud** - $0/month (complex setup)

### Migration Steps

Use Docker Compose for easy deployment:

```bash
# Copy .env.example to .env and fill in values
cp .env.example .env
nano .env

# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

**Full VPS Guide:** See [VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md)

---

## 📊 Cost Comparison Summary

| Platform | Monthly Cost | Database | Always On? | Setup | Best For |
|----------|--------------|----------|------------|-------|----------|
| **Fly.io** | **$0** | ✅ 3GB Free | ✅ Yes | 15 min | Most users |
| **Koyeb** | **$0** | Need Neon | ✅ Yes | 20 min | GUI lovers |
| **Railway** | **$5 credit** | ✅ Included | ✅ Yes | 10 min | Simplicity |
| **Hetzner VPS** | **€4.15** | Self-managed | ✅ Yes | 1-2 hrs | Tech-savvy |
| **Replit** | **Variable** | ✅ Included | ⚠️ Payment issues | N/A | ❌ Avoid |

---

## 🎯 Recommended Migration Path

### For Most Users: Fly.io

1. **Today:** Deploy to Fly.io (free, takes 15 minutes)
2. **Test:** Verify everything works
3. **Switch:** Update DNS/webhooks
4. **Done:** Save money, no more payment worries!

### For Beginners: Railway

1. **Today:** Deploy to Railway (easiest, 10 minutes)
2. **First month:** Free, no credit card
3. **After:** ~$4-7/month (still cheaper than Replit issues)

### For Developers: Hetzner VPS

1. **Today:** Get Hetzner VPS
2. **Setup:** Docker + Docker Compose (1-2 hours)
3. **Learn:** Valuable DevOps skills
4. **Save:** €4/month, can host multiple projects

---

## 🔄 Migration Timeline

### Minimal Downtime Approach

1. **Phase 1 (30 min):** Set up new platform, deploy app
2. **Phase 2 (15 min):** Test thoroughly on new platform
3. **Phase 3 (10 min):** Export/import database if needed
4. **Phase 4 (5 min):** Update Stripe webhooks
5. **Phase 5 (immediate):** Update any custom domain DNS
6. **Phase 6 (monitor):** Watch for issues, keep Replit as backup for 1 week

**Total downtime:** Can be as low as 5 minutes (just DNS switch)

---

## 🆘 Troubleshooting

### Build Failures

**Problem:** Build fails with dependency errors

**Solution:**
```bash
# Ensure Node.js 20 is specified
node --version  # Should be v20.x

# Clear node_modules and rebuild
rm -rf node_modules package-lock.json
npm install
```

### Database Connection Issues

**Problem:** App can't connect to database

**Solution:**
- Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/database`
- Check database is running: `fly postgres status -a soulcodex-db`
- Check connection from app: `fly ssh console -C "node -e \"console.log(process.env.DATABASE_URL)\""`

### Environment Variables Not Set

**Problem:** App crashes with missing env vars

**Solution:**
```bash
# Fly.io - list secrets
fly secrets list

# Fly.io - set missing secret
fly secrets set KEY=value
```

### App Crashes on Startup

**Problem:** App exits immediately after deploy

**Solution:**
```bash
# Check logs for errors
fly logs

# Common issues:
# 1. Missing DATABASE_URL
# 2. Missing SESSION_SECRET
# 3. Port mismatch (should be 3000)
```

---

## 📚 Additional Resources

### Platform-Specific Guides
- [FLY_IO_DEPLOY.md](./FLY_IO_DEPLOY.md) - Detailed Fly.io guide
- [RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md) - Detailed Railway guide
- [KOYEB_DEPLOY.md](./KOYEB_DEPLOY.md) - Detailed Koyeb guide
- [VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md) - VPS setup guide
- [DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md) - Complete comparison

### General Deployment
- [DEPLOYMENT_INDEX.md](./DEPLOYMENT_INDEX.md) - All deployment options
- [QUICK_START.md](./QUICK_START.md) - Quick start guide

---

## ✅ Post-Migration Checklist

After migrating, verify:

- [ ] Application loads and responds
- [ ] User authentication works
- [ ] Database reads/writes work
- [ ] Profile generation works
- [ ] AI chat functionality works
- [ ] Stripe payments process correctly
- [ ] Webhooks are received
- [ ] Push notifications work (if enabled)
- [ ] Email sends (if configured)
- [ ] Custom domain works (if configured)
- [ ] SSL certificate is valid
- [ ] Backups are configured
- [ ] Monitoring is set up

---

## 🎉 Success!

Once migrated, you'll have:
- ✅ No more Replit payment issues
- ✅ True 24/7 uptime
- ✅ Lower costs (or free!)
- ✅ Better performance
- ✅ More control
- ✅ Easier scaling

**Need help?** Open an issue on GitHub or check the platform-specific guides above.

---

**🏆 Recommended:** Start with Fly.io for completely free, reliable hosting!
