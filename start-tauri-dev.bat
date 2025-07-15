@echo off
echo Setting up Rust environment for Tauri...

REM Set Rust environment variables
set RUSTUP_HOME=D:\Rust\.rustup
set CARGO_HOME=D:\Rust\.cargo
set PATH=D:\Rust\.cargo\bin;%PATH%

echo Rust environment configured:
echo   RUSTUP_HOME: %RUSTUP_HOME%
echo   CARGO_HOME: %CARGO_HOME%

echo.
echo Starting Tauri development server...
cd apps\desktop
pnpm dev
