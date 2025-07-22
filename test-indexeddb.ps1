Write-Host "Testing IndexedDB Storage System..." -ForegroundColor Green
Write-Host ""

# 启动开发服务器
Write-Host "Starting development server..." -ForegroundColor Yellow
Write-Host "Please wait while the server initializes..."
Write-Host ""

# 显示测试步骤
Write-Host "Manual Testing Steps:" -ForegroundColor Cyan
Write-Host "1. Open browser to http://localhost:3000" -ForegroundColor White
Write-Host "2. Check console for 'IndexedDB initialized successfully'" -ForegroundColor White
Write-Host "3. Look for migration messages if you had existing data" -ForegroundColor White
Write-Host "4. Visit http://localhost:3000/storage-test to test functionality" -ForegroundColor White
Write-Host "5. Visit http://localhost:3000/settings to access data management" -ForegroundColor White
Write-Host ""

Write-Host "Console checks:" -ForegroundColor Cyan
Write-Host "- Press F12 -> Application -> Storage -> IndexedDB -> FuckNotionDB" -ForegroundColor White
Write-Host "- Check Console tab for initialization logs" -ForegroundColor White
Write-Host ""

Write-Host "Starting server now..." -ForegroundColor Green
pnpm dev