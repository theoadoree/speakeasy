#!/bin/bash
# Open Google Cloud VM and save connection details to environment variables
# This script creates a VM instance, connects to it, and exports connection details

set -e

echo "=== Google Cloud VM Connection Script ==="
echo ""

# Check if gcloud is installed and authenticated
if ! command -v gcloud &> /dev/null; then
    echo "Error: gcloud CLI is not installed"
    echo "Install from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Check if user is authenticated
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "Error: Not authenticated with gcloud"
    echo "Run: gcloud auth login"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "Error: No project set"
    echo "Run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi

echo "Current project: $PROJECT_ID"
echo ""

# VM Configuration
VM_NAME="speakeasy-vm"
ZONE="us-central1-a"
MACHINE_TYPE="n1-standard-2"
BOOT_DISK_SIZE="50GB"
IMAGE_FAMILY="ubuntu-2204-lts"
IMAGE_PROJECT="ubuntu-os-cloud"

# Check if VM already exists
if gcloud compute instances describe $VM_NAME --zone=$ZONE &>/dev/null; then
    echo "VM '$VM_NAME' already exists in zone '$ZONE'"
    
    # Get VM status
    VM_STATUS=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(status)")
    echo "VM Status: $VM_STATUS"
    
    if [ "$VM_STATUS" = "RUNNING" ]; then
        echo "VM is already running"
    else
        echo "Starting VM..."
        gcloud compute instances start $VM_NAME --zone=$ZONE
        echo "VM started successfully"
    fi
else
    echo "Creating new VM instance..."
    
    # Create VM instance
    gcloud compute instances create $VM_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --boot-disk-size=$BOOT_DISK_SIZE \
        --image-family=$IMAGE_FAMILY \
        --image-project=$IMAGE_PROJECT \
        --tags=speakeasy-vm \
        --metadata=startup-script='#!/bin/bash
apt-get update
apt-get install -y curl wget git vim htop
echo "VM setup complete"' \
        --scopes=https://www.googleapis.com/auth/cloud-platform
    
    echo "VM created successfully"
fi

# Get VM details
echo ""
echo "Getting VM connection details..."

# Get external IP
EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")

# Get internal IP
INTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].networkIP)")

# Get VM ID
VM_ID=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(id)")

# Get creation timestamp
CREATION_TIME=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(creationTimestamp)")

echo ""
echo "=== VM Connection Details ==="
echo "VM Name: $VM_NAME"
echo "Zone: $ZONE"
echo "External IP: $EXTERNAL_IP"
echo "Internal IP: $INTERNAL_IP"
echo "VM ID: $VM_ID"
echo "Creation Time: $CREATION_TIME"
echo ""

# Export environment variables
echo "Exporting environment variables..."

# Create environment file
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
export GCP_VM_CREATION_TIME="$CREATION_TIME"

# Project Details
export GCP_PROJECT_ID="$PROJECT_ID"

# Connection Commands
export GCP_VM_SSH_CMD="gcloud compute ssh $VM_NAME --zone=$ZONE"
export GCP_VM_SCP_CMD="gcloud compute scp"

# Service URLs (if running services on VM)
export VM_BACKEND_URL="http://$EXTERNAL_IP:8080"
export VM_OLLAMA_URL="http://$EXTERNAL_IP:11434"
EOF

echo "Environment variables saved to: $ENV_FILE"
echo ""

# Source the environment file
echo "Loading environment variables into current shell..."
source $ENV_FILE

echo ""
echo "=== Environment Variables Set ==="
echo "GCP_VM_NAME: $GCP_VM_NAME"
echo "GCP_VM_EXTERNAL_IP: $GCP_VM_EXTERNAL_IP"
echo "GCP_VM_INTERNAL_IP: $GCP_VM_INTERNAL_IP"
echo "GCP_PROJECT_ID: $GCP_PROJECT_ID"
echo ""

# Test SSH connection
echo "Testing SSH connection..."
if gcloud compute ssh $VM_NAME --zone=$ZONE --command="echo 'SSH connection successful'" --quiet; then
    echo "✅ SSH connection successful"
else
    echo "❌ SSH connection failed"
    echo "You may need to wait a moment for the VM to fully boot"
fi

echo ""
echo "=== Next Steps ==="
echo "1. To connect to the VM:"
echo "   gcloud compute ssh $VM_NAME --zone=$ZONE"
echo ""
echo "2. To copy files to/from VM:"
echo "   gcloud compute scp local-file $VM_NAME:remote-path --zone=$ZONE"
echo "   gcloud compute scp $VM_NAME:remote-path local-file --zone=$ZONE"
echo ""
echo "3. To stop the VM:"
echo "   gcloud compute instances stop $VM_NAME --zone=$ZONE"
echo ""
echo "4. To delete the VM:"
echo "   gcloud compute instances delete $VM_NAME --zone=$ZONE"
echo ""
echo "5. To reload environment variables in future sessions:"
echo "   source $ENV_FILE"
echo ""

# Optional: Open SSH connection
read -p "Do you want to open an SSH connection to the VM now? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "Opening SSH connection..."
    gcloud compute ssh $VM_NAME --zone=$ZONE
fi

echo ""
echo "=== Script Complete ==="
echo "VM connection details have been saved to environment variables"
echo "Environment file: $ENV_FILE"
