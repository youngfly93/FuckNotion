# Setup Rust Environment for D Drive Installation
# Run this script before using Rust commands if environment variables aren't set

Write-Host "🦀 Setting up Rust environment..." -ForegroundColor Green

# Set Rust environment variables
$env:RUSTUP_HOME = "D:\Rust\.rustup"
$env:CARGO_HOME = "D:\Rust\.cargo"
$env:PATH = "D:\Rust\.cargo\bin;$env:PATH"

Write-Host "✅ Rust environment configured:" -ForegroundColor Green
Write-Host "   RUSTUP_HOME: $env:RUSTUP_HOME" -ForegroundColor Cyan
Write-Host "   CARGO_HOME: $env:CARGO_HOME" -ForegroundColor Cyan
Write-Host "   Cargo bin added to PATH" -ForegroundColor Cyan

# Verify
try {
    $cargoVersion = cargo --version
    $rustcVersion = rustc --version
    Write-Host "✅ Verification successful:" -ForegroundColor Green
    Write-Host "   $cargoVersion" -ForegroundColor Yellow
    Write-Host "   $rustcVersion" -ForegroundColor Yellow
} catch {
    Write-Host "❌ Verification failed: $($_.Exception.Message)" -ForegroundColor Red
}
