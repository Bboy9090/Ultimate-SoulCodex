# VPS Self-Hosting Guide - Cheapest 24/7 Option!

## Cost: **$3-6/month** for VPS - Ultimate control and cheapest long-term

Self-hosting on a VPS gives you:
- **Full control** over your infrastructure
- **Cheapest long-term** solution
- **No platform restrictions**
- **Multiple apps on one server**
- **Learn valuable DevOps skills**

## Best Budget VPS Providers

### 1. Oracle Cloud (FREE FOREVER)
- ✅ **FREE Forever:** 2 ARM VMs (4 cores, 24GB RAM total)
- ✅ **Or:** 2 AMD VMs (1 core, 1GB RAM each)
- ✅ **200GB storage** included
- ✅ **10TB bandwidth/month**
- ❌ Harder setup, may require credit card
- 🔗 [oracle.com/cloud/free](https://www.oracle.com/cloud/free/)

**Best for:** Free forever option if you can handle the complexity

### 2. Hetzner Cloud (BEST VALUE)
- 💰 **€4.15/month** (~$4.50)
- ⚡ **2 vCPU, 4GB RAM, 40GB SSD**
- 📊 **20TB bandwidth**
- 🌍 **European servers** (Germany, Finland)
- ⭐ **Best performance per dollar**
- 🔗 [hetzner.com/cloud](https://www.hetzner.com/cloud)

**Best for:** Best performance/price ratio, European users

### 3. Contabo (CHEAPEST)
- 💰 **€3.99/month** (~$4.30)
- ⚡ **4 vCPU, 6GB RAM, 100GB SSD**
- 📊 **Unlimited bandwidth**
- 🌍 **Multiple regions** (US, EU, Asia)
- ⚠️ **Performance varies**
- 🔗 [contabo.com](https://contabo.com/en/vps/)

**Best for:** Absolute cheapest option, don't mind occasional slowness

### 4. DigitalOcean
- 💰 **$6/month** (with $200 free credit for 60 days)
- ⚡ **1 vCPU, 1GB RAM, 25GB SSD**
- 📊 **1TB bandwidth**
- 🌍 **Global locations**
- ⭐ **Excellent documentation**
- 🔗 [digitalocean.com](https://www.digitalocean.com/)

**Best for:** Great documentation, reliable, good for beginners

### 5. Vultr
- 💰 **$6/month** (or $3.50 for IPv6 only)
- ⚡ **1 vCPU, 1GB RAM, 25GB SSD**
- 📊 **1TB bandwidth**
- 🌍 **Global locations**
- 🔗 [vultr.com](https://www.vultr.com/)

**Best for:** Similar to DigitalOcean, more locations

### 6. Linode (by Akamai)
- 💰 **$5/month** (with $100 free credit for 60 days)
- ⚡ **1 vCPU, 1GB RAM, 25GB SSD**
- 📊 **1TB bandwidth**
- 🌍 **Global locations**
- 🔗 [linode.com](https://www.linode.com/)

**Best for:** Reliable, good support, free credit

## Recommended: Hetzner (Best Value)

I'll use Hetzner as the example, but steps are similar for all providers.

## Prerequisites

- SSH key pair (generate if needed)
- Domain name (optional but recommended)
- Basic Linux knowledge

## Setup Instructions

### 1. Create VPS

1. **Sign up at Hetzner Cloud**
2. **Create new project:** "SoulCodex"
3. **Add server:**
   - Location: Closest to your users (Falkenstein, Germany is default)
   - OS: **Ubuntu 22.04**
   - Type: **CX22** (2 vCPU, 4GB RAM) - €4.15/month
   - Add SSH key
   - Name: `soulcodex-prod`
4. **Create server** and note the IP address

### 2. Initial Server Setup

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Update system
apt update && apt upgrade -y

# Create non-root user
adduser soulcodex
usermod -aG sudo soulcodex

# Copy SSH keys to new user
rsync --archive --chown=soulcodex:soulcodex ~/.ssh /home/soulcodex

# Exit and login as new user
exit
ssh soulcodex@YOUR_SERVER_IP
```

### 3. Install Dependencies

```bash
# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Install other tools
sudo apt install -y git nginx certbot python3-certbot-nginx

# Verify installations
node --version  # Should show v20.x
docker --version
docker compose version
```

### 4. Setup Firewall

```bash
# Configure UFW firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable

# Check status
sudo ufw status
```

### 5. Clone and Setup Application

```bash
# Clone repository
cd ~
git clone https://github.com/Bboy9090/Ultimate-SoulCodex-Engine-of-the-Eternal-Now.git
cd Ultimate-SoulCodex-Engine-of-the-Eternal-Now

# Create .env file
nano .env
```

Add your environment variables:
```bash
NODE_ENV=production
PORT=3000
DB_PASSWORD=your_secure_db_password
DATABASE_URL=postgresql://soulcodex:your_secure_db_password@db:5432/soulcodex
SESSION_SECRET=$(openssl rand -hex 64)
OPENAI_API_KEY=sk_your_key
STRIPE_SECRET_KEY=sk_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_secret
ADMIN_PASSWORD=your_admin_password
# Add other env vars as needed
```

Save with `Ctrl+X`, `Y`, `Enter`.

### 6. Start Application with Docker Compose

```bash
# Start services
docker compose up -d

# Check status
docker compose ps

# View logs
docker compose logs -f

# Run database migrations
docker compose exec app npm run db:push
```

Your app is now running on port 3000!

### 7. Setup Nginx Reverse Proxy

```bash
# Create Nginx config
sudo nano /etc/nginx/sites-available/soulcodex
```

Add this configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/soulcodex /etc/nginx/sites-enabled/

# Test config
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### 8. Setup SSL with Let's Encrypt

```bash
# Get SSL certificate (replace with your domain)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

Your app is now live at `https://your-domain.com`! 🎉

## Domain Setup

### Point Domain to VPS

Add these DNS records at your domain registrar:

```
A Record:    @ → YOUR_SERVER_IP
A Record:    www → YOUR_SERVER_IP
```

Wait 5-60 minutes for DNS propagation.

## Maintenance & Monitoring

### Auto-Start on Boot

Docker Compose services are already set to restart automatically.

### View Logs

```bash
# App logs
docker compose logs -f app

# Database logs
docker compose logs -f db

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Update Application

```bash
cd ~/Ultimate-SoulCodex-Engine-of-the-Eternal-Now

# Pull latest code
git pull

# Rebuild and restart
docker compose down
docker compose up -d --build

# Run migrations if needed
docker compose exec app npm run db:push
```

### Backup Database

```bash
# Manual backup
docker compose exec db pg_dump -U soulcodex soulcodex > backup_$(date +%Y%m%d).sql

# Automated daily backups (add to crontab)
crontab -e
# Add this line:
# 0 2 * * * cd ~/Ultimate-SoulCodex-Engine-of-the-Eternal-Now && docker compose exec -T db pg_dump -U soulcodex soulcodex > ~/backups/backup_$(date +\%Y\%m\%d).sql
```

### Restore Database

```bash
# Restore from backup
cat backup_20260127.sql | docker compose exec -T db psql -U soulcodex soulcodex
```

### System Updates

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Update Docker images
docker compose pull
docker compose up -d
```

## Monitoring Setup (Optional)

### Install htop for system monitoring
```bash
sudo apt install htop
htop
```

### Setup basic monitoring
```bash
# Install netdata (automatic monitoring dashboard)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Access at: http://YOUR_SERVER_IP:19999
# To secure it, setup Nginx proxy with password
```

### Setup uptime monitoring (Free)
- Use [UptimeRobot](https://uptimerobot.com/) (free)
- Add your domain for monitoring
- Get alerts via email/SMS when down

## Security Hardening

### 1. SSH Key Only (Disable Password)
```bash
sudo nano /etc/ssh/sshd_config
# Set: PasswordAuthentication no
sudo systemctl restart sshd
```

### 2. Fail2Ban (Prevent brute force)
```bash
sudo apt install fail2ban -y
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 3. Automatic Security Updates
```bash
sudo apt install unattended-upgrades -y
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 4. Setup Swap (if RAM is limited)
```bash
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

## Cost Comparison

### Monthly Costs

| Provider | Plan | Monthly | RAM | CPU | Storage | Bandwidth |
|----------|------|---------|-----|-----|---------|-----------|
| **Oracle** | Always Free | **$0** | 24GB | 4 ARM | 200GB | 10TB |
| **Contabo** | VPS S | **€4** | 6GB | 4 vCPU | 100GB | Unlimited |
| **Hetzner** | CX22 | **€4.15** | 4GB | 2 vCPU | 40GB | 20TB |
| **Vultr** | Regular | **$6** | 1GB | 1 vCPU | 25GB | 1TB |
| **DigitalOcean** | Basic | **$6** | 1GB | 1 vCPU | 25GB | 1TB |
| **Linode** | Nanode | **$5** | 1GB | 1 vCPU | 25GB | 1TB |

**Recommendation:** Hetzner CX22 for best value (€4.15/month)

### Total Cost Breakdown (Hetzner Example)

| Item | Monthly Cost |
|------|--------------|
| VPS (CX22) | €4.15 |
| Domain (optional) | ~$1 |
| **TOTAL** | **~$5-6/month** |

## Scaling

### Vertical Scaling (Upgrade VPS)
- Upgrade to larger plan as needed
- Hetzner CX32: €8.21/month (4 vCPU, 8GB RAM)

### Horizontal Scaling (Multiple Servers)
- Add load balancer
- Deploy multiple app instances
- Separate database server

## Troubleshooting

### App not starting
```bash
docker compose logs app
docker compose restart app
```

### Database connection issues
```bash
docker compose logs db
docker compose restart db
```

### Nginx errors
```bash
sudo nginx -t
sudo systemctl status nginx
sudo tail -f /var/log/nginx/error.log
```

### Out of memory
```bash
# Add swap space (see Security Hardening section)
# Or upgrade VPS plan
```

### Out of disk space
```bash
# Check usage
df -h

# Clean Docker
docker system prune -a

# Clean apt cache
sudo apt clean
```

## Advantages of Self-Hosting

✅ **Cheapest long-term** (~$4-6/month)
✅ **Full control** over infrastructure
✅ **Multiple apps** on one server
✅ **No platform limitations**
✅ **Learn DevOps skills**
✅ **Keep all logs and data**
✅ **Custom configurations**

## Disadvantages

❌ **More setup time** (1-2 hours initial)
❌ **Requires Linux knowledge**
❌ **You handle maintenance**
❌ **You handle security**
❌ **You handle backups**
❌ **No automatic scaling**

## When to Choose Self-Hosting

✅ **Choose VPS if:**
- You want cheapest long-term option
- You're comfortable with Linux/SSH
- You want full control
- You have time for initial setup
- You want to learn DevOps

❌ **Choose PaaS if:**
- You want zero-config deployment
- You don't want to manage servers
- You need automatic scaling
- You prefer managed services

## Next Steps

1. ✅ Choose VPS provider (recommend Hetzner)
2. ✅ Create server and point domain
3. ✅ Follow setup instructions above
4. ✅ Deploy application with Docker Compose
5. ✅ Setup Nginx and SSL
6. Test all features
7. Setup monitoring
8. Configure backups
9. Set up Stripe webhooks
10. Monitor and optimize

## Support & Resources

- **Hetzner Docs:** https://docs.hetzner.com/
- **DigitalOcean Tutorials:** https://www.digitalocean.com/community/tutorials
- **Linode Guides:** https://www.linode.com/docs/
- **Docker Docs:** https://docs.docker.com/
- **Nginx Docs:** https://nginx.org/en/docs/

---

**Best option for tech-savvy users wanting cheapest long-term solution! 💪**
