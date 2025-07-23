Write-Host "Manual Build Process for FuckNotion Desktop App" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Build web app manually..." -ForegroundColor Cyan
Set-Location apps/web

Write-Host "Setting BUILD_MODE=desktop and building..." -ForegroundColor Yellow
$env:BUILD_MODE = "desktop"
npm run build

Write-Host "Exporting static files..." -ForegroundColor Yellow
npm run export

Set-Location ../..
Write-Host "Web build completed." -ForegroundColor Green
Write-Host ""

Write-Host "Step 2: Build Tauri app..." -ForegroundColor Cyan
Set-Location apps/desktop

Write-Host "Building with Tauri..." -ForegroundColor Yellow
npx tauri build --verbose

Set-Location ../..
Write-Host ""
Write-Host "Build process completed!" -ForegroundColor Green
Write-Host "Check apps/desktop/src-tauri/target/release/bundle/ for installer files" -ForegroundColor Cyan