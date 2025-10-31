#
# SpeakEasy Web App Dockerfile
# ----------------------------
# Multi-stage build that bundles the Vite web client and serves it via
# a lightweight Express static server. Supports overriding the backend
# URL at build time by passing --build-arg BACKEND_URL=<url>.
#

# ---------- Build stage ----------
FROM node:20-bookworm-slim AS builder

WORKDIR /app

# Install dependencies (needs dev deps for Vite)
COPY package*.json ./
RUN npm ci

# Copy source files
COPY . .

# Allow overriding the backend URL used at build time
ARG BACKEND_URL=https://speakeasy-backend-823510409781.us-central1.run.app
ENV VITE_BACKEND_URL=${BACKEND_URL}
ENV EXPO_PUBLIC_BACKEND_URL=${BACKEND_URL}
ENV REACT_APP_API_URL=${BACKEND_URL}

# Build static assets with Vite
RUN npm run build:web:vite

# ---------- Runtime stage ----------
FROM node:20-slim AS runtime

WORKDIR /app

# Install only what the web server needs
RUN npm install express --production

# Copy the static build output and web server
COPY --from=builder /app/dist ./dist
COPY web-server.js .

# Environment
ENV NODE_ENV=production
ENV PORT=8080

# Expose port and run
EXPOSE 8080

CMD ["node", "web-server.js"]
