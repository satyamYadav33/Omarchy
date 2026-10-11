// Omarchy Desktop Bootstrapper & App Manager
// Ties together Hyprland compositor, Quickshell bar, Theme engine, Apps, and Keybindings

import { ThemeManager } from "./themes.js";
import { HyprlandCompositor } from "./compositor.js";
import { QuickshellBar } from "./topbar.js";
import { Launcher } from "./launcher.js";
import { ControlCenter } from "./controlCenter.js";
import { ScreensaverApp } from "./screensaver.js";
import { KeybindingManager } from "./keybindings.js";
import { sound } from "./sound.js";

import { TerminalApp } from "./terminal.js";
import { AgentApp } from "./agent.js";
import { NeovimApp } from "./neovim.js";
import { BtopApp } from "./btop.js";
import { ManualApp } from "./manual.js";
import { WebAppRunner } from "./webapp.js";

class AppManager {
  constructor() {
    this.themeManager = null;
    this.compositor = null;
    this.quickshellBar = null;
    this.screensaver = null;
  }

  setContext({ themeManager, compositor, quickshellBar, screensaver }) {
    this.themeManager = themeManager;
    this.compositor = compositor;
    this.quickshellBar = quickshellBar;
    this.screensaver = screensaver;
  }

  launch(appId) {
    switch (appId) {
      case "terminal":
        return this.compositor.createWindow({
          title: "Ghostty - omarchy@satyam:~",
          icon: "💻",
          appType: "terminal",
          renderContent: (content) => new TerminalApp(content, {
            themeManager: this.themeManager,
            appManager: this,
            compositor: this.compositor,
            quickshellBar: this.quickshellBar,
            screensaver: this.screensaver
          })
        });

      case "agent":
        return this.compositor.createWindow({
          title: "Agentic OS - AI Coding Assistant",
          icon: "🤖",
          appType: "agent",
          renderContent: (content) => new AgentApp(content, {
            themeManager: this.themeManager,
            appManager: this,
            compositor: this.compositor,
            quickshellBar: this.quickshellBar
          })
        });

      case "neovim":
        return this.compositor.createWindow({
          title: "Neovim - [hyprland.lua]",
          icon: "⚡",
          appType: "neovim",
          renderContent: (content) => new NeovimApp(content, {
            themeManager: this.themeManager
          })
        });

      case "btop":
        return this.compositor.createWindow({
          title: "btop - System Hardware Monitor",
          icon: "📊",
          appType: "btop",
          renderContent: (content) => new BtopApp(content)
        });

      case "manual":
        return this.compositor.createWindow({
          title: "The Omarchy Manual (51 Chapters)",
          icon: "📖",
          appType: "manual",
          renderContent: (content) => new ManualApp(content)
        });

      case "webapp-github":
        return this.createCustomWebApp("GitHub", "https://github.com", "🐙");

      case "webapp-basecamp":
        return this.createCustomWebApp("Basecamp", "https://basecamp.com", "⛺");

      case "webapp-email":
        return this.createCustomWebApp("HEY Email", "https://app.hey.com", "✉");

      case "webapp-calendar":
        return this.createCustomWebApp("HEY Calendar", "https://app.hey.com/calendar/weeks/", "📅");

      case "webapp-youtube":
        return this.createCustomWebApp("YouTube", "https://www.youtube.com", "▶");

      case "webapp-x":
        return this.createCustomWebApp("X (Twitter)", "https://x.com", "𝕏");

      default:
        console.warn(`Unknown application ID: ${appId}`);
    }
  }

  createCustomWebApp(name, url, icon = "🌐") {
    return this.compositor.createWindow({
      title: `${name} — WebApp`,
      icon,
      appType: "webapp",
      renderContent: (content) => new WebAppRunner(content, {
        title: name,
        url,
        icon
      })
    });
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Initialize Theme Manager
  const themeManager = new ThemeManager("tokyo-night");
  themeManager.applyTheme();

  // 2. Initialize Compositor
  const desktopElem = document.getElementById("hypr-desktop");
  const compositor = new HyprlandCompositor(desktopElem);

  // 3. Initialize App Manager
  const appManager = new AppManager();

  // 4. Initialize Screensaver
  const screensaverOverlay = document.getElementById("screensaver-overlay");
  const screensaver = new ScreensaverApp(screensaverOverlay, { themeManager });

  // 5. Initialize Quickshell Bar
  const barElem = document.getElementById("quickshell-bar");
  let quickshellBar;

  // 6. Initialize Launcher & Control Center
  const launcherOverlay = document.getElementById("launcher-overlay");
  const launcher = new Launcher({
    containerElem: launcherOverlay,
    appManager,
    themeManager,
    compositor,
    screensaver
  });

  const ccOverlay = document.getElementById("control-center-overlay");
  const controlCenter = new ControlCenter({
    containerElem: ccOverlay,
    themeManager,
    compositor,
    screensaver
  });

  quickshellBar = new QuickshellBar({
    barElem,
    compositor,
    themeManager,
    launcher,
    controlCenter,
    appManager
  });

  appManager.setContext({
    themeManager,
    compositor,
    quickshellBar,
    screensaver
  });

  // 7. Initialize Global Keybindings Dispatcher
  new KeybindingManager({
    compositor,
    launcher,
    appManager,
    themeManager,
    controlCenter,
    screensaver
  });

  // 8. Boot initial windows (DHH-style setup: Terminal + AI Agent side-by-side)
  setTimeout(() => {
    appManager.launch("terminal");
    appManager.launch("agent");
    sound.playBootChime();
  }, 100);

  console.log("Omarchy Linux Hyper-Distro Desktop Initialized Successfully!");
});
