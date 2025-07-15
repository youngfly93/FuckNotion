# Rust Installation Script for D Drive
# This script downloads and installs Rust to D:\Rust instead of the default C drive location

Write-Host "🦀 Rust Installation Script for D Drive" -ForegroundColor Green
Write-Host "=======================================" -ForegroundColor Green
Write-Host ""

# Set installation paths
$RUSTUP_HOME = "D:\Rust\.rustup"
$CARGO_HOME = "D:\Rust\.cargo"
$RUST_INSTALLER = "$env:TEMP\rustup-init.exe"

Write-Host "📁 Installation directories:" -ForegroundColor Cyan
Write-Host "   RUSTUP_HOME: $RUSTUP_HOME" -ForegroundColor Yellow
Write-Host "   CARGO_HOME: $CARGO_HOME" -ForegroundColor Yellow
Write-Host ""

# Create directories if they don't exist
Write-Host "📂 Creating installation directories..." -ForegroundColor Green
try {
    New-Item -ItemType Directory -Path "D:\Rust" -Force | Out-Null
    New-Item -ItemType Directory -Path $RUSTUP_HOME -Force | Out-Null
    New-Item -ItemType Directory -Path $CARGO_HOME -Force | Out-Null
    Write-Host "✅ Directories created successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to create directories: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Set environment variables for this session
Write-Host "🔧 Setting environment variables..." -ForegroundColor Green
$env:RUSTUP_HOME = $RUSTUP_HOME
$env:CARGO_HOME = $CARGO_HOME

# Download rustup-init.exe
Write-Host "⬇️  Downloading Rust installer..." -ForegroundColor Green
try {
    $ProgressPreference = 'SilentlyContinue'  # Hide progress bar for faster download
    Invoke-WebRequest -Uri "https://win.rustup.rs/x86_64" -OutFile $RUST_INSTALLER
    Write-Host "✅ Rust installer downloaded successfully" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to download Rust installer: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Install Rust
Write-Host "🚀 Installing Rust..." -ForegroundColor Green
Write-Host "   This may take a few minutes..." -ForegroundColor Yellow
try {
    # Run rustup-init with custom paths and default toolchain
    & $RUST_INSTALLER --default-toolchain stable --profile default --no-modify-path -y
    Write-Host "✅ Rust installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install Rust: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Add to PATH for current session
Write-Host "🔧 Adding Rust to PATH..." -ForegroundColor Green
$env:PATH = "$CARGO_HOME\bin;$env:PATH"

# Set permanent environment variables
Write-Host "🔧 Setting permanent environment variables..." -ForegroundColor Green
try {
    [Environment]::SetEnvironmentVariable("RUSTUP_HOME", $RUSTUP_HOME, "User")
    [Environment]::SetEnvironmentVariable("CARGO_HOME", $CARGO_HOME, "User")
    
    # Get current user PATH
    $currentPath = [Environment]::GetEnvironmentVariable("PATH", "User")
    $cargoPath = "$CARGO_HOME\bin"
    
    # Add cargo bin to PATH if not already present
    if ($currentPath -notlike "*$cargoPath*") {
        $newPath = "$cargoPath;$currentPath"
        [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
        Write-Host "✅ Added $cargoPath to user PATH" -ForegroundColor Green
    } else {
        Write-Host "✅ Cargo bin already in PATH" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Warning: Failed to set permanent environment variables: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   You may need to set them manually" -ForegroundColor Yellow
}

# Clean up installer
Write-Host "🧹 Cleaning up..." -ForegroundColor Green
Remove-Item $RUST_INSTALLER -ErrorAction SilentlyContinue

# Verify installation
Write-Host "🔍 Verifying installation..." -ForegroundColor Green
try {
    $rustcVersion = & "$CARGO_HOME\bin\rustc.exe" --version 2>$null
    $cargoVersion = & "$CARGO_HOME\bin\cargo.exe" --version 2>$null
    
    Write-Host "✅ Installation verification:" -ForegroundColor Green
    Write-Host "   $rustcVersion" -ForegroundColor Cyan
    Write-Host "   $cargoVersion" -ForegroundColor Cyan
} catch {
    Write-Host "⚠️  Warning: Could not verify installation" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Rust installation completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Restart your PowerShell/Terminal" -ForegroundColor Yellow
Write-Host "   2. Run: cargo --version" -ForegroundColor Yellow
Write-Host "   3. Run: pnpm dev (to start the full development environment)" -ForegroundColor Yellow
Write-Host ""
Write-Host "📁 Installation location: D:\Rust" -ForegroundColor Cyan
Write-Host "🔧 Cargo binaries: $CARGO_HOME\bin" -ForegroundColor Cyan
