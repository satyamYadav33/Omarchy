// Omarchy Manual Browser Component
// Full interactive documentation reader containing all 51 authoritative chapters of Omarchy

import { sound } from "./sound.js";

export class ManualApp {
  constructor(contentElem) {
    this.container = contentElem;
    this.chapters = [];
    this.activeChapterIndex = 0;

    this.init();
  }

  async init() {
    this.renderLoading();
    try {
      const res = await fetch("assets/manual/manual.json");
      if (res.ok) {
        this.chapters = await res.json();
      }
    } catch (e) {
      console.warn("Could not load manual.json via fetch, using bundled chapters:", e);
    }

    if (this.chapters.length === 0) {
      this.chapters = [
        {
          filename: "01-welcome-to-omarchy.md",
          title: "Welcome to Omarchy!",
          content: "# Welcome to Omarchy!\n\nOmarchy is an opinionated, agentic, and beautiful Linux distribution created by David Heinemeier Hansson (DHH).\n\nBuilt on Arch Linux with Hyprland and Quickshell, it puts keyboard shortcuts, AI coding agents, and the terminal at the center of your workstation."
        },
        {
          filename: "07-hotkeys.md",
          title: "Hotkeys",
          content: "# Hotkeys in Omarchy\n\n- `Super + Return` : Launch Terminal\n- `Super + Space` : Omarchy Menu / App Launcher\n- `Super + Shift + A` : AI Coding Agent\n- `Super + Shift + N` : Neovim IDE\n- `Super + Q` / `Super + W` : Close Window\n- `Super + F` : Fullscreen Toggle\n- `Super + T` : Toggle Float/Tile\n- `Super + 1..10` : Switch Workspace"
        },
        {
          filename: "17-ai.md",
          title: "AI in Omarchy",
          content: "# AI in Omarchy\n\nOmarchy is designed from the ground up for the age of AI coding agents. Pre-configured CLI tools and integrations for Claude, Gemini, Copilot, Grok, and Ollama are built into the desktop."
        }
      ];
    }

    this.render();
    this.bindEvents();
  }

  renderLoading() {
    this.container.innerHTML = `<div class="manual-loading">Loading Omarchy Manual (51 Chapters)...</div>`;
  }

  render() {
    const cur = this.chapters[this.activeChapterIndex] || this.chapters[0];

    this.container.innerHTML = `
      <div class="manual-wrapper">
        <div class="manual-sidebar">
          <div class="manual-search-box">
            <input type="text" id="manual-search" placeholder="Search manual..." />
          </div>
          <div class="manual-chapter-list" id="manual-chapter-list">
            ${this.chapters.map((ch, idx) => `
              <div class="manual-ch-item ${idx === this.activeChapterIndex ? 'active' : ''}" data-index="${idx}">
                <span class="manual-ch-num">${String(idx + 1).padStart(2, '0')}</span>
                <span class="manual-ch-title">${ch.title}</span>
              </div>
            `).join("")}
          </div>
        </div>

        <div class="manual-reader" id="manual-reader">
          <div class="manual-content">
            ${this.formatMarkdown(cur.content)}
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    const list = this.container.querySelector("#manual-chapter-list");
    if (list) {
      list.addEventListener("click", (e) => {
        const item = e.target.closest(".manual-ch-item");
        if (item) {
          const idx = parseInt(item.dataset.index);
          this.activeChapterIndex = idx;
          sound.playSnap();
          this.render();
          this.bindEvents();
        }
      });
    }

    const searchInput = this.container.querySelector("#manual-search");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        const query = e.target.value.toLowerCase();
        const items = this.container.querySelectorAll(".manual-ch-item");
        items.forEach(el => {
          const title = el.querySelector(".manual-ch-title").textContent.toLowerCase();
          el.style.display = title.includes(query) ? "flex" : "none";
        });
      });
    }
  }

  formatMarkdown(md) {
    let html = md
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="manual-code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="manual-inline-code">$1</code>')
      .replace(/^# (.*$)/gim, '<h1 class="manual-h1">$1</h1>')
      .replace(/^## (.*$)/gim, '<h2 class="manual-h2">$1</h2>')
      .replace(/^### (.*$)/gim, '<h3 class="manual-h3">$1</h3>')
      .replace(/^\- (.*$)/gim, '<li class="manual-li">$1</li>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>');
    return html;
  }
}
