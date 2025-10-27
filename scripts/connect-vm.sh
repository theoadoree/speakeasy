#!/bin/bash
# Quick script to open existing Google Cloud VM and save connection details to environment
# Usage: ./open-gcloud-vm.sh [vm-name] [zone]

set -e

# Default values
DEFAULT_VM_NAME="speakeasy-vm"
DEFAULT_ZONE="us-central1-a"

# Get VM name and zone from arguments or use defaults
VM_NAME=${1:-$DEFAULT_VM_NAME}
ZONE=${2:-$DEFAULT_ZONE}

echo "=== Opening Google Cloud VM ==="
echo "VM Name: $VM_NAME"
echo "Zone: $ZONE"
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project set"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Project: $PROJECT_ID"
echo ""

# Check if VM exists
if ! gcloud compute instances describe $VM_NAME --zone=$ZONE &>/dev/null; then
    echo "Error: VM '$VM_NAME' not found in zone '$ZONE'"
    echo ""
    echo "Available VMs:"
    gcloud compute instances list --format="table(name,zone,machineType,status,EXTERNAL_IP)"
    exit 1
fi

# Get VM status and start if needed
VM_STATUS=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)")
echo "VM Status: $VM_STATUS"

if [ "$VM_STATUS" != "RUNNING" ]; then
    echo "Starting VM..."
    gcloud compute instances start $VM_NAME --zone=$ZONE
    echo "VM started successfully"
fi

# Get VM connection details
echo ""
echo "Getting VM connection details..."

EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
INTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].networkIP)")
VM_ID=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(id)")

echo ""
echo "=== VM Connection Details ==="
echo "VM Name: $VM_NAME"
echo "Zone: $ZONE"
echo "External IP: $EXTERNAL_IP"
echo "Internal IP: $INTERNAL_IP"
echo "VM ID: $VM_ID"
echo ""

# Export environment variables to current shell
echo "Setting environment variables..."

export GCP_VM_NAME="$VM_NAME"
export GCP_VM_ZONE="$ZONE"
export GCP_VM_EXTERNAL_IP="$EXTERNAL_IP"
export GCP_VM_INTERNAL_IP="$INTERNAL_IP"
export GCP_VM_ID="$VM_ID"
export GCP_PROJECT_ID="$PROJECT_ID"
export GCP_VM_SSH_CMD="gcloud compute ssh $VM_NAME --zone=$ZONE"
export VM_BACKEND_URL="http://$EXTERNAL_IP:8080"
export VM_OLLAMA_URL="http://$EXTERNAL_IP:11434"

# Create/update environment file
ENV_FILE="/Users/scott/dev/speakeasy/.env.vm"
cat > $ENV_FILE << EOF
# Google Cloud VM Connection Details
# Generated on: $(date)

# VM Instance Details
export GCP_VM_NAME="$VM_NAME"
export GCP_VM_ZONE="$ZONE"
export GCP_VM_EXTERNAL_IP="$EXTERNAL_IP"
export GCP_VM_INTERNAL_IP="$INTERNAL_IP"
export GCP_VM_ID="$VM_ID"
export GCP_PROJECT_ID="$PROJECT_ID"

# Connection Commands
export GCP_VM_SSH_CMD="gcloud compute ssh $VM_NAME --zone=$ZONE"
export GCP_VM_SCP_CMD="gcloud compute scp"

# Service URLs
export VM_BACKEND_URL="http://$EXTERNAL_IP:8080"
export VM_OLLAMA_URL="http://$EXTERNAL_IP:11434"
EOF

echo "Environment variables saved to: $ENV_FILE"
echo ""

# Display current environment variables
echo "=== Current Environment Variables ==="
echo "GCP_VM_NAME: $GCP_VM_NAME"
echo "GCP_VM_EXTERNAL_IP: $GCP_VM_EXTERNAL_IP"
echo "GCP_VM_INTERNAL_IP: $GCP_VM_INTERNAL_IP"
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo "VM_BACKEND_URL: $VM_BACKEND_URL"
echo "VM_OLLAMA_URL: $VM_OLLAMA_URL"
echo ""

# Test SSH connection
echo "Testing SSH connection..."
if timeout 10 gcloud compute ssh $VM_NAME --zone=$ZONE --command="echo 'SSH connection successful'" --quiet 2>/dev/null; then
    echo "✅ SSH connection successful"
else
    echo "⚠️  SSH connection test failed (VM may still be starting)"
fi

echo ""
echo "=== Quick Commands ==="
echo "Connect to VM:     $GCP_VM_SSH_CMD"
echo "Copy to VM:        gcloud compute scp local-file $VM_NAME:remote-path --zone=$ZONE"
echo "Copy from VM:      gcloud compute scp $VM_NAME:remote-path local-file --zone=$ZONE"
echo "Stop VM:           gcloud compute instances stop $VM_NAME --zone=$ZONE"
echo "Delete VM:         gcloud compute instances delete $VM_NAME --zone=$ZONE"
echo ""

# Ask if user wants to connect
read -p "Connect to VM now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Connecting to VM..."
    gcloud compute ssh $VM_NAME --zone=$ZONE
else
    echo ""
    echo "To connect later, run:"
    echo "  source $ENV_FILE"
    echo "  $GCP_VM_SSH_CMD"
fi

echo ""
echo "✅ VM connection details saved to environment variables!"
