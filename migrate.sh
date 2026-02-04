#!/bin/bash

# Ultimate Soul Codex - Replit Migration Helper
# This script helps you migrate from Replit to Fly.io (free) or other platforms

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  Ultimate Soul Codex - Replit Migration Helper            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you migrate from Replit to a free,"
echo "reliable 24/7 hosting platform."
echo ""

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Function to install Fly CLI
install_fly_cli() {
    echo "📦 Installing Fly CLI..."
    if [[ "$OSTYPE" == "darwin"* ]] || [[ "$OSTYPE" == "linux-gnu"* ]]; then
        curl -L https://fly.io/install.sh | sh
        export PATH="$HOME/.fly/bin:$PATH"
    else
        echo "Please install Fly CLI manually from: https://fly.io/docs/hands-on/install-flyctl/"
        echo "For Windows: iwr https://fly.io/install.ps1 -useb | iex"
        exit 1
    fi
}

# Menu
echo "Choose your deployment platform:"
echo ""
echo "1) Fly.io (FREE 24/7 - RECOMMENDED)"
echo "   • $0/month forever"
echo "   • No credit card required"
echo "   • Includes 3GB PostgreSQL"
echo "   • True 24/7 uptime"
echo ""
echo "2) Railway (~$5/month)"
echo "   • Easiest setup"
echo "   • First month free"
echo "   • Integrated database"
echo ""
echo "3) Koyeb + Neon (FREE 24/7)"
echo "   • GUI-based setup"
echo "   • 2GB RAM"
echo "   • Separate database"
echo ""
echo "4) Show me all options"
echo ""
echo "5) I'll do it manually (exit)"
echo ""

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  Fly.io Deployment Setup"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
        
        # Check if Fly CLI is installed
        if ! command_exists fly; then
            echo "⚠️  Fly CLI is not installed."
            read -p "Would you like to install it now? (y/n): " install_fly
            if [[ "$install_fly" == "y" || "$install_fly" == "Y" ]]; then
                install_fly_cli
            else
                echo "Please install Fly CLI manually: https://fly.io/docs/hands-on/install-flyctl/"
                exit 1
            fi
        fi
        
        echo "✅ Fly CLI is installed"
        echo ""
        
        # Check if logged in
        if ! fly auth whoami >/dev/null 2>&1; then
            echo "📝 You need to authenticate with Fly.io"
            read -p "Do you have a Fly.io account? (y/n): " has_account
            
            if [[ "$has_account" == "y" || "$has_account" == "Y" ]]; then
                echo "Running: fly auth login"
                fly auth login
            else
                echo "Running: fly auth signup"
                fly auth signup
            fi
        fi
        
        echo "✅ Authenticated with Fly.io"
        echo ""
        
        # Launch app
        echo "🚀 Launching your app..."
        echo "This will create fly.toml if it doesn't exist"
        echo ""
        
        if [ -f "fly.toml" ]; then
            echo "✅ fly.toml already exists"
        else
            echo "Creating fly.toml..."
            fly launch --no-deploy
        fi
        
        echo ""
        echo "Next steps:"
        echo ""
        echo "1. Create PostgreSQL database:"
        echo "   fly postgres create --name soulcodex-db --initial-cluster-size 1 --vm-size shared-cpu-1x --volume-size 3"
        echo ""
        echo "2. Attach database:"
        echo "   fly postgres attach soulcodex-db"
        echo ""
        echo "3. Set secrets (replace with your actual values):"
        echo "   fly secrets set \\"
        echo "     SESSION_SECRET=\$(openssl rand -hex 64) \\"
        echo "     OPENAI_API_KEY=your_key \\"
        echo "     STRIPE_SECRET_KEY=your_key \\"
        echo "     STRIPE_WEBHOOK_SECRET=your_secret \\"
        echo "     ADMIN_PASSWORD=your_password"
        echo ""
        echo "4. Deploy:"
        echo "   fly deploy"
        echo ""
        echo "5. Open your app:"
        echo "   fly open"
        echo ""
        echo "📚 Full guide: See MIGRATION_FROM_REPLIT.md"
        ;;
        
    2)
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  Railway Deployment Setup"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
        echo "Railway offers the easiest deployment experience:"
        echo ""
        echo "1. Go to: https://railway.app"
        echo "2. Sign up with GitHub"
        echo "3. Click 'New Project' → 'Deploy from GitHub repo'"
        echo "4. Select this repository"
        echo "5. Add PostgreSQL database (click 'New' → 'Database')"
        echo "6. Set environment variables in Railway dashboard"
        echo "7. Deploy automatically!"
        echo ""
        echo "💰 Cost: ~$4-7/month (first month free)"
        echo ""
        echo "📚 Full guide: See RAILWAY_DEPLOY.md"
        ;;
        
    3)
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  Koyeb + Neon Deployment Setup"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
        echo "Koyeb + Neon offers free 24/7 hosting:"
        echo ""
        echo "Step 1 - Database (Neon):"
        echo "1. Go to: https://neon.tech"
        echo "2. Sign up (no credit card)"
        echo "3. Create new project"
        echo "4. Copy DATABASE_URL"
        echo ""
        echo "Step 2 - Application (Koyeb):"
        echo "1. Go to: https://koyeb.com"
        echo "2. Sign up (no credit card)"
        echo "3. Create service from GitHub"
        echo "4. Select this repository"
        echo "5. Add DATABASE_URL from Neon"
        echo "6. Add other environment variables"
        echo "7. Deploy!"
        echo ""
        echo "💰 Cost: $0/month"
        echo ""
        echo "📚 Full guide: See KOYEB_DEPLOY.md"
        ;;
        
    4)
        echo ""
        echo "═══════════════════════════════════════════════════════════"
        echo "  All Deployment Options"
        echo "═══════════════════════════════════════════════════════════"
        echo ""
        echo "📚 Documentation Files:"
        echo ""
        echo "  • MIGRATION_FROM_REPLIT.md - Complete migration guide"
        echo "  • DEPLOYMENT_COMPARISON.md - Detailed cost comparison"
        echo "  • DEPLOYMENT_INDEX.md - All deployment options"
        echo ""
        echo "Platform-Specific Guides:"
        echo "  • FLY_IO_DEPLOY.md - Fly.io (FREE)"
        echo "  • RAILWAY_DEPLOY.md - Railway (~$5/mo)"
        echo "  • KOYEB_DEPLOY.md - Koyeb (FREE)"
        echo "  • VPS_SELF_HOSTING.md - VPS (€4/mo)"
        echo "  • RENDER_DEPLOY.md - Render (spins down)"
        echo ""
        echo "💡 Recommendation: Start with Fly.io (completely free)"
        ;;
        
    5)
        echo ""
        echo "No problem! Check out these files for manual setup:"
        echo ""
        echo "  📖 MIGRATION_FROM_REPLIT.md - Start here"
        echo "  📊 DEPLOYMENT_COMPARISON.md - Compare options"
        echo "  📚 DEPLOYMENT_INDEX.md - All guides"
        echo ""
        exit 0
        ;;
        
    *)
        echo "Invalid choice. Please run the script again."
        exit 1
        ;;
esac

echo ""
echo "═══════════════════════════════════════════════════════════"
echo ""
echo "Need help? Check these resources:"
echo "  • MIGRATION_FROM_REPLIT.md - Complete guide"
echo "  • GitHub Issues - Ask questions"
echo "  • Platform documentation - Detailed docs"
echo ""
echo "Good luck with your migration! 🚀"
