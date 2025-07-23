Write-Host "Building FuckNotion Desktop App..." -ForegroundColor Green

Write-Host "Step 1: Installing dependencies..." -ForegroundColor Cyan
pnpm install

Write-Host "Step 2: Building web app..." -ForegroundColor Cyan
Set-Location apps/web
$env:BUILD_MODE = "desktop"
pnpm build
pnpm export
Set-Location ../..

Write-Host "Step 3: Building desktop app..." -ForegroundColor Cyan
Set-Location apps/desktop
npx tauri build
Set-Location ../..

Write-Host "Build completed! Check apps/desktop/src-tauri/target/release/ for output files." -ForegroundColor Green