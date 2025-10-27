#!/bin/bash
# Real-time file watcher for automatic git sync
# Requires: brew install fswatch (macOS) or apt-get install inotify-tools (Linux)

set -e

echo "👀 Starting real-time file watcher..."

# Check if fswatch is installed (macOS)
if command -v fswatch &> /dev/null; then
    echo "📁 Watching for changes in: $(pwd)"
    
    # Watch for changes and auto-commit
    fswatch -o . | while read f; do
        echo "🔄 Changes detected, syncing..."
        
        # Add all changes
        git add .
        
        # Check if there are changes to commit
        if ! git diff --staged --quiet; then
            git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
            git push origin main
            
            echo "✅ Changes pushed to GitHub"
            
            # Optional: Sync with cloud VM
            if [ -f ".env.vm" ]; then
                source .env.vm
                echo "🔄 Syncing with cloud VM..."
                gcloud compute ssh $GCP_VM_NAME --zone=$GCP_VM_ZONE --command="cd /home/\$(whoami)/speakeasy && git pull origin main" || echo "VM sync failed"
            fi
        else
            echo "ℹ️  No changes to commit"
        fi
    done
    
elif command -v inotifywait &> /dev/null; then
    echo "📁 Using inotifywait (Linux)..."
    
    while true; do
        inotifywait -r -e modify,create,delete,move .
        
        echo "🔄 Changes detected, syncing..."
        git add .
        
        if ! git diff --staged --quiet; then
            git commit -m "Auto-sync: $(date '+%Y-%m-%d %H:%M:%S')"
            git push origin main
            echo "✅ Changes pushed to GitHub"
        fi
        
        sleep 2
    done
    
else
    echo "❌ File watcher not available"
    echo "Install fswatch (macOS): brew install fswatch"
    echo "Install inotify-tools (Linux): sudo apt-get install inotify-tools"
    exit 1
fi
