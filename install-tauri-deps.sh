#!/bin/bash

echo "Installing Tauri system dependencies for Ubuntu/Debian..."
echo "This script will install the required packages for running Tauri desktop applications."
echo ""
echo "The following packages will be installed:"
echo "- libwebkit2gtk-4.1-dev (or 4.0 as fallback)"
echo "- libappindicator3-dev"
echo "- librsvg2-dev"
echo "- patchelf"
echo "- build-essential"
echo "- Other required dependencies"
echo ""

# Update package list
echo "Updating package list..."
sudo apt update

# Install main dependencies
echo "Installing main dependencies..."
sudo apt install -y \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  librsvg2-dev \
  patchelf

# Try to install webkit2gtk 4.1 first, fallback to 4.0
echo "Installing WebKit2GTK..."
if sudo apt install -y libwebkit2gtk-4.1-dev; then
  echo "Successfully installed libwebkit2gtk-4.1-dev"
else
  echo "libwebkit2gtk-4.1-dev not found, trying 4.0 version..."
  sudo apt install -y libwebkit2gtk-4.0-dev
fi

# Try to install appindicator, with fallback to ayatana
echo "Installing AppIndicator..."
if sudo apt install -y libappindicator3-dev; then
  echo "Successfully installed libappindicator3-dev"
else
  echo "libappindicator3-dev not found, trying ayatana version..."
  sudo apt install -y libayatana-appindicator3-dev
fi

echo ""
echo "Installation complete! You can now run the Tauri desktop app with:"
echo "cd apps/desktop && pnpm dev"