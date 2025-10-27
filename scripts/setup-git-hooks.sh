#!/bin/bash
# Git hook to automatically push after commit
# Save as .git/hooks/post-commit

echo "🚀 Auto-pushing to GitHub..."

# Push to origin
git push origin main

if [ $? -eq 0 ]; then
    echo "✅ Successfully pushed to GitHub"
else
    echo "❌ Failed to push to GitHub"
    exit 1
fi

# Optional: Sync with cloud VM
if [ -f ".env.vm" ]; then
    source .env.vm
    echo "🔄 Syncing with cloud VM..."
    
    # Create a simple sync script
    cat > /tmp/sync-vm.sh << EOF
#!/bin/bash
cd /home/\$(whoami)/speakeasy || cd /opt/speakeasy || echo "Repository not found on VM"
git pull origin main
EOF
    
    # Copy and execute on VM
    gcloud compute scp /tmp/sync-vm.sh $GCP_VM_NAME:/tmp/sync-vm.sh --zone=$GCP_VM_ZONE
    gcloud compute ssh $GCP_VM_NAME --zone=$GCP_VM_ZONE --command="chmod +x /tmp/sync-vm.sh && /tmp/sync-vm.sh"
    
    echo "✅ VM sync completed"
fi
