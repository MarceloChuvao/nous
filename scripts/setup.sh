#!/bin/bash

# NOUS OS - Setup Script
# This script automates the initial setup process

set -e  # Exit on error

echo "🚀 NOUS OS - Setup Script"
echo "========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Step 1: Check prerequisites
echo "📋 Step 1: Checking prerequisites..."

if ! command_exists node; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version must be 18 or higher (current: $NODE_VERSION)${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

if ! command_exists pnpm; then
    echo -e "${YELLOW}⚠ pnpm not found. Installing...${NC}"
    npm install -g pnpm@9.15.0
fi
echo -e "${GREEN}✓ pnpm $(pnpm -v)${NC}"

if ! command_exists firebase; then
    echo -e "${YELLOW}⚠ Firebase CLI not found. Installing...${NC}"
    npm install -g firebase-tools
fi
echo -e "${GREEN}✓ Firebase CLI $(firebase --version)${NC}"

echo ""

# Step 2: Install dependencies
echo "📦 Step 2: Installing dependencies..."
pnpm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Setup environment files
echo "🔧 Step 3: Setting up environment files..."

if [ ! -f .env.local ]; then
    cp .env.example .env.local
    echo -e "${YELLOW}⚠ .env.local created from template${NC}"
    echo "   Please edit .env.local with your Firebase credentials"
else
    echo -e "${GREEN}✓ .env.local already exists${NC}"
fi

if [ ! -f apps/lens/.env.local ]; then
    cp apps/lens/.env.example apps/lens/.env.local
    echo -e "${YELLOW}⚠ apps/lens/.env.local created from template${NC}"
else
    echo -e "${GREEN}✓ apps/lens/.env.local already exists${NC}"
fi

if [ ! -f apps/functions/.env.local ]; then
    cp apps/functions/.env.example apps/functions/.env.local
    echo -e "${YELLOW}⚠ apps/functions/.env.local created from template${NC}"
else
    echo -e "${GREEN}✓ apps/functions/.env.local already exists${NC}"
fi

echo ""

# Step 4: Firebase login
echo "🔐 Step 4: Firebase authentication..."
echo "Opening browser for Firebase login..."
firebase login
echo -e "${GREEN}✓ Firebase authenticated${NC}"
echo ""

# Step 5: Select Firebase project
echo "🔥 Step 5: Selecting Firebase project..."
echo "Please select your Firebase project:"
firebase use --add
echo -e "${GREEN}✓ Firebase project selected${NC}"
echo ""

# Step 6: Build project
echo "🏗️  Step 6: Building project..."
pnpm build
echo -e "${GREEN}✓ Project built successfully${NC}"
echo ""

# Done
echo "========================="
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Edit .env.local files with your Firebase credentials"
echo "2. Follow FIREBASE-SETUP.md for detailed Firebase configuration"
echo "3. Start development:"
echo ""
echo "   # Terminal 1: Start Firebase emulators"
echo "   firebase emulators:start"
echo ""
echo "   # Terminal 2: Start development servers"
echo "   pnpm dev"
echo ""
echo "Happy coding! 🎉"
