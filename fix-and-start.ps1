# Fix encoding and dependency issues, then start development servers
Write-Host "Setting UTF-8 encoding..." -ForegroundColor Green
chcp 65001 | Out-Null

Write-Host "Cleaning up problematic directories..." -ForegroundColor Yellow
try {
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "apps\web\node_modules") {
        Remove-Item -Path "apps\web\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "apps\desktop\node_modules") {
        Remove-Item -Path "apps\desktop\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    if (Test-Path "packages\headless\node_modules") {
        Remove-Item -Path "packages\headless\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
} catch {
    Write-Host "Some files couldn't be removed, continuing..." -ForegroundColor Yellow
}

Write-Host "Installing dependencies..." -ForegroundColor Green
pnpm install --no-frozen-lockfile

Write-Host "Starting development servers..." -ForegroundColor Green
pnpm turbo dev
