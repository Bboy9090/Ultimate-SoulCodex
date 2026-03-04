# Deployment Documentation Index

## 📖 Overview & Local Setup

**👉 [DEPLOYMENT.md](./DEPLOYMENT.md)** - Stack overview, local dev, checklist

**👉 [ONE_CLICK_DEPLOY.md](./ONE_CLICK_DEPLOY.md)** - **Deploy with one click** (Render, Railway, Fly.io)

---

## 🚀 Migrating from Replit?

**👉 [MIGRATION_FROM_REPLIT.md](./MIGRATION_FROM_REPLIT.md)** - Complete step-by-step migration guide

**Quick Start:**
```bash
./migrate.sh  # Interactive migration helper
```

---

## 🎯 Quick Decision: Which Platform?

**Need FREE 24/7?** → [Fly.io](./FLY_IO_DEPLOY.md) ⭐ RECOMMENDED

**Want GUI setup?** → [Koyeb](./KOYEB_DEPLOY.md)

**Value easy setup?** → [Railway](./RAILWAY_DEPLOY.md) (~$5/mo)

**Want full control?** → [VPS Self-Hosting](./VPS_SELF_HOSTING.md) (€4/mo)

**Just testing?** → [Render](./RENDER_DEPLOY.md) (spins down)

**Need DNS/CDN in front of Railway?** → [Cloudflare](./CLOUDFLARE_DEPLOY.md)

---

## 📚 Complete Deployment Guides

### Platform-Specific Guides

1. **[FLY_IO_DEPLOY.md](./FLY_IO_DEPLOY.md)** - Deploy to Fly.io
   - ✅ **FREE forever**
   - ✅ True 24/7 (no spin-down)
   - ✅ Includes 3GB PostgreSQL database
   - ✅ No credit card required
   - ⏱️ Setup: ~15 minutes
   - 🎯 **Best for:** Most users wanting free 24/7 hosting

2. **[KOYEB_DEPLOY.md](./KOYEB_DEPLOY.md)** - Deploy to Koyeb
   - ✅ **FREE forever**
   - ✅ True 24/7 (no spin-down)
   - ✅ 2GB RAM (generous)
   - ✅ GUI-based setup
   - ✅ No credit card required
   - ⏱️ Setup: ~20 minutes
   - 🎯 **Best for:** Users preferring GUI over CLI

3. **[RAILWAY_DEPLOY.md](./RAILWAY_DEPLOY.md)** - Deploy to Railway
   - 💰 **$5 free credit/month** (~$4-7 actual cost)
   - ✅ True 24/7
   - ✅ Integrated PostgreSQL
   - ✅ Easiest setup
   - ⏱️ Setup: ~10 minutes
   - 🎯 **Best for:** Simplicity over cost

4. **[VPS_SELF_HOSTING.md](./VPS_SELF_HOSTING.md)** - Self-host on VPS
   - 💰 **€4-6/month** (or FREE with Oracle)
   - ✅ Full control
   - ✅ Best resources per dollar
   - ✅ Can host multiple apps
   - ⚠️ Requires Linux/SSH knowledge
   - ⏱️ Setup: ~1-2 hours
   - 🎯 **Best for:** Tech-savvy users, best long-term value

5. **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)** - Deploy to Render
   - 💰 **FREE** (with limitations)
   - ⚠️ Spins down after 15 min inactivity
   - ⚠️ Database expires after 90 days
   - ✅ Easy setup
   - ⏱️ Setup: ~15 minutes
   - 🎯 **Best for:** Testing/staging only

### Comparison & Decision Guides

6. **[DEPLOYMENT_COMPARISON.md](./DEPLOYMENT_COMPARISON.md)** - Complete comparison
   - 📊 Cost comparison table
   - 🔍 Feature-by-feature analysis
   - 🎯 Decision tree
   - 💡 Recommendations by user type
   - 📈 First-year cost projections
   - **START HERE if unsure which platform to use**

### Quick Start Tools

7. **[CLOUDFLARE_DEPLOY.md](./CLOUDFLARE_DEPLOY.md)** - Cloudflare DNS + CDN
   - ✅ Custom domains via Cloudflare
   - ✅ Optional CDN caching for static assets
   - 🎯 **Best for:** Fronting Railway with Cloudflare

8. **[deploy.sh](./deploy.sh)** - Interactive deployment helper
   - Run `./deploy.sh` for guided setup
   - Helps you choose the right platform
   - Installs necessary CLI tools
   - Provides next steps

9. **[docker-compose.yml](./docker-compose.yml)** - Local development & self-hosting
   - PostgreSQL + App in containers
   - One-command startup
   - Volume persistence
   - Health checks

---

## 🚀 Quick Start (Recommended Path)

### For Most Users: Fly.io (Free 24/7)

```bash
# 1. Install Fly CLI
curl -L https://fly.io/install.sh | sh

# 2. Sign up/login
fly auth signup  # or: fly auth login

# 3. Launch app (don't deploy yet)
fly launch --no-deploy

# 4. Create database
fly postgres create --name soulcodex-db --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3

# 5. Attach database
fly postgres attach soulcodex-db

# 6. Set secrets
fly secrets set \
  SESSION_SECRET=$(openssl rand -hex 64) \
  OPENAI_API_KEY=sk_your_key \
  STRIPE_SECRET_KEY=sk_your_key \
  STRIPE_WEBHOOK_SECRET=whsec_your_secret \
  ADMIN_PASSWORD=your_password

# 7. Deploy!
fly deploy
```

**Done!** Your app is now running 24/7 for FREE at `https://your-app.fly.dev`

📚 **See [FLY_IO_DEPLOY.md](./FLY_IO_DEPLOY.md) for detailed instructions**

---

## 💰 Cost Comparison Summary

| Platform | Monthly Cost | Database | Always On? | Setup Time |
|----------|--------------|----------|------------|------------|
| **Fly.io** | **$0** | ✅ 3GB included | ✅ Yes | 15 min |
| **Koyeb** | **$0** | Need Neon (free) | ✅ Yes | 20 min |
| **Railway** | **~$5** | ✅ Included | ✅ Yes | 10 min |
| **Hetzner VPS** | **€4.15** | Self-managed | ✅ Yes | 1-2 hours |
| **Oracle VPS** | **$0** | Self-managed | ✅ Yes | 2-3 hours |
| **DigitalOcean** | **$6** | Self-managed | ✅ Yes | 1-2 hours |
| **Render Free** | **$0** | 90 days only | ❌ Spins down | 15 min |

**Winner:** Fly.io or Koyeb (both truly free, 24/7, no credit card) 🏆

---

## 🎓 Learning Path

### Complete Beginner
1. Start with **Railway** (easiest, ~$5/mo)
2. When comfortable, move to **Fly.io** (save money)

### Some Technical Skills
1. Start with **Fly.io** (free, great DX)
2. Learn platform, understand limits
3. Consider VPS later for more control

### Tech-Savvy Developer
1. Go straight to **Hetzner VPS** (best value)
2. Learn DevOps skills while saving money
3. Can host multiple projects on same VPS

---

## 📋 Pre-Deployment Checklist

Before deploying to ANY platform:

- [ ] Have your **OPENAI_API_KEY** ready ([get one](https://platform.openai.com/api-keys))
- [ ] Have your **STRIPE keys** ready (test mode is fine) ([get keys](https://dashboard.stripe.com/apikeys))
- [ ] Generate **SESSION_SECRET**: `openssl rand -hex 64`
- [ ] Prepare **ADMIN_PASSWORD** (strong password)
- [ ] Optional: SMTP credentials for email notifications
- [ ] Optional: Domain name (can use platform's subdomain initially)

---

## 🔧 Configuration Files

### Required for All Deployments
- **.env** - Environment variables (copy from [.env.example](./.env.example))
- **package.json** - Already configured ✅

### Platform-Specific (Already Included)
- **docker-compose.yml** - For local dev and self-hosting
- **railway.json** - Railway configuration
- **render.yaml** - Render configuration
- **Procfile** - Generic process file

---

## 🆘 Troubleshooting

### Common Issues Across All Platforms

**Build fails:**
- Ensure Node.js 20 is specified
- Check all dependencies are in package.json
- Review build logs for specific errors

**App crashes on startup:**
- Verify all required environment variables are set
- Check DATABASE_URL is correct format
- Review application logs

**Database connection fails:**
- Verify DATABASE_URL format: `postgresql://user:pass@host:port/db`
- Check database is running and accessible
- Verify credentials are correct

**For platform-specific troubleshooting, see individual deployment guides.**

---

## 📊 Resource Requirements

### Minimum Requirements
- **RAM:** 256MB (Fly.io minimum)
- **CPU:** 0.5 shared vCPU
- **Storage:** 1GB (app + small database)
- **Bandwidth:** 10GB/month

### Recommended for Production
- **RAM:** 512MB - 1GB
- **CPU:** 1 shared or 0.5 dedicated vCPU  
- **Storage:** 3-5GB (for database growth)
- **Bandwidth:** 50GB/month

**All recommended platforms meet or exceed these requirements in their free/cheap tiers.**

---

## 🔒 Security Considerations

For ALL deployments:

1. **Never commit secrets** to Git
2. Use **environment variables** for all sensitive data
3. Enable **2FA** on hosting account
4. Use **strong passwords** (min 16 chars, random)
5. Keep **dependencies updated**: `npm audit`
6. Enable **HTTPS** (automatic on all platforms)
7. Configure **firewall rules** (VPS only)
8. Set up **automated backups** (especially for VPS)

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic)

Deploy automatically on push to main branch:

**Fly.io:** See [.github/workflows/fly-deploy.yml](./.github/workflows/fly-deploy.yml)

**Other platforms:** Similar workflows can be created

**Setup:**
1. Get platform API token
2. Add to GitHub Secrets
3. Enable workflow
4. Push to main → auto-deploy! 🚀

---

## 📞 Support & Resources

### Platform Documentation
- **Fly.io:** https://fly.io/docs/
- **Koyeb:** https://koyeb.com/docs/
- **Railway:** https://docs.railway.app/
- **Render:** https://render.com/docs/
- **Hetzner:** https://docs.hetzner.com/
- **DigitalOcean:** https://docs.digitalocean.com/

### Community Support
- **GitHub Issues:** For application-specific issues
- **Platform Discord/Forums:** For platform-specific issues
- **Stack Overflow:** For general deployment questions

---

## 🎯 Next Steps

1. ✅ Choose your deployment platform ([see comparison](./DEPLOYMENT_COMPARISON.md))
2. ✅ Follow the specific deployment guide
3. ✅ Set up environment variables
4. ✅ Deploy and test
5. ✅ Configure custom domain (optional)
6. ✅ Set up Stripe webhooks
7. ✅ Enable monitoring
8. ✅ Set up backups
9. 🚀 **Launch!**

---

## 🏆 Recommended: Fly.io

**For 99% of users, we recommend starting with Fly.io:**
- ✅ Completely free
- ✅ True 24/7 (no spin-down)
- ✅ Includes database (3GB)
- ✅ No credit card required
- ✅ Great CLI and documentation
- ✅ Easy to upgrade if needed

**Get started:** [FLY_IO_DEPLOY.md](./FLY_IO_DEPLOY.md)

---

**Questions?** Open an issue or check the detailed deployment guides above! 🚀
