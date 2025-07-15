# 设置 Rust 环境变量
$env:RUSTUP_HOME = "D:\.rustup"
$env:CARGO_HOME = "D:\.cargo"
$env:PATH += ";D:\.cargo\bin"

# 验证 Rust 安装
Write-Host "验证 Rust 安装..." -ForegroundColor Green
cargo --version
rustc --version

# 启动开发服务器
Write-Host "启动 FuckNotion 开发环境..." -ForegroundColor Green
pnpm dev
