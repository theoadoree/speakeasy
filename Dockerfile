# SpeakEasy LLM Server - Docker Image
# Production-ready Ollama server with Qwen2.5-72B + Llama 4-8B

FROM ollama/ollama:latest

# Set environment variables
ENV OLLAMA_HOST=0.0.0.0
ENV OLLAMA_MODELS=/root/.ollama/models

# Create models directory
RUN mkdir -p /root/.ollama/models

# Expose Ollama port
EXPOSE 11434

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5m --retries=3 \
  CMD curl -f http://localhost:11434/api/tags || exit 1

# Start Ollama server and pull models
CMD ollama serve & \
    sleep 10 && \
    echo "Pulling Qwen2.5-72B model (this may take a while)..." && \
    ollama pull qwen2.5:72b && \
    echo "Pulling Llama 3.3-8B model..." && \
    ollama pull llama3.3:8b && \
    echo "Models ready!" && \
    wait
