// Omarchy App Launcher / Root Menu (Super + Space)
// Features fuzzy search across Applications, Themes, System Tools, and Omarchy Manual Chapters

import { sound } from "./sound.js";

export class Launcher {
  constructor({ containerElem, appManager, themeManager, compositor, screensaver }) {
    this.container = containerElem;
    this.appManager = appManager;
    this.themeManager = themeManager;
    this.compositor = compositor;
    this.screensaver = screensaver;

    this.isOpen = false;
    this.selectedIndex = 0;
    this.items = [];
    this.filteredItems = [];

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.buildCatalog();
  }

  render() {
    this.container.innerHTML = `
      <div class="qs-launcher-backdrop" id="launcher-backdrop">
        <div class="qs-launcher-box" id="launcher-box">
          <div class="qs-launcher-input-row">
            <span class="qs-launcher-search-icon">🔍</span>
            <input type="text" id="launcher-search-input" placeholder="Search applications, themes, tools, or manual..." autofocus autocomplete="off" />
            <span class="qs-launcher-badge">Super + Space</span>
          </div>
          <div class="qs-launcher-list" id="launcher-list"></div>
          <div class="qs-launcher-footer">
            <span>↑↓ Navigate</span>
            <span>↵ Launch</span>
            <span>Esc Close</span>
          </div>
        </div>
      </div>
    `;
    this.container.style.display = "none";
  }

  buildCatalog() {
    this.items = [
      // Core Apps
      { id: "terminal", title: "Ghostty Terminal", category: "Core Apps", icon: "💻", shortcut: "Super + Return", action: () => this.appManager.launch("terminal") },
      { id: "agent", title: "Agentic OS - AI Assistant", category: "Agentic AI", icon: "🤖", shortcut: "Super + Shift + A", action: () => this.appManager.launch("agent") },
      { id: "neovim", title: "Neovim IDE", category: "Development", icon: "⚡", shortcut: "Super + Shift + N", action: () => this.appManager.launch("neovim") },
      { id: "btop", title: "btop System Monitor", category: "System Tools", icon: "📊", shortcut: "btop", action: () => this.appManager.launch("btop") },
      { id: "manual", title: "Omarchy Manual (51 Chapters)", category: "Documentation", icon: "📖", shortcut: "", action: () => this.appManager.launch("manual") },
      { id: "new-webapp", title: "Turn Website into App (omarchy app)", category: "System Tools", icon: "🌐", shortcut: "omarchy app", action: () => this.promptNewWebApp() },

      // Preinstalled Web Apps
      { id: "webapp-github", title: "GitHub", category: "Web Apps", icon: "🐙", shortcut: "Super + Shift + Return", action: () => this.appManager.launch("webapp-github") },
      { id: "webapp-basecamp", title: "Basecamp", category: "Web Apps", icon: "⛺", shortcut: "", action: () => this.appManager.launch("webapp-basecamp") },
      { id: "webapp-hey-email", title: "HEY Email", category: "Web Apps", icon: "✉", shortcut: "Super + Shift + E", action: () => this.appManager.launch("webapp-email") },
      { id: "webapp-hey-calendar", title: "HEY Calendar", category: "Web Apps", icon: "📅", shortcut: "Super + Shift + C", action: () => this.appManager.launch("webapp-calendar") },
      { id: "webapp-youtube", title: "YouTube", category: "Web Apps", icon: "▶", shortcut: "Super + Shift + Y", action: () => this.appManager.launch("webapp-youtube") },
      { id: "webapp-x", title: "X (Twitter)", category: "Web Apps", icon: "𝕏", shortcut: "Super + Shift + X", action: () => this.appManager.launch("webapp-x") },

      // Themes
      { id: "theme-tokyo", title: "Theme: Tokyo Night (Official Default)", category: "Themes", icon: "🎨", shortcut: "", action: () => this.themeManager.setTheme("tokyo-night") },
      { id: "theme-rose", title: "Theme: Rosé Pine", category: "Themes", icon: "🌸", shortcut: "", action: () => this.themeManager.setTheme("rose-pine") },
      { id: "theme-catppuccin", title: "Theme: Catppuccin Mocha", category: "Themes", icon: "☕", shortcut: "", action: () => this.themeManager.setTheme("catppuccin") },
      { id: "theme-gruvbox", title: "Theme: Gruvbox Material", category: "Themes", icon: "🍂", shortcut: "", action: () => this.themeManager.setTheme("gruvbox") },
      { id: "theme-hackerman", title: "Theme: Hackerman (Matrix Cyber)", category: "Themes", icon: "🟩", shortcut: "", action: () => this.themeManager.setTheme("hackerman") },
      { id: "theme-everforest", title: "Theme: Everforest Nature", category: "Themes", icon: "🌲", shortcut: "", action: () => this.themeManager.setTheme("everforest") },
      { id: "theme-nord", title: "Theme: Nord Arctic", category: "Themes", icon: "❄", shortcut: "", action: () => this.themeManager.setTheme("nord") },
      { id: "theme-vantablack", title: "Theme: Vantablack OLED", category: "Themes", icon: "⬛", shortcut: "", action: () => this.themeManager.setTheme("vantablack") },
      { id: "theme-starship", title: "Theme: Starship Space", category: "Themes", icon: "🚀", shortcut: "", action: () => this.themeManager.setTheme("starship") },
      { id: "theme-kanagawa", title: "Theme: Kanagawa Wave", category: "Themes", icon: "🌊", shortcut: "", action: () => this.themeManager.setTheme("kanagawa") },
      { id: "theme-latte", title: "Theme: Catppuccin Latte (Light)", category: "Themes", icon: "🥛", shortcut: "", action: () => this.themeManager.setTheme("catppuccin-latte") },
      { id: "theme-retro", title: "Theme: Retro 82 Vaporwave", category: "Themes", icon: "🌆", shortcut: "", action: () => this.themeManager.setTheme("retro-82") },

      // System Controls
      { id: "next-bg", title: "Switch Wallpaper (Next Background)", category: "System Controls", icon: "🖼", shortcut: "Super + Ctrl + Space", action: () => this.themeManager.nextWallpaper() },
      { id: "toggle-gaps", title: "Toggle Window Gaps", category: "System Controls", icon: "⧉", shortcut: "Super + Shift + Backspace", action: () => this.compositor.toggleGaps() },
      { id: "toggle-split", title: "Toggle Master/Stack Split Layout", category: "System Controls", icon: "⇄", shortcut: "Super + J", action: () => this.compositor.toggleSplit() },
      { id: "lock-screen", title: "Lock Screen / Screensaver", category: "System Controls", icon: "🔒", shortcut: "Super + Esc", action: () => this.screensaver.activate() }
    ];

    this.filteredItems = [...this.items];
  }

  bindEvents() {
    const input = document.getElementById("launcher-search-input");
    const backdrop = document.getElementById("launcher-backdrop");
    const list = document.getElementById("launcher-list");

    backdrop.addEventListener("click", (e) => {
      if (e.target === backdrop) {
        this.close();
      }
    });

    input.addEventListener("input", () => {
      this.filterItems(input.value.trim().toLowerCase());
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex + 1) % this.filteredItems.length;
        this.updateSelection();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        this.selectedIndex = (this.selectedIndex - 1 + this.filteredItems.length) % this.filteredItems.length;
        this.updateSelection();
      } else if (e.key === "Enter") {
        e.preventDefault();
        this.executeSelected();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this.close();
      }
    });

    list.addEventListener("click", (e) => {
      const itemElem = e.target.closest(".qs-launcher-item");
      if (itemElem) {
        const idx = parseInt(itemElem.dataset.index);
        this.selectedIndex = idx;
        this.executeSelected();
      }
    });
  }

  filterItems(query) {
    if (!query) {
      this.filteredItems = [...this.items];
    } else {
      this.filteredItems = this.items.filter(item => {
        return item.title.toLowerCase().includes(query) ||
               item.category.toLowerCase().includes(query) ||
               (item.shortcut && item.shortcut.toLowerCase().includes(query));
      });
    }
    this.selectedIndex = 0;
    this.renderList();
  }

  renderList() {
    const list = document.getElementById("launcher-list");
    if (this.filteredItems.length === 0) {
      list.innerHTML = `<div class="qs-launcher-empty">No matching applications or tools found</div>`;
      return;
    }

    list.innerHTML = this.filteredItems.map((item, idx) => `
      <div class="qs-launcher-item ${idx === this.selectedIndex ? 'selected' : ''}" data-index="${idx}">
        <span class="qs-launcher-item-icon">${item.icon}</span>
        <div class="qs-launcher-item-info">
          <div class="qs-launcher-item-title">${item.title}</div>
          <div class="qs-launcher-item-cat">${item.category}</div>
        </div>
        ${item.shortcut ? `<span class="qs-launcher-item-key">${item.shortcut}</span>` : ''}
      </div>
    `).join("");

    this.scrollSelectedIntoView();
  }

  updateSelection() {
    const list = document.getElementById("launcher-list");
    const itemElems = list.querySelectorAll(".qs-launcher-item");
    itemElems.forEach((el, idx) => {
      if (idx === this.selectedIndex) {
        el.classList.add("selected");
      } else {
        el.classList.remove("selected");
      }
    });
    this.scrollSelectedIntoView();
  }

  scrollSelectedIntoView() {
    const list = document.getElementById("launcher-list");
    const selectedElem = list.querySelector(".qs-launcher-item.selected");
    if (selectedElem) {
      selectedElem.scrollIntoView({ block: "nearest" });
    }
  }

  executeSelected() {
    if (this.filteredItems.length > 0 && this.filteredItems[this.selectedIndex]) {
      const item = this.filteredItems[this.selectedIndex];
      this.close();
      sound.playSnap();
      if (item.action) {
        item.action();
      }
    }
  }

  promptNewWebApp() {
    const url = prompt("Enter web application URL to turn into desktop app:", "https://chatgpt.com");
    if (!url) return;
    const name = prompt("Enter Application Name:", "My Web App") || "Web App";
    this.appManager.createCustomWebApp(name, url);
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    this.isOpen = true;
    this.container.style.display = "flex";
    const input = document.getElementById("launcher-search-input");
    input.value = "";
    this.filterItems("");
    setTimeout(() => input.focus(), 50);
  }

  close() {
    this.isOpen = false;
    this.container.style.display = "none";
  }
}
