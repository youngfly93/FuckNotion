# Complete Novel Pro Development Environment Starter
# Includes Rust environment setup and all development servers

Write-Host "🚀 Starting Complete FuckNotion Development Environment" -ForegroundColor Green
Write-Host "====================================================" -ForegroundColor Green
Write-Host ""

# Set UTF-8 encoding
Write-Host "🔧 Setting UTF-8 encoding..." -ForegroundColor Yellow
chcp 65001 | Out-Null

# Setup Rust environment
Write-Host "🦀 Setting up Rust environment..." -ForegroundColor Green
$env:RUSTUP_HOME = "D:\Rust\.rustup"
$env:CARGO_HOME = "D:\Rust\.cargo"
$env:PATH = "D:\Rust\.cargo\bin;$env:PATH"

# Verify Rust installation
Write-Host "🔍 Verifying Rust installation..." -ForegroundColor Green
try {
    $cargoVersion = cargo --version
    $rustcVersion = rustc --version
    Write-Host "✅ Rust environment ready:" -ForegroundColor Green
    Write-Host "   $cargoVersion" -ForegroundColor Cyan
    Write-Host "   $rustcVersion" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Rust not found. Please run install-rust-to-d.ps1 first" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🚀 Starting all development servers..." -ForegroundColor Green
Write-Host "📦 Novel Headless Package: Building in watch mode" -ForegroundColor Cyan
Write-Host "🌐 Novel Web App: Starting Next.js development server" -ForegroundColor Cyan
Write-Host "🖥️  Novel Desktop App: Starting Tauri development server" -ForegroundColor Cyan
Write-Host ""

# Set environment variables permanently for this session and child processes
[Environment]::SetEnvironmentVariable("RUSTUP_HOME", "D:\Rust\.rustup", "Process")
[Environment]::SetEnvironmentVariable("CARGO_HOME", "D:\Rust\.cargo", "Process")
[Environment]::SetEnvironmentVariable("PATH", "D:\Rust\.cargo\bin;$env:PATH", "Process")

# Start the complete development environment
try {
    pnpm dev
} catch {
    Write-Host "❌ Failed to start development servers" -ForegroundColor Red
    Write-Host "💡 Try running: pnpm install" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎉 All development servers started successfully!" -ForegroundColor Green
Write-Host "🌐 Web app: http://localhost:3000" -ForegroundColor Cyan
Write-Host "🖥️  Desktop app: Will open automatically" -ForegroundColor Cyan
