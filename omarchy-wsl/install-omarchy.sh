#!/usr/bin/env bash
# Omarchy Linux (Micro-Distro Overlay Installer for WSL & Linux)
# Installs complete Omarchy toolchain, CLI, fastfetch, and configs with < 10MB disk usage!

set -eo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
TARGET_DIR="$HOME/.local/share/omarchy"
BIN_DIR="$HOME/.local/bin"

echo "======================================================"
echo "  OMARCHY LINUX — THE AGENTIC OS (MICRO-DISTRO)"
echo "======================================================"
echo "Installing Omarchy CLI and configurations..."

mkdir -p "$TARGET_DIR" "$BIN_DIR" "$HOME/.config" "$HOME/.local/state/omarchy"

# Copy CLI binaries
cp -r "$SCRIPT_DIR/bin" "$TARGET_DIR/"
chmod +x "$TARGET_DIR/bin/"*

# Symlink binaries into ~/.local/bin
for b in "$TARGET_DIR/bin/"*; do
  base=$(basename "$b")
  ln -sf "$b" "$BIN_DIR/$base"
done

# Copy configurations
if [[ -d "$SCRIPT_DIR/config/fastfetch" ]]; then
  mkdir -p "$HOME/.config/fastfetch"
  cp -r "$SCRIPT_DIR/config/fastfetch/"* "$HOME/.config/fastfetch/"
fi

if [[ -f "$SCRIPT_DIR/config/starship.toml" ]]; then
  cp "$SCRIPT_DIR/config/starship.toml" "$HOME/.config/starship.toml"
fi

if [[ -d "$SCRIPT_DIR/config/nvim" ]]; then
  mkdir -p "$HOME/.config/nvim"
  cp -r "$SCRIPT_DIR/config/nvim/"* "$HOME/.config/nvim/"
fi

# Ensure ~/.local/bin is in PATH in .bashrc and .zshrc
PATH_LINE='export PATH="$HOME/.local/bin:$PATH"; export OMARCHY_PATH="$HOME/.local/share/omarchy"'

for rc in "$HOME/.bashrc" "$HOME/.zshrc"; do
  if [[ -f "$rc" ]]; then
    if ! grep -q "OMARCHY_PATH" "$rc"; then
      echo "" >> "$rc"
      echo "# Omarchy Linux Toolchain" >> "$rc"
      echo "$PATH_LINE" >> "$rc"
      echo "alias om='omarchy'" >> "$rc"
    fi
  fi
done

echo ""
echo "✔ Omarchy Linux Micro-Distro installation complete!"
echo "  Storage consumed: < 10 Megabytes"
echo ""
echo "Try running:"
echo "  omarchy info"
echo "  omarchy theme list"
echo "  omarchy agent"
echo "======================================================"
