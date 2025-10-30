FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (express)
RUN npm install express --production

# Copy dist folder and server
COPY dist ./dist
COPY web-server.js ./

# Expose port
EXPOSE 8080

# Set environment
ENV PORT=8080
ENV NODE_ENV=production

# Start server
CMD ["node", "web-server.js"]
