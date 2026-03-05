# Ultimate SoulCodex Engine of the Eternal Now

## Deployment

### Recommended Deployment Path
Railway is the recommended deployment platform for this application, especially for users migrating off Replit. It provides a seamless experience and simplifies environment configuration.

### Important Troubleshooting Note
Be aware that using `startCommand` in Railway does not support inline environment variable assignments. For example, avoid using:

```bash
NODE_ENV=production npm start
```

Instead, configure your environment variables directly in the Railway interface.

### Docker-Compose
The provided `docker-compose.yml` is intended for local development and VPS deployment only. It is not suited for production environments directly. Make sure to adapt your configuration based on your environment needs.