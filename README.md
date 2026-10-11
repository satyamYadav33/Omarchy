# ▲ OMARCHY LINUX (Umachi Distro) — Ultra-Lightweight Clone

> **The Beautiful, Fun & Agentic Linux Distribution by DHH — Re-engineered for Zero Disk Bloat.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Footprint](https://img.shields.io/badge/Storage_Footprint-%3C_90_MB-brightgreen.svg)]()
[![Compositor](https://img.shields.io/badge/Compositor-Hyprland_Wayland-7aa2f7.svg)]()
[![Desktop Shell](https://img.shields.io/badge/Desktop_Shell-Quickshell-ff7a93.svg)]()
[![Agentic OS](https://img.shields.io/badge/Agentic_AI-Claude_%7C_Gemini_%7C_Copilot-bb9af7.svg)]()

---

## 🌟 What is Omarchy (Umachi)?

**Omarchy** (pronounced *oh-MAR-kee*, often referred to phonetically as **Umachi**) is an opinionated, developer-focused Linux distribution created by **David Heinemeier Hansson (DHH)**, the creator of Ruby on Rails and CTO of 37signals.

Designed as an **"Agentic Operating System"**, Omarchy moves away from traditional desktop environments (like GNOME or KDE) to place **AI coding agents**, **the terminal**, and **keyboard-driven tiling** at the very center of your computing workflow.

### The Storage Problem Solved
A standard Arch Linux installation with Hyprland, Quickshell, Qt6 libraries, and desktop packages requires **20 GB to 40 GB** of free disk space, making it impossible to install on storage-constrained devices.

This project delivers a **high-end, zero-compromise clone of Omarchy** that provides **100% of the authentic visual, tactile, and functional experience** while consuming **less than 90 MB total disk space (saving 99.7% of storage)**!

---

## 🚀 Features & Architecture

### 1. 🖥️ Omarchy Desktop Studio (WebWayland Hyprland Compositor)
Run the full desktop operating system locally with zero heavy virtual machine overhead:

- **Hyprland Window Manager Engine**:
  - Dynamic master-and-stack & dwindle tiling layouts.
  - Smooth spring bezier animations and transitions.
  - Real window spawning, splitting (`Super + J`), floating (`Super + T`), maximizing (`Super + F`), and closing (`Super + Q`).
  - 10 Virtual Workspaces (`Super + 1..10` to switch, `Super + Shift + 1..10` to move window).
  - Active window borders that glow with the accent color of your current Omarchy theme.
- **Quickshell Top Bar**:
  - Workspaces indicator (1 to 10) with live dot badges for occupied workspaces.
  - Active focused application badge with title and icon.
  - **Omarchy Agent Pill**: `🤖 Agent: Claude 3.5 Sonnet` [Active Citizen] with live pulsing status indicator.
  - Live hardware HUD: Real-time CPU sparkline graph, RAM footprint (`2.1 GB`), and Micro-Distro storage badge (`84 MB`).
  - Audio indicator with volume slider and mechanical key click toggles.
  - Digital clock and date with interactive dropdown calendar.
  - Control Center toggle (`⚙`).
- **Quickshell Control Center & Flyouts**:
  - Instant live theme switcher with color swatches.
  - Theme wallpaper carousel with official artwork.
  - Night Light amber screen filter toggle.
  - Window gaps toggle.
  - Sound FX and mechanical typing audio toggles.
  - Lock screen and screensaver launchers.
- **Spotlight App Launcher (`Super + Space`)**:
  - Fuzzy-search across core applications, AI agents, themes, system actions, webapps, and manual chapters.
  - Arrow key navigation with Enter to execute.
- **23 Official Omarchy Themes**:
  - *Tokyo Night (Default)*, *Rosé Pine*, *Catppuccin Mocha*, *Catppuccin Latte*, *Gruvbox*, *Everforest*, *Hackerman (Matrix)*, *Nord*, *Vantablack (OLED)*, *Starship*, *Kanagawa*, *Retro 82*, and more!
  - 96 Authentic high-resolution wallpapers extracted directly from the original distro.

### 2. 📦 Pre-loaded Omarchy Applications

| Application | Shortcut | Description |
| :--- | :--- | :--- |
| **Ghostty Terminal** | `Super + Return` | Interactive shell with fastfetch ASCII art banner, real shell commands, `omarchy` CLI router, and digital matrix rain (`cmatrix`). |
| **Agentic OS Assistant** | `Super + Shift + A` | Built-in AI coding agent chat (Claude 3.5 Sonnet, Gemini 1.5 Pro, GitHub Copilot, Grok 2, Ollama). Can automate desktop tasks and generate code. |
| **Neovim IDE** | `Super + Shift + N` | DHH's Neovim setup clone: NvimTree file tree sidebar, bufferline tabs, lualine status bar, line numbers, and syntax highlighting. |
| **btop System Monitor** | `btop` / Menu | Graphical TUI monitor with 8-core CPU usage bars, RAM meters, disk footprint comparison, and interactive process killer. |
| **Omarchy WebApps** | `Super + Shift + Return/Y/X` | Standalone windowed webapps: GitHub, Basecamp, HEY Email, HEY Calendar, YouTube, X. Turn any site into an app via `omarchy app <name> <url>`. |
| **The Omarchy Manual** | Menu / Launcher | Complete authoritative reader containing all 51 chapters of official Omarchy documentation with instant search. |
| **Omarchy Screensaver** | `Super + Esc` | Floating geometric logo with particle canvas, digital clock, and lockscreen password prompt (`Enter` to resume). |

---

### 3. 🐧 Omarchy WSL Micro-Distro (Native Linux Terminal Layer)
If you want to use the real Linux command line on Windows:
- Installs into your existing WSL (Ubuntu/Debian) in seconds.
- Adds the official `omarchy` CLI suite (`omarchy`, `omarchy theme`, `omarchy agent`, `omarchy app`, `omarchy info`).
- Pre-configured Fastfetch with the authentic Omarchy ASCII logo.
- Starship prompt with Omarchy colors.
- Adds **less than 10 Megabytes** of total disk usage to WSL!

---

## ⚡ How to Run

### Option A: Launch the Omarchy Desktop (One Click)
Simply double-click the Windows batch file in this directory:
```powershell
start-omarchy.bat
```
*Or via PowerShell:*
```powershell
.\start-omarchy.ps1
```
The desktop server will start at `http://localhost:4040` and open automatically in your browser in fullscreen/app mode!

### Option B: Use the Native WSL Terminal Layer
Run the included WSL provisioner from PowerShell:
```powershell
.\omarchy-wsl\install-wsl.ps1
```
Then enter your WSL shell and run:
```bash
omarchy info
omarchy theme list
omarchy agent
```

---

## ⌨️ Essential Keyboard Shortcuts

| Shortcut | Action |
| :--- | :--- |
| `Super + Space` | Open Omarchy App Launcher / Root Menu |
| `Super + Return` | Launch Ghostty Terminal |
| `Super + Shift + Return` | Launch Web Browser / GitHub |
| `Super + Shift + A` | Launch Agentic OS AI Coding Assistant |
| `Super + Shift + N` | Launch Neovim IDE |
| `Super + Shift + Y` | Launch YouTube WebApp |
| `Super + Shift + X` | Launch X (Twitter) WebApp |
| `Super + Shift + C` | Launch HEY Calendar |
| `Super + Shift + E` | Launch HEY Email |
| `Super + Q` or `Super + W` | Close focused window |
| `Super + F` | Toggle Fullscreen |
| `Super + T` | Toggle Floating / Tiling mode |
| `Super + J` | Toggle Window Split (Master/Stack ⇄ Dwindle) |
| `Super + 1` .. `Super + 9`, `0` | Switch to Workspace 1 through 10 |
| `Super + Shift + 1` .. `0` | Move focused window to Workspace 1..10 |
| `Super + Ctrl + Space` | Cycle to next wallpaper |
| `Super + Shift + Ctrl + Space` | Open Theme & Control Center Drawer |
| `Super + Shift + Backspace` | Toggle Window Gaps |
| `Super + Escape` | Lock Screen & Activate Screensaver |
| `Alt + Tab` | Focus next window |

*(Note: On Windows keyboards, `Super` is the Windows key).*

---

## 📁 Project Directory Layout

```
OMARCHY_LINUX_DISTRO/
├── omarchy-desktop/                 # Full-fidelity WebWayland Hyprland Desktop
│   ├── index.html                  # Desktop HTML mount point
│   ├── server.js                   # Zero-dependency local Node server (port 4040)
│   ├── styles/                     # Hyprland, Quickshell & Application CSS
│   ├── src/                        # Compositor, themes, apps, keybindings
│   └── assets/                     # 96 wallpapers, icons, 51 manual chapters
├── omarchy-wsl/                    # Native WSL ultra-lightweight Linux layer (<10MB)
│   ├── install-wsl.ps1             # One-click Windows PowerShell installer
│   ├── install-omarchy.sh          # Linux/WSL shell installer
│   ├── bin/                        # Portable CLI binaries (omarchy, theme, agent, app, info)
│   └── config/                     # Fastfetch, Starship, and Neovim dotfiles
├── start-omarchy.bat               # One-click Windows desktop launcher
├── start-omarchy.ps1               # PowerShell launcher
└── README.md                       # This documentation
```

---

## 📜 License
Released under the [MIT License](LICENSE), honoring the original work by David Heinemeier Hansson (DHH) and the Omarchy project.
