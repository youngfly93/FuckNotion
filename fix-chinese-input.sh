#!/bin/bash

echo "Fixing Chinese input method for Tauri desktop app..."

# Install fcitx and Chinese input methods
echo "Installing fcitx and Chinese input methods..."
sudo apt update
sudo apt install -y fcitx fcitx-pinyin fcitx-googlepinyin fcitx-config-gtk dbus-x11

# Set up environment variables
echo "Setting up environment variables..."
cat >> ~/.bashrc << 'EOF'

# Fcitx input method settings
export GTK_IM_MODULE=fcitx
export QT_IM_MODULE=fcitx
export XMODIFIERS=@im=fcitx
export DefaultIMModule=fcitx
export DISPLAY=:0
EOF

# Create fcitx autostart script
mkdir -p ~/.config/autostart
cat > ~/.config/autostart/fcitx.desktop << 'EOF'
[Desktop Entry]
Type=Application
Name=Fcitx
Exec=fcitx -d
Hidden=false
NoDisplay=false
X-GNOME-Autostart-enabled=true
EOF

echo ""
echo "Installation complete!"
echo ""
echo "Next steps:"
echo "1. Restart your terminal or run: source ~/.bashrc"
echo "2. Start fcitx: fcitx -d"
echo "3. Configure input methods: fcitx-config-gtk3"
echo "4. Add Chinese input method (Pinyin) in the configuration"
echo "5. Restart the Tauri app"
echo ""
echo "Use Ctrl+Space to switch between English and Chinese input"