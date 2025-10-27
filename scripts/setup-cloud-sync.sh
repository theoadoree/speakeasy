#!/bin/bash
# Cloud VM auto-sync script
# Run this on your Google Cloud VM to automatically pull changes

set -e

REPO_DIR="/home/$(whoami)/speakeasy"
GITHUB_REPO="git@github.com:theoadoree/speakeasy.git"

echo "🔄 Setting up auto-sync on cloud VM..."

# Create repository directory if it doesn't exist
if [ ! -d "$REPO_DIR" ]; then
    echo "📁 Cloning repository..."
    git clone $GITHUB_REPO $REPO_DIR
    cd $REPO_DIR
else
    echo "📁 Repository exists, updating..."
    cd $REPO_DIR
fi

# Set up SSH key for GitHub (if not already done)
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "🔑 Generating SSH key for GitHub..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "📋 Add this public key to your GitHub account:"
    cat ~/.ssh/id_rsa.pub
    echo ""
    read -p "Press Enter after adding the key to GitHub..."
fi

# Configure git
git config user.name "Cloud VM"
git config user.email "vm@speakeasy.local"

# Create auto-sync script
cat > /usr/local/bin/sync-speakeasy.sh << 'EOF'
#!/bin/bash
REPO_DIR="/home/$(whoami)/speakeasy"
cd $REPO_DIR

echo "$(date): Syncing repository..."
git fetch origin
git pull origin main

if [ $? -eq 0 ]; then
    echo "✅ Repository synced successfully"
    
    # Restart services if needed
    if command -v systemctl &> /dev/null; then
        # Example: restart your backend service
        # sudo systemctl restart speakeasy-backend
        echo "🔄 Services restarted"
    fi
else
    echo "❌ Sync failed"
fi
EOF

chmod +x /usr/local/bin/sync-speakeasy.sh

# Set up cron job to sync every 5 minutes
echo "⏰ Setting up cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * /usr/local/bin/sync-speakeasy.sh >> /var/log/speakeasy-sync.log 2>&1") | crontab -

echo "✅ Auto-sync setup complete!"
echo "📝 Repository will sync every 5 minutes"
echo "📋 Logs: /var/log/speakeasy-sync.log"
echo "🔧 Manual sync: /usr/local/bin/sync-speakeasy.sh"
