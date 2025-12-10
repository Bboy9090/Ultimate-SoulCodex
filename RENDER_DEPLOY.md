# Render Deployment Guide

This guide provides step-by-step instructions for deploying the Ultimate SoulCodex Engine to Render.

## Prerequisites

- A GitHub account with access to this repository
- A Render account (sign up at [render.com](https://render.com))
- Stripe account for payment processing (if using subscriptions)
- OpenAI API key for AI-powered features
- Email service credentials for notifications

## Quick Start

1. **Connect to Render**
   - Log in to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" and select "Blueprint"
   - Connect your GitHub account if not already connected
   - Select this repository: `Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now`
   - Render will automatically detect the `render.yaml` file

2. **Review and Create Services**
   - Render will show you the services to be created:
     - `soulcodex-engine` (Web Service)
     - `soulcodex-db` (PostgreSQL Database)
   - Click "Apply" to create the services

3. **Set Environment Variables**
   
   Navigate to your web service settings and add the following environment variables:

   ### Required Environment Variables

   | Variable | Description | Example/Notes |
   |----------|-------------|---------------|
   | `DATABASE_URL` | PostgreSQL connection string | Automatically set by Render from database |
   | `OPENAI_API_KEY` | OpenAI API key for AI features | Get from [platform.openai.com](https://platform.openai.com/api-keys) |
   | `SESSION_SECRET` | Secret for session encryption | Generate a strong random string (64+ chars) |
   | `SENDER_EMAIL` | Email address for sending notifications | your-app@yourdomain.com |
   | `MAIL_HOST` | SMTP server host | smtp.gmail.com (for Gmail) |
   | `MAIL_PORT` | SMTP server port | 587 (for TLS) or 465 (for SSL) |
   | `MAIL_USER` | SMTP username | your-email@gmail.com |
   | `MAIL_PASS` | SMTP password or app password | Gmail app password recommended |

   ### Stripe Environment Variables (for payment processing)

   | Variable | Description | Example/Notes |
   |----------|-------------|---------------|
   | `STRIPE_SECRET_KEY` | Stripe secret key | sk_live_... or sk_test_... |
   | `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | pk_live_... or pk_test_... |
   | `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret | whsec_... (see Stripe Webhook Setup below) |
   | `STRIPE_PRICE_WEEKLY` | Weekly subscription price ID | price_... (optional, for subscriptions) |
   | `STRIPE_PRICE_MONTHLY` | Monthly subscription price ID | price_... (optional, for subscriptions) |
   | `STRIPE_PRICE_YEARLY` | Yearly subscription price ID | price_... (optional, for subscriptions) |

   ### Optional Environment Variables

   | Variable | Description | Example/Notes |
   |----------|-------------|---------------|
   | `ADMIN_PASSWORD` | Password for admin features | Strong password for admin API endpoints |
   | `VAPID_PUBLIC_KEY` | VAPID public key for push notifications | Generate using web-push library |
   | `VAPID_PRIVATE_KEY` | VAPID private key for push notifications | Generate using web-push library |

   **How to generate SESSION_SECRET:**
   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

   **How to generate VAPID keys (for push notifications):**
   ```bash
   npx web-push generate-vapid-keys
   ```

4. **Run Database Migrations**
   
   After the first deployment completes:
   
   - Go to your web service in Render Dashboard
   - Click on "Shell" tab
   - Run the migration command:
     ```bash
     npm run db:push
     ```
   
   This will create all necessary database tables.

## Stripe Webhook Setup

To receive Stripe webhook events (for subscription updates, payment notifications, etc.):

1. **Get Your Render Service URL**
   - Your service URL will be: `https://soulcodex-engine.onrender.com` (or your custom domain)

2. **Configure Stripe Webhook**
   - Log in to [Stripe Dashboard](https://dashboard.stripe.com/)
   - Go to "Developers" → "Webhooks"
   - Click "Add endpoint"
   - Enter your webhook URL: `https://your-service.onrender.com/api/stripe/webhook`
   - Select events to listen to:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_failed`
   - Click "Add endpoint"

3. **Copy Webhook Signing Secret**
   - After creating the endpoint, copy the signing secret (starts with `whsec_`)
   - Add it to Render as `STRIPE_WEBHOOK_SECRET` environment variable

## Post-Deployment Checklist

- [ ] All environment variables are set correctly
- [ ] Database migrations have been run successfully (`npm run db:push`)
- [ ] `/health` endpoint returns `{"status":"ok"}` at `https://your-service.onrender.com/health`
- [ ] Test user registration and login
- [ ] Test profile creation
- [ ] Stripe webhook is configured and receiving events
- [ ] Email notifications are working
- [ ] Check application logs for any errors

## Accessing Logs

1. Go to your web service in Render Dashboard
2. Click on "Logs" tab
3. View real-time logs and filter by log level
4. Use logs to debug any issues

**Common log patterns to look for:**
- `Server ready on port` - Server started successfully
- `DATABASE_URL: ✓ Set` - Database connection configured
- `[SubscriptionService] Initialized` - Stripe is configured
- `❌` - Error indicators

## Performance & Scaling

### Free Tier Limitations
- **Spin Down**: Free services spin down after 15 minutes of inactivity
- **Spin Up Time**: Can take 30-60 seconds when service wakes up
- **Database**: 90-day expiration for free PostgreSQL databases

### Upgrading Your Plan

To avoid spin down and get better performance:

1. **Web Service**: Upgrade to Starter ($7/month) or higher
   - Prevents automatic spin down
   - Provides more CPU and memory
   - Custom domains included

2. **Database**: Upgrade to Starter ($7/month) or higher
   - No expiration
   - Automated backups
   - More storage and connections

## Troubleshooting

### Service Won't Start

**Check logs for:**
- Database connection errors → Verify `DATABASE_URL` is set
- Port binding errors → Render sets `PORT` automatically, don't override
- Missing dependencies → Ensure `npm ci` runs during build

### Database Connection Issues

```bash
# Test database connection from Shell
node -e "const { Pool } = require('pg'); const pool = new Pool({ connectionString: process.env.DATABASE_URL }); pool.query('SELECT NOW()', (err, res) => { console.log(err || res.rows); pool.end(); });"
```

### Migrations Not Running

- Go to Shell tab in Render Dashboard
- Run manually: `npm run db:push`
- Check for errors in output

### Stripe Webhooks Not Working

- Verify webhook URL is correct in Stripe Dashboard
- Check `STRIPE_WEBHOOK_SECRET` is set correctly
- Review logs for webhook errors
- Test webhook using Stripe CLI: `stripe listen --forward-to localhost:3000/api/stripe/webhook`

## Environment Variable Reference

Quick copy-paste checklist for Render Dashboard:

```
DATABASE_URL=<automatically set by Render>
NODE_ENV=production
OPENAI_API_KEY=sk_...
SESSION_SECRET=<64+ character random string>
SENDER_EMAIL=noreply@yourdomain.com
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=<your app password>
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_test_... or pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
ADMIN_PASSWORD=<strong password>
```

**Optional (for subscriptions):**
```
STRIPE_PRICE_WEEKLY=price_...
STRIPE_PRICE_MONTHLY=price_...
STRIPE_PRICE_YEARLY=price_...
```

**Optional (for push notifications):**
```
VAPID_PUBLIC_KEY=<generated key>
VAPID_PRIVATE_KEY=<generated key>
```

## Custom Domain Setup

1. Go to your web service settings in Render
2. Click on "Custom Domain" tab
3. Add your domain (e.g., `soulcodex.com`)
4. Follow DNS instructions to point your domain to Render
5. SSL certificate will be automatically provisioned

## Continuous Deployment

With auto-deploy enabled in `render.yaml`, Render will automatically:
- Deploy when you push to the main branch
- Run build command (`npm ci && npm run build`)
- Restart service with new code
- Maintain zero-downtime deployment

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Render Community Forum](https://community.render.com/)
- [Render Status Page](https://status.render.com/)
- [Stripe Documentation](https://stripe.com/docs)
- [OpenAI API Documentation](https://platform.openai.com/docs)

## Security Best Practices

1. **Never commit secrets** to your repository
2. **Use strong random strings** for SESSION_SECRET
3. **Enable 2FA** on your Render account
4. **Regularly rotate** API keys and secrets
5. **Monitor logs** for suspicious activity
6. **Keep dependencies updated** with `npm audit`
7. **Use Stripe test mode** until ready for production

## Backup & Disaster Recovery

### Database Backups

Render automatically backs up databases on paid plans:
- Daily backups retained for 7 days
- Can restore from any backup point

### Manual Backup

```bash
# From Render Shell
pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
```

## Next Steps

After deployment:
1. Test all core features
2. Monitor application logs
3. Set up Stripe webhooks
4. Configure custom domain (if applicable)
5. Upgrade to paid plan to avoid spin down
6. Set up monitoring and alerts
7. Plan your launch! 🚀
