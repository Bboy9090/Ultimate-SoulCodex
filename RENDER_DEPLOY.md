# Render Deployment Guide

This guide provides step-by-step instructions for deploying the Ultimate SoulCodex Engine to Render.

## Prerequisites

- A [Render account](https://render.com/) (sign up is free)
- GitHub repository access
- Required API keys and credentials (see Environment Variables checklist below)

## Deployment Steps

### 1. Connect Your Repository to Render

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** button in the top right
3. Select **"Blueprint"** (if using render.yaml) or **"Web Service"**
4. Connect your GitHub account if not already connected
5. Search for and select your repository: `Ultimate-SoulCodex-Engine-of-the-Eternal-Now`
6. Render will detect the `render.yaml` file automatically

### 2. Configure Build and Start Commands

If using the Blueprint (render.yaml):
- Commands are already configured in the file
- Review and confirm the settings

If creating manually:
- **Build Command**: `npm ci && npm run build`
- **Start Command**: `npm start`
- **Node Version**: 20.x (specified in package.json engines field)

### 3. Provision PostgreSQL Database

The render.yaml includes a managed PostgreSQL database configuration. When deploying via Blueprint:

1. Render will create a PostgreSQL database named `soulcodex-db`
2. The `DATABASE_URL` will be automatically connected to your web service
3. Database plan: **Starter** (can be upgraded later)

If setting up manually:
1. Go to **"New +"** > **"PostgreSQL"**
2. Name: `soulcodex-db`
3. Database: `soulcodex`
4. Plan: Select based on your needs (Starter for development)
5. After creation, copy the **Internal Database URL**
6. Add it to your web service as `DATABASE_URL` environment variable

### 4. Configure Environment Variables

Add the following environment variables in your Render web service settings:

#### Required Environment Variables

- [ ] `DATABASE_URL` - PostgreSQL connection string (auto-populated if using Blueprint)
- [ ] `NODE_ENV` - Set to `production`
- [ ] `SESSION_SECRET` - Random secure string for session encryption (generate with `openssl rand -base64 32`)

#### AI Service

- [ ] `OPENAI_API_KEY` - Your OpenAI API key for AI-powered features

#### Stripe Payment Integration

- [ ] `STRIPE_SECRET_KEY` - Stripe secret key
- [ ] `STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [ ] `STRIPE_WEBHOOK_SECRET` - Stripe webhook signing secret (configure webhook after deployment)
- [ ] `STRIPE_PRICE_WEEKLY` - Stripe price ID for weekly subscription
- [ ] `STRIPE_PRICE_MONTHLY` - Stripe price ID for monthly subscription
- [ ] `STRIPE_PRICE_YEARLY` - Stripe price ID for yearly subscription

#### Email Configuration

- [ ] `SENDER_EMAIL` - Email address for sending notifications
- [ ] `MAIL_HOST` - SMTP server hostname
- [ ] `MAIL_PORT` - SMTP server port (typically 587 or 465)
- [ ] `MAIL_USER` - SMTP authentication username
- [ ] `MAIL_PASS` - SMTP authentication password

**To add environment variables:**
1. Navigate to your web service in Render Dashboard
2. Go to **"Environment"** tab
3. Click **"Add Environment Variable"**
4. Enter key and value
5. Click **"Save Changes"**

### 5. Run Database Migrations

After your service is deployed and the database is connected:

1. Go to your web service's **"Shell"** tab in Render Dashboard
2. Run the migration command:
   ```bash
   npm run db:push
   ```
3. This will apply all Drizzle ORM schema migrations to your PostgreSQL database

Alternatively, you can add this to a deploy script or run it manually via SSH.

### 6. Configure Stripe Webhook

After your service is live:

1. Note your Render service URL (e.g., `https://your-service.onrender.com`)
2. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
3. Click **"Add endpoint"**
4. Enter webhook URL: `https://your-service.onrender.com/api/stripe/webhook`
5. Select events to listen for:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Click **"Add endpoint"**
7. Copy the **Signing secret** (starts with `whsec_`)
8. Add it to Render as `STRIPE_WEBHOOK_SECRET` environment variable
9. Redeploy your service to pick up the new environment variable

### 7. Verify Deployment

1. Wait for the build to complete (check the **"Logs"** tab)
2. Once deployed, visit your service URL
3. Check the health endpoint: `https://your-service.onrender.com/health`
   - Should return: `{"status":"ok"}`
4. Monitor logs for any startup errors
5. Test core functionality:
   - User registration/login
   - Profile creation
   - Payment flows (if Stripe is configured)

## Important Notes

### Free Tier vs. Paid Plans

- **Free Tier**: Service spins down after 15 minutes of inactivity (slow cold starts)
- **Starter Plan** ($7/month): Always-on, no cold starts
- **Standard Plan**: More resources for higher traffic

For production use, consider at least the Starter plan for consistent performance.

### Monitoring and Logs

- Access logs via **"Logs"** tab in Render Dashboard
- Set up log drains for external monitoring (optional)
- Configure alerts for service health in Render settings

### Database Backups

- Render automatically backs up PostgreSQL databases daily
- Backups are retained based on your plan
- Manual backups can be triggered from the database settings

### Environment-Specific Configuration

The application automatically detects `NODE_ENV`:
- `development`: Runs with Vite dev server and HMR
- `production`: Serves static build files

### Scaling

To handle more traffic:
1. Upgrade your web service plan for more resources
2. Consider horizontal scaling with multiple instances
3. Upgrade database plan if needed

## Troubleshooting

### Build Failures

- Check the build logs for specific errors
- Ensure all dependencies are in package.json
- Verify Node version compatibility (20.x)

### Runtime Errors

- Check application logs in **"Logs"** tab
- Verify all required environment variables are set
- Ensure DATABASE_URL is properly connected
- Check database migrations have been applied

### Database Connection Issues

- Verify DATABASE_URL is correct
- Check database is in the same region for best performance
- Ensure database is not over connection limit

### Health Check Failures

- Verify `/health` endpoint returns 200 status
- Check if service is starting up correctly
- Review startup logs for errors

## Support Resources

- [Render Documentation](https://render.com/docs)
- [Render Community](https://community.render.com/)
- [GitHub Issues](https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now/issues)

## Next Steps

After successful deployment:
1. Configure custom domain (optional)
2. Set up SSL certificate (automatic with custom domain)
3. Configure CDN for static assets (optional)
4. Set up monitoring and alerting
5. Plan for database backup and disaster recovery
