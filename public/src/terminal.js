// Omarchy Ghostty Terminal Emulator
// Includes fastfetch banner, interactive Omarchy CLI router, theme switcher, and command runner

import { THEMES } from "./themes.js";
import { sound } from "./sound.js";

const ASCII_LOGO = `
                 ▄▄▄
 ▄█████▄    ▄███████████▄    ▄███████   ▄███████   ▄███████   ▄█   █▄    ▄█   █▄
███   ███  ███   ███   ███  ███   ███  ███   ███  ███   ███  ███   ███  ███   ███
███   ███  ███   ███   ███  ███   ███  ███   ███  ███   █▀   ███   ███  ███   ███
███   ███  ███   ███   ███ ▄███▄▄▄███ ▄███▄▄▄██▀  ███       ▄███▄▄▄███▄ ███▄▄▄███
███   ███  ███   ███   ███ ▀███▀▀▀███ ▀███▀▀▀▀    ███      ▀▀███▀▀▀███  ▀▀▀▀▀▀███
███   ███  ███   ███   ███  ███   ███ ██████████  ███   █▄   ███   ███  ▄██   ███
███   ███  ███   ███   ███  ███   ███  ███   ███  ███   ███  ███   ███  ███   ███
 ▀█████▀    ▀█   ███   █▀   ███   █▀   ███   ███  ███████▀   ███   █▀    ▀█████▀
                                       ███   █▀
`;

export class TerminalApp {
  constructor(contentElem, { themeManager, appManager, compositor, quickshellBar, screensaver }) {
    this.container = contentElem;
    this.themeManager = themeManager;
    this.appManager = appManager;
    this.compositor = compositor;
    this.quickshellBar = quickshellBar;
    this.screensaver = screensaver;

    this.history = [];
    this.historyIndex = -1;
    this.cwd = "/home/omarchy";

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="term-wrapper">
        <div class="term-screen" id="term-screen"></div>
        <div class="term-input-line">
          <span class="term-prompt">
            <span class="term-prompt-user">omarchy</span><span class="term-prompt-at">@</span><span class="term-prompt-host">satyam</span>:<span class="term-prompt-path">~</span><span class="term-prompt-symbol">$</span>
          </span>
          <input type="text" class="term-input" id="term-input" autofocus autocomplete="off" spellcheck="false" />
        </div>
      </div>
    `;

    this.screen = this.container.querySelector("#term-screen");
    this.input = this.container.querySelector("#term-input");

    this.bindEvents();
    this.printFastfetch();
  }

  bindEvents() {
    this.container.addEventListener("click", () => {
      this.input.focus();
    });

    this.input.addEventListener("keydown", (e) => {
      sound.playKeyClick();

      if (e.key === "Enter") {
        const cmd = this.input.value.trim();
        this.input.value = "";
        if (cmd) {
          this.history.push(cmd);
          this.historyIndex = this.history.length;
        }
        this.executeCommand(cmd);
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (this.history.length > 0 && this.historyIndex > 0) {
          this.historyIndex--;
          this.input.value = this.history[this.historyIndex];
        }
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        if (this.historyIndex < this.history.length - 1) {
          this.historyIndex++;
          this.input.value = this.history[this.historyIndex];
        } else {
          this.historyIndex = this.history.length;
          this.input.value = "";
        }
      } else if (e.key === "Tab") {
        e.preventDefault();
        this.autocomplete();
      } else if (e.ctrlKey && e.key.toLowerCase() === "l") {
        e.preventDefault();
        this.screen.innerHTML = "";
      } else if (e.ctrlKey && e.key.toLowerCase() === "c") {
        e.preventDefault();
        this.printLine(`^C`, "dim");
        this.input.value = "";
      }
    });
  }

  autocomplete() {
    const text = this.input.value.trim();
    const suggestions = [
      "omarchy", "omarchy theme", "omarchy theme list", "omarchy theme set",
      "omarchy agent", "omarchy app", "omarchy info", "omarchy lock",
      "fastfetch", "neofetch", "btop", "nvim", "cmatrix", "clear", "ls", "help"
    ];
    const match = suggestions.find(s => s.startsWith(text));
    if (match) {
      this.input.value = match;
    }
  }

  printLine(html, className = "") {
    const line = document.createElement("div");
    line.className = `term-line ${className}`;
    line.innerHTML = html;
    this.screen.appendChild(line);
    this.screen.scrollTop = this.screen.scrollHeight;
  }

  printFastfetch() {
    const theme = this.themeManager.currentTheme;
    const fastfetchHtml = `
      <div class="term-fastfetch-grid">
        <pre class="term-ascii-logo">${ASCII_LOGO}</pre>
        <div class="term-sysinfo">
          <div class="term-info-row"><span class="term-info-key">OS</span>: <span class="term-info-val">Omarchy Linux 2026 (Lite Agentic Edition)</span></div>
          <div class="term-info-row"><span class="term-info-key">Host</span>: <span class="term-info-val">Omarchy Virtual Wayland Compositor</span></div>
          <div class="term-info-row"><span class="term-info-key">Kernel</span>: <span class="term-info-val">6.12.0-omarchy-zen-x86_64</span></div>
          <div class="term-info-row"><span class="term-info-key">Uptime</span>: <span class="term-info-val">12 hours, 48 mins</span></div>
          <div class="term-info-row"><span class="term-info-key">Compositor</span>: <span class="term-info-val">Hyprland v0.45.0 (Tiling Wayland)</span></div>
          <div class="term-info-row"><span class="term-info-key">Shell</span>: <span class="term-info-val">Quickshell + zsh 5.9</span></div>
          <div class="term-info-row"><span class="term-info-key">Terminal</span>: <span class="term-info-val">Ghostty (Berkeley Mono)</span></div>
          <div class="term-info-row"><span class="term-info-key">Active Theme</span>: <span class="term-info-val" style="color: ${theme.accent};">${theme.displayName}</span></div>
          <div class="term-info-row"><span class="term-info-key">Active Agent</span>: <span class="term-info-val" style="color: ${theme.green || '#00ff88'};">Claude 3.5 Sonnet (Agentic Citizen)</span></div>
          <div class="term-info-row"><span class="term-info-key">Storage Footprint</span>: <span class="term-info-val" style="color: ${theme.yellow || '#ffcc00'};">84 MB / 100% Experience (Zero disk bloat)</span></div>
          <div class="term-info-palette">
            <span style="background: ${theme.red};"></span>
            <span style="background: ${theme.orange};"></span>
            <span style="background: ${theme.yellow};"></span>
            <span style="background: ${theme.green};"></span>
            <span style="background: ${theme.cyan};"></span>
            <span style="background: ${theme.blue};"></span>
            <span style="background: ${theme.magenta};"></span>
            <span style="background: ${theme.accent};"></span>
          </div>
        </div>
      </div>
      <div class="term-line success">Type <span class="term-code">help</span> or <span class="term-code">omarchy</span> to explore commands. Press <span class="term-code">Super + Space</span> for App Launcher.</div>
    `;
    this.printLine(fastfetchHtml);
  }

  executeCommand(cmdStr) {
    this.printLine(`
      <span class="term-prompt">
        <span class="term-prompt-user">omarchy</span><span class="term-prompt-at">@</span><span class="term-prompt-host">satyam</span>:<span class="term-prompt-path">~</span><span class="term-prompt-symbol">$</span>
      </span> <span class="term-cmd-echo">${this.escapeHtml(cmdStr)}</span>
    `);

    if (!cmdStr) return;

    const parts = cmdStr.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    const args = parts.slice(1);

    switch (cmd) {
      case "help":
        this.printHelp();
        break;

      case "clear":
        this.screen.innerHTML = "";
        break;

      case "fastfetch":
      case "neofetch":
        this.printFastfetch();
        break;

      case "omarchy":
        this.handleOmarchyCli(args);
        break;

      case "btop":
      case "top":
      case "htop":
        this.printLine(`Launching btop System Monitor...`);
        this.appManager.launch("btop");
        break;

      case "nvim":
      case "neovim":
      case "vim":
        this.printLine(`Launching Neovim IDE...`);
        this.appManager.launch("neovim");
        break;

      case "cmatrix":
      case "matrix":
        this.runMatrix();
        break;

      case "ls":
        this.printLine(`
          <span style="color: var(--theme-blue); font-weight: bold;">Work/</span>   <span style="color: var(--theme-blue); font-weight: bold;">dotfiles/</span>   <span style="color: var(--theme-green);">init.lua</span>   <span style="color: var(--theme-yellow);">routes.rb</span>   README.md
        `);
        break;

      case "pwd":
        this.printLine(this.cwd);
        break;

      case "whoami":
        this.printLine("satyam (omarchy root)");
        break;

      case "date":
        this.printLine(new Date().toString());
        break;

      case "uname":
        if (args.includes("-a")) {
          this.printLine("Linux omarchy-zen 6.12.0-omarchy #1 SMP PREEMPT_DYNAMIC x86_64 GNU/Linux");
        } else {
          this.printLine("Linux");
        }
        break;

      case "echo":
        this.printLine(args.join(" "));
        break;

      case "cat":
        if (args[0] === "README.md") {
          this.printLine(`
            # Omarchy Linux Clone<br>
            A high-end, zero-storage-waste clone of DHH's Omarchy.<br>
            Keyboard-driven, agentic, modern, and beautiful.
          `);
        } else {
          this.printLine(`cat: ${args[0] || ''}: No such file or directory`, "error");
        }
        break;

      default:
        this.printLine(`zsh: command not found: ${cmd}. Type <span class="term-code">help</span> or <span class="term-code">omarchy</span>`, "error");
    }
  }

  handleOmarchyCli(args) {
    if (args.length === 0 || args[0] === "help" || args[0] === "--help") {
      this.printLine(`
        <div class="term-box">
          <div class="term-box-title">OMARCHY COMMAND ROUTER</div>
          <div>Usage: <span class="term-code">omarchy &lt;command&gt; [options]</span></div>
          <br>
          <div><strong>Core Command Groups:</strong></div>
          <div>  <span class="term-code">theme</span>        Apply, list, and customize themes</div>
          <div>  <span class="term-code">agent</span>        AI coding agents (Claude, Gemini, Copilot, Grok, Ollama)</div>
          <div>  <span class="term-code">app</span>          Turn any website into a native desktop app</div>
          <div>  <span class="term-code">info</span>         System hardware and Omarchy runtime overview</div>
          <div>  <span class="term-code">lock</span>         Lock desktop and invoke screensaver</div>
          <div>  <span class="term-code">screensaver</span>  Activate the glowing Omarchy screensaver</div>
          <div>  <span class="term-code">update</span>       Check and apply Omarchy system updates</div>
        </div>
      `);
      return;
    }

    const sub = args[0].toLowerCase();
    const subArgs = args.slice(1);

    if (sub === "theme") {
      if (subArgs.length === 0 || subArgs[0] === "list") {
        const list = Object.keys(THEMES).map(t => {
          const isCur = t === this.themeManager.currentThemeName;
          return `<span style="color: ${isCur ? 'var(--theme-accent)' : 'inherit'};">${isCur ? '▶ ' : '  '}${t} (${THEMES[t].displayName})</span>`;
        }).join("<br>");
        this.printLine(`<strong>Available Omarchy Themes:</strong><br>${list}`);
        this.printLine(`Usage: <span class="term-code">omarchy theme set &lt;theme-name&gt;</span>`);
      } else if (subArgs[0] === "set") {
        const target = (subArgs[1] || "").toLowerCase().replace(/['"]/g, "");
        if (THEMES[target]) {
          this.themeManager.setTheme(target);
          this.printLine(`✔ Successfully switched theme to <strong>${THEMES[target].displayName}</strong>!`, "success");
        } else {
          this.printLine(`Theme '${target}' not found. Try: <span class="term-code">omarchy theme list</span>`, "error");
        }
      } else {
        // Direct name e.g. omarchy theme tokyo-night
        const target = subArgs[0].toLowerCase();
        if (THEMES[target]) {
          this.themeManager.setTheme(target);
          this.printLine(`✔ Successfully switched theme to <strong>${THEMES[target].displayName}</strong>!`, "success");
        } else {
          this.printLine(`Unknown theme command. Use <span class="term-code">omarchy theme list</span>`, "error");
        }
      }
    } else if (sub === "agent") {
      if (subArgs.length === 0 || subArgs[0] === "list") {
        this.printLine(`
          <strong>Omarchy Coding Agents:</strong><br>
          ▶ claude    (Anthropic Claude 3.5 Sonnet) [ACTIVE]<br>
            gemini    (Google Gemini 1.5 Pro)<br>
            copilot   (GitHub Copilot)<br>
            grok      (xAI Grok 2)<br>
            ollama    (Local Llama 3.3)<br>
          <br>
          Switch with: <span class="term-code">omarchy agent &lt;name&gt;</span>
        `);
      } else {
        const agentName = subArgs[0].toLowerCase();
        const map = {
          claude: "Claude 3.5 Sonnet",
          gemini: "Gemini 1.5 Pro",
          copilot: "GitHub Copilot",
          grok: "Grok 2",
          ollama: "Ollama (Llama 3.3)"
        };
        if (map[agentName]) {
          this.quickshellBar.setAgent(map[agentName], agentName);
          this.printLine(`✔ Active agent switched to <strong>${map[agentName]}</strong>!`, "success");
        } else {
          this.printLine(`Agent '${agentName}' not recognized. Choices: claude, gemini, copilot, grok, ollama`, "error");
        }
      }
    } else if (sub === "app") {
      if (subArgs.length >= 2) {
        const name = subArgs[0];
        const url = subArgs[1];
        this.printLine(`✔ Generated desktop app for <strong>${name}</strong> (${url})! Launching...`, "success");
        this.appManager.createCustomWebApp(name, url);
      } else {
        this.printLine(`Usage: <span class="term-code">omarchy app &lt;name&gt; &lt;url&gt;</span><br>Example: <span class="term-code">omarchy app "ChatGPT" "https://chatgpt.com"</span>`);
      }
    } else if (sub === "info") {
      this.printFastfetch();
    } else if (sub === "lock" || sub === "screensaver") {
      this.screensaver.activate();
    } else if (sub === "update") {
      this.printLine(`Checking Omarchy repositories...<br>All packages up to date! System status: pristine.`, "success");
    } else {
      this.printLine(`omarchy: unknown group '${sub}'. Type <span class="term-code">omarchy</span> for list.`, "error");
    }
  }

  runMatrix() {
    this.printLine(`Starting Digital Rain Matrix (Press Ctrl+C to stop)...`, "success");
    const container = document.createElement("div");
    container.className = "term-matrix-box";
    this.screen.appendChild(container);

    let count = 0;
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$+-*/=%\"'#&_(),.;:?!\\|{}<>[]^~";
    const interval = setInterval(() => {
      let str = "";
      for (let i = 0; i < 40; i++) {
        str += chars[Math.floor(Math.random() * chars.length)] + " ";
      }
      container.textContent = str;
      count++;
      if (count > 25) {
        clearInterval(interval);
        container.remove();
        this.printLine("Matrix sequence complete.");
      }
    }, 80);
  }

  printHelp() {
    this.printLine(`
      <strong>Omarchy Quick Help:</strong><br>
      • <span class="term-code">omarchy</span> - Run the Omarchy CLI router<br>
      • <span class="term-code">omarchy theme list</span> - List 23 official themes<br>
      • <span class="term-code">omarchy theme set tokyo-night</span> - Switch theme live<br>
      • <span class="term-code">omarchy agent &lt;name&gt;</span> - Set active AI agent (claude/gemini/copilot)<br>
      • <span class="term-code">omarchy app "Name" "URL"</span> - Create new standalone webapp<br>
      • <span class="term-code">btop</span> - Open system hardware monitor<br>
      • <span class="term-code">nvim</span> - Launch Neovim editor<br>
      • <span class="term-code">matrix</span> - Digital cyber rain<br>
      • <span class="term-code">clear</span> - Clear terminal<br>
      <br>
      <strong>Desktop Shortcuts:</strong><br>
      • <span class="term-code">Super + Space</span> - App Launcher<br>
      • <span class="term-code">Super + Return</span> - Terminal<br>
      • <span class="term-code">Super + Shift + A</span> - AI Coding Agent<br>
      • <span class="term-code">Super + Shift + N</span> - Neovim<br>
      • <span class="term-code">Super + Q</span> - Close Window<br>
      • <span class="term-code">Super + 1..10</span> - Switch Workspace
    `);
  }

  escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
}
