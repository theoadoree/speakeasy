FROM node:20-slim AS builder

WORKDIR /app

# Copy dependency manifests and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy application source and build the production web bundle
COPY . .

# Allow overriding the backend URL during the image build while providing a sensible default
ARG VITE_BACKEND_URL
ENV VITE_BACKEND_URL=${VITE_BACKEND_URL}
RUN npm run build:web

FROM node:20-slim AS runner

WORKDIR /app

# Copy package manifests and install the minimal runtime dependency set
COPY package*.json ./
RUN npm install express --production --no-save

# Copy the built assets and web server from the builder stage
COPY --from=builder /app/dist ./dist
COPY web-server.js ./

# Configure runtime environment
EXPOSE 8080
ENV PORT=8080
ENV NODE_ENV=production

CMD ["node", "web-server.js"]
