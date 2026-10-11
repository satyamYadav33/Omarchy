// Omarchy Agentic Core - AI Coding Assistant
// The defining feature of Omarchy: AI coding agents as first-class citizens of the desktop

import { sound } from "./sound.js";

export class AgentApp {
  constructor(contentElem, { themeManager, appManager, compositor, quickshellBar }) {
    this.container = contentElem;
    this.themeManager = themeManager;
    this.appManager = appManager;
    this.compositor = compositor;
    this.quickshellBar = quickshellBar;

    this.selectedAgent = "claude";
    this.agentDetails = {
      claude: { name: "Claude 3.5 Sonnet", icon: "🟣", provider: "Anthropic", tag: "Fast, precise, code-specialist" },
      gemini: { name: "Gemini 1.5 Pro", icon: "🔵", provider: "Google DeepMind", tag: "Massive context, multimodal" },
      copilot: { name: "GitHub Copilot", icon: "🐙", provider: "GitHub / OpenAI", tag: "Repository-aware completion" },
      grok: { name: "Grok 2", icon: "⚡", provider: "xAI", tag: "Uncensored, real-time reasoning" },
      ollama: { name: "Ollama (Llama 3.3)", icon: "🦙", provider: "Local Hardware", tag: "Private, offline agent" }
    };

    this.messages = [
      {
        sender: "agent",
        text: `Welcome to **Omarchy Agentic Core**! I am your desktop pair programmer and operating system agent. In Omarchy, agents are citizens of your workstation—not web browser visitors.\n\nYou can ask me to write code, debug, explain system architecture, or control Omarchy settings.\n\n*Try asking:* \`Switch to hackerman theme\` or \`Explain DHH's Omarchy philosophy\`.`
      }
    ];

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    const curAgent = this.agentDetails[this.selectedAgent];

    this.container.innerHTML = `
      <div class="agent-wrapper">
        <div class="agent-header-bar">
          <div class="agent-meta">
            <span class="agent-avatar">${curAgent.icon}</span>
            <div>
              <div class="agent-title-row">
                <span class="agent-title">${curAgent.name}</span>
                <span class="agent-status-badge">● Active Citizen</span>
              </div>
              <div class="agent-subtitle">${curAgent.provider} — ${curAgent.tag}</div>
            </div>
          </div>
          <div class="agent-selector-wrapper">
            <label>Active Agent: </label>
            <select class="agent-select" id="agent-select">
              <option value="claude" ${this.selectedAgent === 'claude' ? 'selected' : ''}>Claude 3.5 Sonnet</option>
              <option value="gemini" ${this.selectedAgent === 'gemini' ? 'selected' : ''}>Gemini 1.5 Pro</option>
              <option value="copilot" ${this.selectedAgent === 'copilot' ? 'selected' : ''}>GitHub Copilot</option>
              <option value="grok" ${this.selectedAgent === 'grok' ? 'selected' : ''}>Grok 2</option>
              <option value="ollama" ${this.selectedAgent === 'ollama' ? 'selected' : ''}>Ollama (Local Llama)</option>
            </select>
          </div>
        </div>

        <div class="agent-chat-history" id="agent-chat-history"></div>

        <div class="agent-quick-chips">
          <button class="agent-chip" data-prompt="Explain Omarchy architecture">Architecture</button>
          <button class="agent-chip" data-prompt="Switch theme to hackerman">Theme: Hackerman</button>
          <button class="agent-chip" data-prompt="Switch theme to tokyo-night">Theme: Tokyo Night</button>
          <button class="agent-chip" data-prompt="Open system monitor">Launch btop</button>
          <button class="agent-chip" data-prompt="Write a Ruby on Rails model snippet">Rails Snippet</button>
        </div>

        <div class="agent-input-row">
          <textarea class="agent-input" id="agent-input" rows="2" placeholder="Ask your agent or instruct a system task (Enter to send, Shift+Enter for newline)..."></textarea>
          <button class="agent-send-btn" id="agent-send-btn">Send ➔</button>
        </div>
      </div>
    `;

    this.renderMessages();
  }

  bindEvents() {
    const select = this.container.querySelector("#agent-select");
    select.addEventListener("change", (e) => {
      this.selectedAgent = e.target.value;
      const details = this.agentDetails[this.selectedAgent];
      this.quickshellBar.setAgent(details.name, this.selectedAgent);
      sound.playSnap();
      this.render();
      this.addMessage("agent", `Switched active desktop agent to **${details.name}** (${details.provider}). Ready to assist!`);
    });

    const sendBtn = this.container.querySelector("#agent-send-btn");
    const input = this.container.querySelector("#agent-input");

    const doSend = () => {
      const txt = input.value.trim();
      if (!txt) return;
      input.value = "";
      this.handleUserPrompt(txt);
    };

    sendBtn.addEventListener("click", doSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        doSend();
      }
    });

    // Quick chips
    const chipContainer = this.container.querySelector(".agent-quick-chips");
    chipContainer.addEventListener("click", (e) => {
      const chip = e.target.closest(".agent-chip");
      if (chip) {
        const prompt = chip.dataset.prompt;
        this.handleUserPrompt(prompt);
      }
    });
  }

  renderMessages() {
    const history = this.container.querySelector("#agent-chat-history");
    if (!history) return;

    history.innerHTML = this.messages.map(m => {
      const isAgent = m.sender === "agent";
      return `
        <div class="agent-msg ${isAgent ? 'from-agent' : 'from-user'}">
          <div class="agent-msg-avatar">${isAgent ? this.agentDetails[this.selectedAgent].icon : '👤'}</div>
          <div class="agent-msg-bubble">
            <div class="agent-msg-sender">${isAgent ? this.agentDetails[this.selectedAgent].name : 'Satyam'}</div>
            <div class="agent-msg-content">${this.formatMarkdown(m.text)}</div>
          </div>
        </div>
      `;
    }).join("");

    history.scrollTop = history.scrollHeight;
  }

  addMessage(sender, text) {
    this.messages.push({ sender, text });
    this.renderMessages();
    sound.playNotification();
  }

  handleUserPrompt(prompt) {
    this.addMessage("user", prompt);

    const lower = prompt.toLowerCase();

    // Check for system automation commands
    if (lower.includes("theme to") || lower.includes("switch theme")) {
      for (const t of ["tokyo-night", "rose-pine", "catppuccin", "gruvbox", "hackerman", "nord", "everforest", "vantablack", "starship", "kanagawa"]) {
        if (lower.includes(t.replace("-", " ")) || lower.includes(t)) {
          this.themeManager.setTheme(t);
          setTimeout(() => {
            this.addMessage("agent", `Done! I've switched your Omarchy desktop theme to **${this.themeManager.currentTheme.displayName}**. Window borders, Quickshell top bar, and wallpapers have synchronized.`);
          }, 300);
          return;
        }
      }
    }

    if (lower.includes("btop") || lower.includes("monitor") || lower.includes("system monitor")) {
      setTimeout(() => {
        this.appManager.launch("btop");
        this.addMessage("agent", `Launched **btop System Monitor** in a tiled Wayland window. You can monitor CPU cores, RAM, and system processes in real-time.`);
      }, 300);
      return;
    }

    if (lower.includes("terminal") || lower.includes("ghostty")) {
      setTimeout(() => {
        this.appManager.launch("terminal");
        this.addMessage("agent", `Launched **Ghostty Terminal** (Super + Return).`);
      }, 300);
      return;
    }

    if (lower.includes("editor") || lower.includes("neovim") || lower.includes("nvim")) {
      setTimeout(() => {
        this.appManager.launch("neovim");
        this.addMessage("agent", `Launched **Neovim IDE** (Super + Shift + N) configured with Omarchy keybindings and tree view.`);
      }, 300);
      return;
    }

    if (lower.includes("wallpaper") || lower.includes("background")) {
      this.themeManager.nextWallpaper();
      setTimeout(() => {
        this.addMessage("agent", `Cycled to the next wallpaper in the active **${this.themeManager.currentTheme.displayName}** collection.`);
      }, 300);
      return;
    }

    // Default intelligent responses
    setTimeout(() => {
      let reply = "";
      if (lower.includes("architecture") || lower.includes("how does omarchy work")) {
        reply = `### Omarchy Architectural Overview:\n\n1. **Base Foundation**: Arch Linux with rolling updates.\n2. **Window Compositor**: Hyprland (Wayland), delivering silky-smooth tiling, animations, and zero tearing.\n3. **Desktop Shell**: Quickshell (Qt/QML), managing the top bar, notification overlays, and system HUD.\n4. **Developer Toolchain**: Neovim with Lazy.nvim, Ghostty terminal, and Tmux multiplexer.\n5. **Agentic Layer**: Integrated AI coding agent wrappers that launch directly in the terminal or as desktop citizens without web browser friction.`;
      } else if (lower.includes("rails") || lower.includes("ruby")) {
        reply = `Here is a modern Rails 8 model with Solid Queue and Solid Cache integration:\n\n\`\`\`ruby\n# app/models/deploy_task.rb\nclass DeployTask < ApplicationRecord\n  enum :status, { pending: 0, building: 1, live: 2, failed: 3 }, default: :pending\n  belongs_to :project\n\n  after_create_commit :enqueue_deployment\n\n  private\n    def enqueue_deployment\n      DeployExecutionJob.perform_later(self)\n    end\nend\n\`\`\`\n\nRuns out of the box in Omarchy!`;
      } else if (lower.includes("storage") || lower.includes("lightweight") || lower.includes("clone")) {
        reply = `**Why this Omarchy Clone is so efficient:**\n\nA full Arch Linux install with Hyprland and tools typically demands **20 GB to 40 GB** of disk space.\n\nThis high-end clone gives you **100% of the authentic Omarchy experience** (Hyprland tiling, Quickshell top bar, 23 official themes, 96 wallpapers, Ghostty terminal, Agentic core, and Neovim) using **under 90 MB** of storage footprint—saving over **99.7% of disk space** while keeping instant responsiveness!`;
      } else {
        reply = `I have analyzed your request: "${prompt}".\n\nAs your Omarchy system agent, I'm pre-configured to assist with coding, running tests, refactoring, and operating your workstation.\n\nWould you like me to generate a script, open a terminal, or assist with a specific programming language?`;
      }
      this.addMessage("agent", reply);
    }, 400);
  }

  formatMarkdown(text) {
    let html = text
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/```([a-z]*)\n([\s\S]*?)```/g, '<pre class="agent-code-block"><code>$2</code></pre>')
      .replace(/`([^`]+)`/g, '<code class="agent-inline-code">$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
    return html;
  }
}
