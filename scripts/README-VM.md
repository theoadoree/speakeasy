# Google Cloud VM Connection Scripts

This directory contains scripts to help you connect to Google Cloud VM instances and save connection details to environment variables.

## Scripts Overview

### 1. `open-gcloud-vm.sh` - Full VM Management
**Purpose**: Complete VM lifecycle management with environment variable export
**Features**:
- Creates new VM if it doesn't exist
- Starts existing VM if stopped
- Exports comprehensive environment variables
- Creates persistent environment file
- Interactive SSH connection option

**Usage**:
```bash
./scripts/open-gcloud-vm.sh
```

### 2. `connect-vm.sh` - Connect to Existing VM
**Purpose**: Connect to existing VM and set environment variables
**Features**:
- Connects to existing VM only
- Starts VM if stopped
- Exports environment variables
- Creates environment file
- Quick command reference

**Usage**:
```bash
./scripts/connect-vm.sh [vm-name] [zone]
# Examples:
./scripts/connect-vm.sh speakeasy-vm us-central1-a
./scripts/connect-vm.sh my-vm
```

### 3. `quick-vm.sh` - One-liner Connection
**Purpose**: Quick VM connection with minimal setup
**Features**:
- Minimal environment variables
- Direct SSH connection
- Fast execution

**Usage**:
```bash
./scripts/quick-vm.sh [vm-name]
# Examples:
./scripts/quick-vm.sh speakeasy-vm
./scripts/quick-vm.sh
```

## Environment Variables Set

All scripts set the following environment variables:

```bash
# VM Details
GCP_VM_NAME="speakeasy-vm"
GCP_VM_ZONE="us-central1-a"
GCP_VM_EXTERNAL_IP="34.123.45.67"
GCP_VM_INTERNAL_IP="10.128.0.2"
GCP_VM_ID="1234567890123456789"
GCP_PROJECT_ID="your-project-id"

# Connection Commands
GCP_VM_SSH_CMD="gcloud compute ssh speakeasy-vm --zone=us-central1-a"
GCP_VM_SCP_CMD="gcloud compute scp"

# Service URLs
VM_BACKEND_URL="http://34.123.45.67:8080"
VM_OLLAMA_URL="http://34.123.45.67:11434"
```

## Environment File

Scripts create/update `.env.vm` file in the project root:
```bash
# Location: /Users/scott/dev/speakeasy/.env.vm
# To reload in future sessions:
source .env.vm
```

## Prerequisites

1. **Google Cloud SDK installed**:
   ```bash
   curl https://sdk.cloud.google.com | bash
   exec -l $SHELL
   ```

2. **Authenticated with gcloud**:
   ```bash
   gcloud auth login
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Required APIs enabled**:
   ```bash
   gcloud services enable compute.googleapis.com
   ```

## Common Use Cases

### Development Setup
```bash
# Connect to development VM
./scripts/connect-vm.sh dev-vm

# Set up Ollama on VM
gcloud compute ssh dev-vm --zone=us-central1-a
curl -fsSL https://ollama.com/install.sh | sh
ollama serve
```

### Production Deployment
```bash
# Connect to production VM
./scripts/connect-vm.sh prod-vm

# Deploy backend to VM
gcloud compute scp backend/ prod-vm:~/speakeasy-backend --zone=us-central1-a --recurse
```

### Quick Testing
```bash
# Quick connection for testing
./scripts/quick-vm.sh test-vm
```

## VM Management Commands

### List VMs
```bash
gcloud compute instances list
```

### Start/Stop VM
```bash
gcloud compute instances start VM_NAME --zone=ZONE
gcloud compute instances stop VM_NAME --zone=ZONE
```

### Delete VM
```bash
gcloud compute instances delete VM_NAME --zone=ZONE
```

### Copy Files
```bash
# Copy to VM
gcloud compute scp local-file VM_NAME:remote-path --zone=ZONE

# Copy from VM
gcloud compute scp VM_NAME:remote-path local-file --zone=ZONE

# Copy directory
gcloud compute scp local-dir/ VM_NAME:remote-dir/ --zone=ZONE --recurse
```

## Integration with SpeakEasy

These scripts are designed to work with the SpeakEasy project:

1. **Backend Deployment**: Use VM URLs for backend API testing
2. **Ollama Setup**: Deploy Ollama LLM server on VM
3. **Development**: Test mobile app against VM-hosted services
4. **Production**: Deploy production services to VM

## Troubleshooting

### VM Not Found
```bash
# List available VMs
gcloud compute instances list

# Check zones
gcloud compute zones list
```

### SSH Connection Failed
```bash
# Check VM status
gcloud compute instances describe VM_NAME --zone=ZONE

# Wait for VM to start
gcloud compute instances start VM_NAME --zone=ZONE
```

### Permission Denied
```bash
# Check authentication
gcloud auth list

# Re-authenticate if needed
gcloud auth login
```

## Security Notes

- VMs are created with default firewall rules
- External IPs are assigned automatically
- Consider using VPC for production deployments
- Use service accounts for automated deployments

## Cost Optimization

- Stop VMs when not in use: `gcloud compute instances stop VM_NAME --zone=ZONE`
- Use preemptible instances for development: `--preemptible`
- Monitor usage in Google Cloud Console
- Set up billing alerts
