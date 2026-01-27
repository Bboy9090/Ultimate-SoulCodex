#!/bin/bash
# Quick deployment helper script for Soul Codex Engine
# This script helps you choose and deploy to the cheapest 24/7 hosting

set -e

echo "╔═══════════════════════════════════════════════════════╗"
echo "║  Soul Codex - Quick Deployment Helper                ║"
echo "║  Choose your preferred hosting platform               ║"
echo "╚═══════════════════════════════════════════════════════╝"
echo ""

echo "Available options for cheapest 24/7 deployment:"
echo ""
echo "1) Fly.io         - FREE, 24/7, includes database (RECOMMENDED)"
echo "2) Koyeb + Neon   - FREE, 24/7, GUI-based setup"
echo "3) Railway        - ~\$5/month, easiest setup"
echo "4) Hetzner VPS    - €4.15/month, best value (requires Linux skills)"
echo "5) Exit"
echo ""
read -p "Enter your choice (1-5): " choice

case $choice in
  1)
    echo ""
    echo "📦 Fly.io Deployment"
    echo "===================="
    echo ""
    echo "Installing Fly CLI..."
    
    # Check if fly is already installed
    if command -v fly &> /dev/null; then
      echo "✅ Fly CLI already installed"
    else
      echo "Installing Fly CLI..."
      curl -L https://fly.io/install.sh | sh
      export PATH="$HOME/.fly/bin:$PATH"
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Sign up/login: fly auth signup (or fly auth login)"
    echo "2. Deploy app: fly launch --no-deploy"
    echo "3. Create database: fly postgres create --name soulcodex-db --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3"
    echo "4. Attach database: fly postgres attach soulcodex-db"
    echo "5. Set secrets (see FLY_IO_DEPLOY.md for commands)"
    echo "6. Deploy: fly deploy"
    echo ""
    echo "📚 Full guide: FLY_IO_DEPLOY.md"
    ;;
    
  2)
    echo ""
    echo "📦 Koyeb + Neon Deployment"
    echo "============================"
    echo ""
    echo "Setup steps:"
    echo "1. Create database at https://neon.tech (free 3GB)"
    echo "2. Sign up at https://koyeb.com"
    echo "3. Connect your GitHub account"
    echo "4. Create new app and select this repository"
    echo "5. Add DATABASE_URL from Neon to environment variables"
    echo "6. Deploy!"
    echo ""
    echo "📚 Full guide: KOYEB_DEPLOY.md"
    ;;
    
  3)
    echo ""
    echo "📦 Railway Deployment"
    echo "====================="
    echo ""
    
    # Check if railway CLI is installed
    if command -v railway &> /dev/null; then
      echo "✅ Railway CLI already installed"
    else
      echo "Installing Railway CLI..."
      npm install -g @railway/cli
    fi
    
    echo ""
    echo "Next steps:"
    echo "1. Login: railway login"
    echo "2. Initialize: railway init"
    echo "3. Add PostgreSQL: railway add postgres"
    echo "4. Set environment variables (see RAILWAY_DEPLOY.md)"
    echo "5. Deploy: railway up"
    echo ""
    echo "📚 Full guide: RAILWAY_DEPLOY.md"
    ;;
    
  4)
    echo ""
    echo "📦 VPS Self-Hosting (Hetzner)"
    echo "=============================="
    echo ""
    echo "This requires manual setup on a VPS."
    echo ""
    echo "Steps:"
    echo "1. Create account at https://www.hetzner.com/cloud"
    echo "2. Create Ubuntu 22.04 server (CX22 - €4.15/month)"
    echo "3. Follow detailed instructions in VPS_SELF_HOSTING.md"
    echo ""
    echo "💪 Best for: Developers comfortable with Linux/SSH"
    echo "📚 Full guide: VPS_SELF_HOSTING.md"
    ;;
    
  5)
    echo "Goodbye!"
    exit 0
    ;;
    
  *)
    echo "Invalid choice. Please run the script again."
    exit 1
    ;;
esac

echo ""
echo "════════════════════════════════════════════"
echo "Need help deciding? See DEPLOYMENT_COMPARISON.md"
echo "════════════════════════════════════════════"
