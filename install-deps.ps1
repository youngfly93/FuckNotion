Write-Host "Installing dependencies..." -ForegroundColor Green
pnpm install

Write-Host "Dependencies installed successfully!" -ForegroundColor Green
Write-Host "IndexedDB storage system has been added to the project." -ForegroundColor Cyan
Write-Host ""
Write-Host "New features added:" -ForegroundColor Yellow
Write-Host "- IndexedDB-based storage with Dexie.js" -ForegroundColor White
Write-Host "- Automatic data migration from localStorage" -ForegroundColor White
Write-Host "- Enhanced storage hooks (usePages, useEnhancedStorage)" -ForegroundColor White
Write-Host "- Export functionality (JSON, Markdown, HTML, Obsidian)" -ForegroundColor White
Write-Host "- Data management UI components" -ForegroundColor White
Write-Host ""
Write-Host "To start development:" -ForegroundColor Yellow
Write-Host "pnpm dev" -ForegroundColor White