# NOUS OS - Setup Script (PowerShell)
# This script automates the initial setup process for Windows

$ErrorActionPreference = "Stop"

Write-Host "🚀 NOUS OS - Setup Script" -ForegroundColor Cyan
Write-Host "=========================" -ForegroundColor Cyan
Write-Host ""

# Function to check if command exists
function Test-CommandExists {
    param($command)
    $null = Get-Command $command -ErrorAction SilentlyContinue
    return $?
}

# Step 1: Check prerequisites
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow

if (-not (Test-CommandExists node)) {
    Write-Host "❌ Node.js is not installed" -ForegroundColor Red
    Write-Host "Please install Node.js 18+ from https://nodejs.org/"
    exit 1
}

$nodeVersion = (node -v).TrimStart('v').Split('.')[0]
if ([int]$nodeVersion -lt 18) {
    Write-Host "❌ Node.js version must be 18 or higher (current: $nodeVersion)" -ForegroundColor Red
    exit 1
}
Write-Host "✓ Node.js $(node -v)" -ForegroundColor Green

if (-not (Test-CommandExists pnpm)) {
    Write-Host "⚠ pnpm not found. Installing..." -ForegroundColor Yellow
    npm install -g pnpm@9.15.0
}
Write-Host "✓ pnpm $(pnpm -v)" -ForegroundColor Green

if (-not (Test-CommandExists firebase)) {
    Write-Host "⚠ Firebase CLI not found. Installing..." -ForegroundColor Yellow
    npm install -g firebase-tools
}
Write-Host "✓ Firebase CLI installed" -ForegroundColor Green

Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Step 2: Installing dependencies..." -ForegroundColor Yellow
pnpm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Setup environment files
Write-Host "🔧 Step 3: Setting up environment files..." -ForegroundColor Yellow

if (-not (Test-Path .env.local)) {
    Copy-Item .env.example .env.local
    Write-Host "⚠ .env.local created from template" -ForegroundColor Yellow
    Write-Host "   Please edit .env.local with your Firebase credentials"
} else {
    Write-Host "✓ .env.local already exists" -ForegroundColor Green
}

if (-not (Test-Path apps\lens\.env.local)) {
    Copy-Item apps\lens\.env.example apps\lens\.env.local
    Write-Host "⚠ apps\lens\.env.local created from template" -ForegroundColor Yellow
} else {
    Write-Host "✓ apps\lens\.env.local already exists" -ForegroundColor Green
}

if (-not (Test-Path apps\functions\.env.local)) {
    Copy-Item apps\functions\.env.example apps\functions\.env.local
    Write-Host "⚠ apps\functions\.env.local created from template" -ForegroundColor Yellow
} else {
    Write-Host "✓ apps\functions\.env.local already exists" -ForegroundColor Green
}

Write-Host ""

# Step 4: Firebase login
Write-Host "🔐 Step 4: Firebase authentication..." -ForegroundColor Yellow
Write-Host "Opening browser for Firebase login..."
firebase login
Write-Host "✓ Firebase authenticated" -ForegroundColor Green
Write-Host ""

# Step 5: Select Firebase project
Write-Host "🔥 Step 5: Selecting Firebase project..." -ForegroundColor Yellow
Write-Host "Please select your Firebase project:"
firebase use --add
Write-Host "✓ Firebase project selected" -ForegroundColor Green
Write-Host ""

# Step 6: Build project
Write-Host "🏗️  Step 6: Building project..." -ForegroundColor Yellow
pnpm build
Write-Host "✓ Project built successfully" -ForegroundColor Green
Write-Host ""

# Done
Write-Host "=========================" -ForegroundColor Cyan
Write-Host "✅ Setup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Edit .env.local files with your Firebase credentials"
Write-Host "2. Follow FIREBASE-SETUP.md for detailed Firebase configuration"
Write-Host "3. Start development:"
Write-Host ""
Write-Host "   # Terminal 1: Start Firebase emulators"
Write-Host "   firebase emulators:start"
Write-Host ""
Write-Host "   # Terminal 2: Start development servers"
Write-Host "   pnpm dev"
Write-Host ""
Write-Host "Happy coding! 🎉" -ForegroundColor Cyan
