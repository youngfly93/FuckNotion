# Novel Pro Development Starter
# This script starts only the web components, skipping the desktop app that requires Rust

Write-Host "🚀 Starting FuckNotion Development Environment" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""

# Set UTF-8 encoding to prevent Tauri encoding issues
Write-Host "Setting UTF-8 encoding..." -ForegroundColor Yellow
chcp 65001 | Out-Null

# Check if we're in the right directory
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Error: package.json not found. Please run this script from the project root." -ForegroundColor Red
    exit 1
}

Write-Host "✅ Starting web development servers..." -ForegroundColor Green
Write-Host ""
Write-Host "📦 Novel Headless Package: Building in watch mode" -ForegroundColor Cyan
Write-Host "🌐 Novel Web App: Starting Next.js development server" -ForegroundColor Cyan
Write-Host ""

# Start the web development environment (excludes desktop app)
try {
    pnpm dev:web
} catch {
    Write-Host "❌ Failed to start development servers" -ForegroundColor Red
    Write-Host "💡 Try running: pnpm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 Development servers started successfully!" -ForegroundColor Green
Write-Host "🌐 Web app should be available at: http://localhost:3000" -ForegroundColor Cyan
Write-Host ""
Write-Host "💡 To start the desktop app, you need to install Rust first:" -ForegroundColor Yellow
Write-Host "   https://rustup.rs/" -ForegroundColor Yellow
