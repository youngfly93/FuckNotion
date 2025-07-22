# Novel Pro Full Development Starter
# This script starts all components including the desktop app that requires Rust

Write-Host "🚀 Starting FuckNotion Full Development Environment" -ForegroundColor Green
Write-Host "===================================================" -ForegroundColor Green
Write-Host ""

# Set UTF-8 encoding to prevent Tauri encoding issues
Write-Host "Setting UTF-8 encoding..." -ForegroundColor Yellow
chcp 65001 | Out-Null

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

# Set Rust environment variables
Write-Host "Setting up Rust environment..." -ForegroundColor Yellow
$env:CARGO_HOME = "D:\.cargo"
$env:RUSTUP_HOME = "D:\.rustup"
$env:PATH = "D:\.cargo\bin;" + $env:PATH

# Verify Rust installation
Write-Host "Verifying Rust installation..." -ForegroundColor Yellow
try {
    $rustupOutput = rustup default stable 2>&1
    Write-Host $rustupOutput -ForegroundColor Cyan
    
    $cargoVersion = cargo --version 2>&1
    Write-Host $cargoVersion -ForegroundColor Cyan
    
    Write-Host "✅ Rust environment verified" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to verify Rust installation" -ForegroundColor Red
    Write-Host "💡 Please install Rust from https://rustup.rs/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "✅ Starting all development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "📦 Novel Headless Package: Building in watch mode" -ForegroundColor Cyan
Write-Host "🌐 Novel Web App: Starting Next.js development server" -ForegroundColor Cyan
Write-Host "🖥️ Novel Desktop App: Starting Tauri development server" -ForegroundColor Cyan
Write-Host ""

# Start the full development environment
try {
    turbo dev
} catch {
    Write-Host "❌ Failed to start development servers" -ForegroundColor Red
    Write-Host "💡 Try running: pnpm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 All development servers started successfully!" -ForegroundColor Green
Write-Host "🌐 Web app should be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🖥️ Desktop app should open automatically" -ForegroundColor Cyan
