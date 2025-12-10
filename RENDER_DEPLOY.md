# Render Deployment Guide

This guide provides step-by-step instructions for deploying the Ultimate SoulCodex Engine application to Render.

## Prerequisites

- A [Render account](https://render.com) (free tier available)
- Access to your application's environment secrets (API keys, database credentials, etc.)
- Git repository connected to GitHub

## Quick Deployment Steps

### 1. Create a New Web Service

1. Log in to your [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** and select **"Blueprint"** (recommended) or **"Web Service"**
3. Connect your GitHub repository: `Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now`

### 2. Using Blueprint (Recommended)

If using the Blueprint option:

1. Render will automatically detect the `render.yaml` file
2. Click **"Apply"** to create all services defined in the blueprint
3. This will create both the web service and PostgreSQL database
4. Proceed to Step 4 to set environment variables

### 3. Manual Web Service Setup (Alternative)

If creating the web service manually:

1. **Name**: `ultimate-soulcodex-engine` (or your preferred name)
2. **Region**: Choose the region closest to your users
3. **Branch**: `main` (or your production branch)
4. **Runtime**: Node
5. **Build Command**: `npm ci && npm run build`
6. **Start Command**: `npm start`
7. **Plan**: Select appropriate plan (Starter or higher)

### 4. Create PostgreSQL Database

If not using Blueprint:

1. Go to **"New +"** → **"PostgreSQL"**
2. **Name**: `soulcodex-db`
3. **Database Name**: `soulcodex`
4. **Plan**: Select appropriate plan (Starter or higher)
5. Click **"Create Database"**
6. Once created, copy the **Internal Database URL**

### 5. Configure Environment Variables

In your web service settings, navigate to the **"Environment"** tab and add the following environment variables:

#### Required Environment Variables

| Variable | Description | Example/Notes |
|----------|-------------|---------------|
| `NODE_ENV` | Application environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string | Auto-set if using Blueprint; otherwise paste Internal Database URL |
| `SESSION_SECRET` | Secret for session encryption | Generate a random 32+ character string |
| `OPENAI_API_KEY` | OpenAI API key for AI features | Get from https://platform.openai.com/api-keys |

#### Stripe Configuration (if using payments)

| Variable | Description |
|----------|-------------|
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `STRIPE_PRICE_WEEKLY` | Stripe price ID for weekly subscription |
| `STRIPE_PRICE_MONTHLY` | Stripe price ID for monthly subscription |
| `STRIPE_PRICE_YEARLY` | Stripe price ID for yearly subscription |

#### Email Configuration (if using email features)

| Variable | Description |
|----------|-------------|
| `SENDER_EMAIL` | Email address to send from |
| `MAIL_HOST` | SMTP server hostname |
| `MAIL_PORT` | SMTP server port (usually 587 or 465) |
| `MAIL_USER` | SMTP username |
| `MAIL_PASS` | SMTP password |

#### Additional Optional Variables

Check your application code for any additional environment variables that may be required for specific features.

### 6. Run Database Migrations

After the service is deployed and the database is connected:

1. Open the web service **"Shell"** tab in Render dashboard
2. Run the database migration command:
   ```bash
   npm run db:push
   ```
3. Verify the migration completed successfully

### 7. Verify Deployment

1. Once deployment completes, click on your service URL (e.g., `https://your-app.onrender.com`)
2. Check the health endpoint: `https://your-app.onrender.com/health`
   - Should return: `{"status":"ok"}`
3. Check the logs in the **"Logs"** tab for any errors
4. Test your application's key features

## Environment Variables Checklist

Before deploying, ensure you have the following secrets ready:

- [ ] `DATABASE_URL` (auto-configured if using managed database)
- [ ] `SESSION_SECRET`
- [ ] `OPENAI_API_KEY`
- [ ] `STRIPE_SECRET_KEY` (if using Stripe)
- [ ] `STRIPE_PUBLISHABLE_KEY` (if using Stripe)
- [ ] `STRIPE_WEBHOOK_SECRET` (if using Stripe)
- [ ] `STRIPE_PRICE_WEEKLY` (if using Stripe)
- [ ] `STRIPE_PRICE_MONTHLY` (if using Stripe)
- [ ] `STRIPE_PRICE_YEARLY` (if using Stripe)
- [ ] `SENDER_EMAIL` (if using email)
- [ ] `MAIL_HOST` (if using email)
- [ ] `MAIL_PORT` (if using email)
- [ ] `MAIL_USER` (if using email)
- [ ] `MAIL_PASS` (if using email)

## Generating Secrets

### SESSION_SECRET

Generate a secure random string:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator like [RandomKeygen](https://randomkeygen.com/)

### OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and save it securely (you won't be able to see it again)

### Stripe Keys

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your **Publishable key** and **Secret key**
3. For test mode, use test keys; for production, use live keys
4. For webhook secret, go to https://dashboard.stripe.com/webhooks and create/view your webhook endpoint

## Troubleshooting

### Build Failures

- Check the build logs in Render dashboard
- Ensure all dependencies are listed in `package.json`
- Verify Node.js version compatibility (20.x required)

### Runtime Errors

- Check application logs in the **"Logs"** tab
- Verify all required environment variables are set
- Check database connection by reviewing `DATABASE_URL`
- Ensure database migrations have been run

### Database Connection Issues

- Verify `DATABASE_URL` is correctly set
- Check that the database is in the same region as your web service (for best performance)
- Ensure database is running and accessible

### Health Check Failures

- The health endpoint `/health` should return `{"status":"ok"}` with status 200
- If failing, check application logs for startup errors
- Ensure the server is listening on the `PORT` environment variable

## Updating Your Application

When you push changes to your connected branch:

1. Render will automatically detect the changes
2. A new build will be triggered
3. After successful build, the service will be redeployed
4. Zero-downtime deployment is enabled by default

## Additional Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Deployment Guide](https://render.com/docs/deploy-node-express-app)
- [Render PostgreSQL Documentation](https://render.com/docs/databases)
- [Blueprint Specification](https://render.com/docs/blueprint-spec)

## Support

If you encounter issues:

1. Check the [Render Community Forum](https://community.render.com/)
2. Review application logs in Render dashboard
3. Check your repository's issues page
4. Contact Render support through the dashboard

## Security Notes

- **Never commit secrets** to your repository
- Use Render's environment variable feature to manage secrets
- Rotate API keys and secrets regularly
- Use different keys for development and production
- Enable two-factor authentication on your Render account
- Regularly update dependencies to patch security vulnerabilities
