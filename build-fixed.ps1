Write-Host "Building FuckNotion Desktop App (Fixed)" -ForegroundColor Green
Write-Host ""

Write-Host "Step 1: Install all dependencies..." -ForegroundColor Cyan
npm install

Write-Host "Step 2: Build headless package first..." -ForegroundColor Cyan
Set-Location packages/headless
npm run build
Set-Location ../..

Write-Host "Step 3: Build web app..." -ForegroundColor Cyan
Set-Location apps/web
$env:BUILD_MODE = "desktop"
npm run build
npm run export
Set-Location ../..

Write-Host "Step 4: Build Tauri app..." -ForegroundColor Cyan
Set-Location apps/desktop
npx tauri build
Set-Location ../..

Write-Host ""
Write-Host "Build completed! Check for output files:" -ForegroundColor Green
Write-Host "- Executable: apps/desktop/src-tauri/target/release/" -ForegroundColor Cyan
Write-Host "- Installer: apps/desktop/src-tauri/target/release/bundle/" -ForegroundColor Cyan