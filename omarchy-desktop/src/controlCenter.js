// Omarchy Control Center Component
// Flyout drawer for theme switching, wallpaper picking, audio toggles, and system controls

import { THEMES } from "./themes.js";
import { sound } from "./sound.js";

export class ControlCenter {
  constructor({ containerElem, themeManager, compositor, screensaver }) {
    this.container = containerElem;
    this.themeManager = themeManager;
    this.compositor = compositor;
    this.screensaver = screensaver;

    this.isOpen = false;
    this.nightLight = false;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.themeManager.subscribe(() => this.updateActiveThemeHighlight());
  }

  render() {
    this.container.innerHTML = `
      <div class="qs-cc-drawer" id="qs-cc-drawer">
        <div class="qs-cc-header">
          <div class="qs-cc-title">
            <span>⚙</span> Omarchy Control Center
          </div>
          <button class="qs-cc-close" id="qs-cc-close">✕</button>
        </div>

        <!-- Quick Toggles -->
        <div class="qs-cc-section">
          <div class="qs-cc-section-title">Quick Settings</div>
          <div class="qs-cc-grid">
            <button class="qs-cc-tile ${this.nightLight ? 'active' : ''}" id="tile-nightlight">
              <span class="qs-cc-tile-icon">🌙</span>
              <span class="qs-cc-tile-label">Night Light</span>
            </button>
            <button class="qs-cc-tile active" id="tile-sound">
              <span class="qs-cc-tile-icon">🔊</span>
              <span class="qs-cc-tile-label">Sound FX</span>
            </button>
            <button class="qs-cc-tile active" id="tile-clicks">
              <span class="qs-cc-tile-icon">⌨</span>
              <span class="qs-cc-tile-label">Key Thock</span>
            </button>
            <button class="qs-cc-tile active" id="tile-gaps">
              <span class="qs-cc-tile-icon">⧉</span>
              <span class="qs-cc-tile-label">Window Gaps</span>
            </button>
          </div>
        </div>

        <!-- Themes Selector -->
        <div class="qs-cc-section">
          <div class="qs-cc-section-title">Omarchy Themes (${Object.keys(THEMES).length})</div>
          <div class="qs-cc-themes-list" id="qs-cc-themes-list">
            ${Object.values(THEMES).map(t => `
              <div class="qs-cc-theme-card ${t.name === this.themeManager.currentThemeName ? 'active' : ''}" data-theme="${t.name}">
                <div class="qs-cc-swatch" style="background: ${t.background}; border: 2px solid ${t.accent};">
                  <span style="background: ${t.accent};"></span>
                  <span style="background: ${t.red || t.accent};"></span>
                  <span style="background: ${t.green || t.accent};"></span>
                </div>
                <div class="qs-cc-theme-name">${t.displayName}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Wallpaper Gallery for current theme -->
        <div class="qs-cc-section">
          <div class="qs-cc-section-title">Theme Wallpapers</div>
          <div class="qs-cc-wallpapers" id="qs-cc-wallpapers"></div>
        </div>

        <!-- System Actions -->
        <div class="qs-cc-section">
          <div class="qs-cc-section-title">Power & Session</div>
          <div class="qs-cc-actions">
            <button class="qs-cc-action-btn" id="btn-lock">
              <span>🔒</span> Lock Screen
            </button>
            <button class="qs-cc-action-btn" id="btn-screensaver">
              <span>🌌</span> Screensaver
            </button>
            <button class="qs-cc-action-btn" id="btn-restart">
              <span>🔄</span> Reload Shell
            </button>
          </div>
        </div>
      </div>
    `;

    this.renderWallpapers();
    this.container.style.display = "none";
  }

  bindEvents() {
    const closeBtn = document.getElementById("qs-cc-close");
    closeBtn.addEventListener("click", () => this.close());

    // Theme card clicks
    const themeList = document.getElementById("qs-cc-themes-list");
    themeList.addEventListener("click", (e) => {
      const card = e.target.closest(".qs-cc-theme-card");
      if (card) {
        const theme = card.dataset.theme;
        this.themeManager.setTheme(theme);
        sound.playSnap();
        this.renderWallpapers();
      }
    });

    // Wallpaper clicks
    const wpList = document.getElementById("qs-cc-wallpapers");
    wpList.addEventListener("click", (e) => {
      const card = e.target.closest(".qs-cc-wp-card");
      if (card) {
        const idx = parseInt(card.dataset.index);
        this.themeManager.setWallpaper(idx);
        sound.playSnap();
        this.renderWallpapers();
      }
    });

    // Night Light toggle
    const nlBtn = document.getElementById("tile-nightlight");
    nlBtn.addEventListener("click", () => {
      this.nightLight = !this.nightLight;
      nlBtn.classList.toggle("active", this.nightLight);
      let filter = document.getElementById("omarchy-nightlight-overlay");
      if (this.nightLight) {
        if (!filter) {
          filter = document.createElement("div");
          filter.id = "omarchy-nightlight-overlay";
          filter.className = "omarchy-nightlight-overlay";
          document.body.appendChild(filter);
        }
      } else {
        if (filter) filter.remove();
      }
    });

    // Sound FX toggle
    const soundBtn = document.getElementById("tile-sound");
    soundBtn.addEventListener("click", () => {
      const en = sound.toggle();
      soundBtn.classList.toggle("active", en);
    });

    // Key clicks toggle
    const clicksBtn = document.getElementById("tile-clicks");
    clicksBtn.addEventListener("click", () => {
      const en = sound.toggleKeyboard();
      clicksBtn.classList.toggle("active", en);
    });

    // Gaps toggle
    const gapsBtn = document.getElementById("tile-gaps");
    gapsBtn.addEventListener("click", () => {
      this.compositor.toggleGaps();
      gapsBtn.classList.toggle("active", this.compositor.gaps);
    });

    // Lock & Screensaver
    document.getElementById("btn-lock").addEventListener("click", () => {
      this.close();
      this.screensaver.activate();
    });

    document.getElementById("btn-screensaver").addEventListener("click", () => {
      this.close();
      this.screensaver.activate();
    });

    document.getElementById("btn-restart").addEventListener("click", () => {
      location.reload();
    });

    // Click outside to close
    document.addEventListener("click", (e) => {
      if (this.isOpen && !e.target.closest("#qs-cc-drawer") && !e.target.closest("#qs-control-trigger")) {
        this.close();
      }
    });
  }

  renderWallpapers() {
    const wpList = document.getElementById("qs-cc-wallpapers");
    if (!wpList) return;

    const theme = this.themeManager.currentTheme;
    wpList.innerHTML = theme.wallpapers.map((wp, idx) => `
      <div class="qs-cc-wp-card ${idx === this.themeManager.currentWallpaperIndex ? 'active' : ''}" data-index="${idx}">
        <img src="${wp}" alt="Wallpaper ${idx + 1}" />
        <span>#${idx + 1}</span>
      </div>
    `).join("");
  }

  updateActiveThemeHighlight() {
    const cards = this.container.querySelectorAll(".qs-cc-theme-card");
    cards.forEach(card => {
      if (card.dataset.theme === this.themeManager.currentThemeName) {
        card.classList.add("active");
      } else {
        card.classList.remove("active");
      }
    });
    this.renderWallpapers();
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
    this.container.style.display = "block";
    sound.playSnap();
  }

  close() {
    this.isOpen = false;
    this.container.style.display = "none";
  }
}
