#!/bin/bash
# Local deployment script using Docker Compose
# Use this for local development and testing

set -e

echo "=== SpeakEasy Local Deployment ==="
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "Error: Docker is not running"
    echo "Please start Docker Desktop and try again"
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "Error: docker-compose is not installed"
    echo "Install from: https://docs.docker.com/compose/install/"
    exit 1
fi

# Build and start services
echo "Building Docker images..."
docker-compose build

echo ""
echo "Starting services..."
docker-compose up -d

echo ""
echo "Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "Checking service status..."
docker-compose ps

echo ""
echo "=== Deployment Complete! ==="
echo ""
echo "Services running at:"
echo "  - Ollama LLM: http://localhost:11434"
echo "  - Backend API: http://localhost:8080"
echo "  - Web App: http://localhost:80"
echo ""
echo "To view logs: docker-compose logs -f"
echo "To stop: docker-compose down"
echo ""

# Download models if needed
echo "Do you want to download language models now? (y/n)"
read -r response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    echo "Downloading llama3.1:8b..."
    docker exec speakeasy-llm ollama pull llama3.1:8b

    echo "Downloading qwen2.5:72b..."
    docker exec speakeasy-llm ollama pull qwen2.5:72b

    echo ""
    echo "Models downloaded successfully!"
fi

echo ""
echo "Local deployment ready! 🚀"
