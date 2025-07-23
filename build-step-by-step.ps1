Write-Host "Step-by-Step Desktop Build Process" -ForegroundColor Green
Write-Host ""

Write-Host "Installing dependencies..." -ForegroundColor Cyan
& npm install
if ($LASTEXITCODE -ne 0) { Write-Host "Dependency installation failed" -ForegroundColor Red; exit 1 }

Write-Host "Building web app..." -ForegroundColor Cyan
Set-Location apps/web
$env:BUILD_MODE = "desktop"
& npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "Web build failed" -ForegroundColor Red; Set-Location ../..; exit 1 }

Write-Host "Exporting web app..." -ForegroundColor Cyan  
& npm run export
if ($LASTEXITCODE -ne 0) { Write-Host "Web export failed" -ForegroundColor Red; Set-Location ../..; exit 1 }

Set-Location ../..

Write-Host "Building Tauri desktop app..." -ForegroundColor Cyan
Set-Location apps/desktop

Write-Host "Running tauri build..." -ForegroundColor Yellow
& npx tauri build

Set-Location ../..
Write-Host "Build process completed!" -ForegroundColor Green