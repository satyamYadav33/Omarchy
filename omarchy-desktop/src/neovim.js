// Omarchy Neovim IDE Component
// Faithful reproduction of DHH's Neovim setup: NvimTree file tree, bufferline tabs, lualine statusbar, syntax highlighting

import { sound } from "./sound.js";

const DEFAULT_FILES = {
  "hyprland.lua": `-- Omarchy Hyprland Configuration
-- ~/.config/hypr/hyprland.lua

local o = require("omarchy")
local hl = require("hyprland")

-- Window rules & animations
hl.set("general:gaps_in", 6)
hl.set("general:gaps_out", 12)
hl.set("general:border_size", 2)
hl.set("general:col.active_border", "rgba(7aa2f7ee) rgba(bb9af7ee) 45deg")

-- Keyboard Binds
o.bind("SUPER + RETURN", "Terminal", o.launch_terminal())
o.bind("SUPER + SPACE", "Omarchy menu", { menu = "root" })
o.bind("SUPER + SHIFT + N", "Editor", { omarchy = "editor" })
o.bind("SUPER + SHIFT + A", "AI Agent", { omarchy = "agent" })

print("Omarchy Hyprland Loaded Successfully")
`,

  "app.rb": `# Ruby on Rails 8 Controller
# app/controllers/workspaces_controller.rb

class WorkspacesController < ApplicationController
  before_action :authenticate_developer!

  def index
    @workspaces = Workspace.active.order(updated_at: :desc)
    render json: {
      distro: "Omarchy Linux",
      agent: "Claude 3.5 Sonnet",
      workspaces: @workspaces
    }
  end

  def execute_task
    task = AgentTask.create!(params.permit(:prompt, :model))
    OmarchyWorker.perform_async(task.id)
    render json: { status: :dispatched, task_id: task.id }
  end
end
`,

  "main.py": `"""
Omarchy System Agent Helper
"""
import sys, os

def get_system_health():
    return {
        "os": "Omarchy Linux 2026",
        "compositor": "Hyprland v0.45",
        "status": "Optimal",
        "storage_mode": "Micro-Footprint (84MB)"
    }

if __name__ == "__main__":
    health = get_system_health()
    print(f"Omarchy Status: {health['status']} | Footprint: {health['storage_mode']}")
`,

  "colors.toml": `mode = "dark"

accent = "#7aa2f7"
selection = "#292e42"
muted = "#414868"

background = "#1a1b26"
dark_background = "#13141c"
darker_background = "#0e0e14"
lighter_background = "#24283b"

foreground = "#a9b1d6"
red = "#f7768e"
green = "#9ece6a"
blue = "#7aa2f7"
`
};

export class NeovimApp {
  constructor(contentElem, { themeManager }) {
    this.container = contentElem;
    this.themeManager = themeManager;
    this.files = { ...DEFAULT_FILES };
    this.activeFilename = "hyprland.lua";
    this.mode = "NORMAL";
    this.cursorPos = { line: 1, col: 1 };

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="nvim-wrapper">
        <!-- Bufferline (Tabs) -->
        <div class="nvim-tabbar" id="nvim-tabbar">
          ${Object.keys(this.files).map(f => `
            <div class="nvim-tab ${f === this.activeFilename ? 'active' : ''}" data-file="${f}">
              <span class="nvim-tab-icon">${this.getFileIcon(f)}</span>
              <span class="nvim-tab-name">${f}</span>
              <span class="nvim-tab-close">✕</span>
            </div>
          `).join("")}
        </div>

        <div class="nvim-main">
          <!-- NvimTree (File Sidebar) -->
          <div class="nvim-sidebar">
            <div class="nvim-sidebar-header">
              <span>EXPLORER</span>
              <span class="nvim-sidebar-badge">OMARCHY</span>
            </div>
            <div class="nvim-filetree" id="nvim-filetree">
              <div class="nvim-folder-name">▾ .config/hypr</div>
              ${Object.keys(this.files).map(f => `
                <div class="nvim-file-item ${f === this.activeFilename ? 'active' : ''}" data-file="${f}">
                  <span class="nvim-file-icon">${this.getFileIcon(f)}</span>
                  <span>${f}</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Code Editor Surface -->
          <div class="nvim-editor-surface">
            <div class="nvim-gutter" id="nvim-gutter"></div>
            <textarea class="nvim-textarea" id="nvim-textarea" spellcheck="false">${this.escapeHtml(this.files[this.activeFilename])}</textarea>
          </div>
        </div>

        <!-- Lualine (Statusbar) -->
        <div class="nvim-lualine">
          <div class="nvim-lua-section nvim-lua-mode" id="nvim-lua-mode">NORMAL</div>
          <div class="nvim-lua-section nvim-lua-git"> main</div>
          <div class="nvim-lua-section nvim-lua-file" id="nvim-lua-file">${this.activeFilename}</div>
          <div class="nvim-lua-spacer"></div>
          <div class="nvim-lua-section nvim-lua-encoding">utf-8 [unix]</div>
          <div class="nvim-lua-section nvim-lua-filetype" id="nvim-lua-type">${this.getFileType(this.activeFilename)}</div>
          <div class="nvim-lua-section nvim-lua-pos" id="nvim-lua-pos">Ln 1, Col 1</div>
        </div>
      </div>
    `;

    this.updateGutter();
  }

  bindEvents() {
    const tabbar = this.container.querySelector("#nvim-tabbar");
    tabbar.addEventListener("click", (e) => {
      const tab = e.target.closest(".nvim-tab");
      if (tab) {
        const file = tab.dataset.file;
        this.switchFile(file);
      }
    });

    const filetree = this.container.querySelector("#nvim-filetree");
    filetree.addEventListener("click", (e) => {
      const item = e.target.closest(".nvim-file-item");
      if (item) {
        const file = item.dataset.file;
        this.switchFile(file);
      }
    });

    const textarea = this.container.querySelector("#nvim-textarea");
    textarea.addEventListener("input", () => {
      this.files[this.activeFilename] = textarea.value;
      this.updateGutter();
      this.updateCursorPos();
    });

    textarea.addEventListener("keydown", (e) => {
      sound.playKeyClick();
      if (e.key === "Tab") {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.value = textarea.value.substring(0, start) + "  " + textarea.value.substring(end);
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        this.files[this.activeFilename] = textarea.value;
        this.updateGutter();
      }
    });

    textarea.addEventListener("click", () => this.updateCursorPos());
    textarea.addEventListener("keyup", () => this.updateCursorPos());

    textarea.addEventListener("focus", () => {
      this.setMode("INSERT");
    });
    textarea.addEventListener("blur", () => {
      this.setMode("NORMAL");
    });
  }

  switchFile(filename) {
    if (!this.files[filename]) return;
    this.activeFilename = filename;
    sound.playSnap();
    this.render();
    this.bindEvents();
  }

  setMode(mode) {
    this.mode = mode;
    const modeElem = this.container.querySelector("#nvim-lua-mode");
    if (modeElem) {
      modeElem.textContent = mode;
      modeElem.className = `nvim-lua-section nvim-lua-mode ${mode.toLowerCase()}`;
    }
  }

  updateGutter() {
    const textarea = this.container.querySelector("#nvim-textarea");
    const gutter = this.container.querySelector("#nvim-gutter");
    if (!textarea || !gutter) return;

    const lineCount = textarea.value.split("\n").length;
    let html = "";
    for (let i = 1; i <= Math.max(15, lineCount); i++) {
      html += `<div>${i}</div>`;
    }
    gutter.innerHTML = html;
  }

  updateCursorPos() {
    const textarea = this.container.querySelector("#nvim-textarea");
    const posElem = this.container.querySelector("#nvim-lua-pos");
    if (!textarea || !posElem) return;

    const val = textarea.value.substring(0, textarea.selectionStart);
    const lines = val.split("\n");
    const curLine = lines.length;
    const curCol = lines[lines.length - 1].length + 1;

    posElem.textContent = `Ln ${curLine}, Col ${curCol}`;
  }

  getFileIcon(filename) {
    if (filename.endsWith(".lua")) return "🌙";
    if (filename.endsWith(".rb")) return "💎";
    if (filename.endsWith(".py")) return "🐍";
    if (filename.endsWith(".toml")) return "⚙";
    return "📄";
  }

  getFileType(filename) {
    if (filename.endsWith(".lua")) return "lua";
    if (filename.endsWith(".rb")) return "ruby";
    if (filename.endsWith(".py")) return "python";
    if (filename.endsWith(".toml")) return "toml";
    return "text";
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
