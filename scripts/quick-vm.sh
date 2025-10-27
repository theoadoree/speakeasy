#!/bin/bash
# One-liner to open GCloud VM and set environment variables
# Usage: ./quick-vm.sh [vm-name]

VM_NAME=${1:-"speakeasy-vm"}
ZONE="us-central1-a"

echo "Opening VM: $VM_NAME"

# Start VM if not running
gcloud compute instances start $VM_NAME --zone=$ZONE --quiet 2>/dev/null || true

# Get IP and export to environment
export GCP_VM_EXTERNAL_IP=$(gcloud compute instances describe $VM_NAME --zone=$ZONE --format="value(networkInterfaces[0].accessConfigs[0].natIP)")
export GCP_VM_NAME="$VM_NAME"
export GCP_VM_ZONE="$ZONE"
export VM_BACKEND_URL="http://$GCP_VM_EXTERNAL_IP:8080"
export VM_OLLAMA_URL="http://$GCP_VM_EXTERNAL_IP:11434"

echo "VM IP: $GCP_VM_EXTERNAL_IP"
echo "Backend URL: $VM_BACKEND_URL"
echo "Ollama URL: $VM_OLLAMA_URL"

# Connect to VM
gcloud compute ssh $VM_NAME --zone=$ZONE
