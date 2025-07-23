Write-Host "=== FuckNotion 桌面应用打包工具 ===" -ForegroundColor Green
Write-Host ""

# 检查环境
Write-Host "🔍 检查环境..." -ForegroundColor Cyan
Write-Host "Node.js: $(node --version)" -ForegroundColor White
Write-Host "pnpm: $(pnpm --version)" -ForegroundColor White
Write-Host "Rust: $(rustc --version)" -ForegroundColor White
Write-Host ""

# 第一步：安装依赖
Write-Host "📦 安装项目依赖..." -ForegroundColor Cyan
try {
    pnpm install
    Write-Host "✅ 依赖安装成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 依赖安装失败: $_" -ForegroundColor Red
    exit 1
}
Write-Host ""

# 第二步：构建 web 应用
Write-Host "🌐 构建 web 应用..." -ForegroundColor Cyan
try {
    Set-Location "apps/web"
    
    Write-Host "执行 next build (desktop mode)..." -ForegroundColor Yellow
    $env:BUILD_MODE = "desktop"
    pnpm build
    
    Write-Host "执行 next export..." -ForegroundColor Yellow
    pnpm export
    
    Set-Location "../.."
    Write-Host "✅ Web 应用构建成功" -ForegroundColor Green
} catch {
    Write-Host "❌ Web 应用构建失败: $_" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Write-Host ""

# 第三步：构建桌面应用
Write-Host "🖥️ 构建桌面应用..." -ForegroundColor Cyan
try {
    Set-Location "apps/desktop"
    
    # 设置 Rust 环境变量（如果需要）
    if (Test-Path "D:\.cargo") {
        $env:CARGO_HOME = "D:\.cargo"
        $env:RUSTUP_HOME = "D:\.rustup"
        Write-Host "使用自定义 Rust 路径: D:\.cargo" -ForegroundColor Yellow
    }
    
    Write-Host "执行 tauri build..." -ForegroundColor Yellow
    npx tauri build
    
    Set-Location "../.."
    Write-Host "✅ 桌面应用构建成功" -ForegroundColor Green
} catch {
    Write-Host "❌ 桌面应用构建失败: $_" -ForegroundColor Red
    Set-Location "../.."
    exit 1
}
Write-Host ""

# 第四步：显示结果
Write-Host "📂 构建结果:" -ForegroundColor Cyan
$buildPath = "apps/desktop/src-tauri/target/release"
if (Test-Path $buildPath) {
    $files = Get-ChildItem $buildPath -Name "*.exe", "*.msi", "*.dmg", "*.AppImage", "*.deb" -ErrorAction SilentlyContinue
    foreach ($file in $files) {
        Write-Host "  📦 $buildPath/$file" -ForegroundColor White
    }
    if (-not $files) {
        Write-Host "  ⚠️ 未找到打包文件，检查 bundle 目录..." -ForegroundColor Yellow
        $bundlePath = "$buildPath/bundle"
        if (Test-Path $bundlePath) {
            Get-ChildItem $bundlePath -Recurse -Name "*.exe", "*.msi" | ForEach-Object {
                Write-Host "  📦 $bundlePath/$_" -ForegroundColor White
            }
        }
    }
} else {
    Write-Host "  ⚠️ 构建目录不存在，请检查构建过程" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "🎉 桌面应用打包完成!" -ForegroundColor Green
Write-Host ""
Write-Host "说明:" -ForegroundColor Cyan
Write-Host "• Windows: 查找 .exe 和 .msi 安装包" -ForegroundColor White
Write-Host "• 可执行文件通常在: apps/desktop/src-tauri/target/release/" -ForegroundColor White
Write-Host "• 安装包通常在: apps/desktop/src-tauri/target/release/bundle/" -ForegroundColor White