#!/bin/bash

# SpeakEasy Auth API Installation Script

echo "🚀 Installing SpeakEasy Authentication API..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Install dependencies from auth-api-package.json
echo "📦 Installing dependencies..."
npm install --save express cors dotenv jsonwebtoken bcrypt google-auth-library apple-signin-auth firebase-admin axios express-validator helmet morgan winston

echo "📦 Installing dev dependencies..."
npm install --save-dev nodemon jest

# Create logs directory
echo "📁 Creating logs directory..."
mkdir -p logs

# Check if .env exists
if [ ! -f .env ]; then
    echo "⚠️  .env file not found"
    echo "📄 Copying .env.example to .env..."
    cp .env.example .env
    echo "⚠️  Please edit .env file with your configuration"
else
    echo "✅ .env file exists"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "📝 Next steps:"
echo "1. Edit .env file with your credentials:"
echo "   - Firebase credentials"
echo "   - Apple Sign In keys"
echo "   - JWT secret (change the default!)"
echo ""
echo "2. Start the server:"
echo "   npm run dev     # Development mode with auto-reload"
echo "   npm start       # Production mode"
echo ""
echo "3. Test the API:"
echo "   curl http://localhost:8080/health"
echo ""
