// Omarchy Quickshell Top Bar Component
// Mirrors the official Quickshell bar layout: Workspaces, Active App, Agent Badge, Hardware Stats, Audio, Clock, Control Center

import { sound } from "./sound.js";

export class QuickshellBar {
  constructor({ barElem, compositor, themeManager, launcher, controlCenter, appManager }) {
    this.bar = barElem;
    this.compositor = compositor;
    this.themeManager = themeManager;
    this.launcher = launcher;
    this.controlCenter = controlCenter;
    this.appManager = appManager;

    this.activeAgentName = "Claude 3.5 Sonnet";
    this.activeAgentModel = "anthropic/claude-3.5-sonnet";
    this.cpuHistory = [12, 18, 15, 24, 19, 14, 28, 20, 16];
    this.ramUsage = 2.1; // GB

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
    this.startHardwareMonitor();
    this.startClock();
  }

  render() {
    this.bar.innerHTML = `
      <div class="qs-left">
        <button class="qs-logo-btn" id="qs-logo-trigger" title="Omarchy Menu (Super+Space)">
          <span class="qs-logo-icon">▲</span>
          <span class="qs-logo-text">omarchy</span>
        </button>
        <div class="qs-workspaces" id="qs-workspaces">
          ${[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => `
            <button class="qs-ws-btn ${i === this.compositor.activeWorkspace ? 'active' : ''}" data-ws="${i}">
              <span class="qs-ws-num">${i}</span>
              <span class="qs-ws-dot"></span>
            </button>
          `).join("")}
        </div>
        <div class="qs-window-title-pill" id="qs-active-title" style="display: none;">
          <span class="qs-win-icon">💻</span>
          <span class="qs-win-name">Terminal</span>
        </div>
      </div>

      <div class="qs-center">
        <button class="qs-agent-pill" id="qs-agent-trigger" title="Omarchy Agentic Core (Super+Shift+A)">
          <span class="qs-agent-pulse"></span>
          <span class="qs-agent-icon">🤖</span>
          <span class="qs-agent-label">Agent:</span>
          <span class="qs-agent-name" id="qs-agent-name">${this.activeAgentName}</span>
        </button>
      </div>

      <div class="qs-right">
        <!-- Hardware Gauges -->
        <div class="qs-stat-pill" title="CPU Core Activity">
          <span class="qs-stat-icon">⚡</span>
          <span class="qs-stat-val" id="qs-cpu-val">16%</span>
          <div class="qs-sparkline" id="qs-cpu-sparkline"></div>
        </div>

        <div class="qs-stat-pill" title="RAM Footprint">
          <span class="qs-stat-icon">🧠</span>
          <span class="qs-stat-val" id="qs-ram-val">2.1 GB</span>
        </div>

        <div class="qs-stat-pill storage-badge" title="Omarchy Micro-Distro Disk Footprint: 84 MB (99.6% saved!)">
          <span class="qs-stat-icon">💾</span>
          <span class="qs-stat-val">84 MB</span>
        </div>

        <!-- Audio Indicator -->
        <button class="qs-icon-btn" id="qs-audio-trigger" title="Audio Tuning">
          <span id="qs-audio-icon">🔊</span>
        </button>

        <!-- WiFi Indicator -->
        <div class="qs-icon-pill" title="Network: Connected (omarchy-net)">
          <span>📶</span>
        </div>

        <!-- Battery Indicator -->
        <div class="qs-icon-pill" title="Battery: 98% (Plugged in)">
          <span>⚡ 98%</span>
        </div>

        <!-- Digital Clock -->
        <button class="qs-clock-pill" id="qs-clock-trigger">
          <span id="qs-clock-time">15:45</span>
          <span id="qs-clock-date">Sun Oct 11</span>
        </button>

        <!-- Control Center Button -->
        <button class="qs-control-btn" id="qs-control-trigger" title="Control Center & Themes">
          <span>⚙</span>
        </button>
      </div>

      <!-- Audio Popover Flyout -->
      <div class="qs-popover" id="qs-audio-popover" style="display: none;">
        <div class="qs-popover-header">Audio Tuning</div>
        <div class="qs-slider-group">
          <label>Master Volume: <span id="qs-vol-label">80%</span></label>
          <input type="range" id="qs-vol-slider" min="0" max="100" value="80" />
        </div>
        <div class="qs-toggle-group">
          <label><input type="checkbox" id="qs-audio-toggle" checked /> Sound Effects</label>
          <label><input type="checkbox" id="qs-click-toggle" checked /> Key Click Thock</label>
        </div>
      </div>

      <!-- Calendar Popover Flyout -->
      <div class="qs-popover" id="qs-calendar-popover" style="display: none;">
        <div class="qs-popover-header" id="qs-calendar-header">October 2026</div>
        <div class="qs-calendar-grid" id="qs-calendar-grid"></div>
      </div>
    `;
  }

  bindEvents() {
    // Omarchy Logo -> Launcher
    document.getElementById("qs-logo-trigger").addEventListener("click", () => {
      this.launcher.toggle();
    });

    // Workspaces click
    const wsContainer = document.getElementById("qs-workspaces");
    wsContainer.addEventListener("click", (e) => {
      const btn = e.target.closest(".qs-ws-btn");
      if (btn) {
        const ws = parseInt(btn.dataset.ws);
        this.compositor.setWorkspace(ws);
      }
    });

    // Agent Pill click -> Launch or Focus Agent
    document.getElementById("qs-agent-trigger").addEventListener("click", () => {
      this.appManager.launch("agent");
    });

    // Control Center Trigger
    document.getElementById("qs-control-trigger").addEventListener("click", () => {
      this.controlCenter.toggle();
    });

    // Audio Popover Toggle
    const audioBtn = document.getElementById("qs-audio-trigger");
    const audioPopover = document.getElementById("qs-audio-popover");
    audioBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = audioPopover.style.display === "block";
      audioPopover.style.display = isVisible ? "none" : "block";
      document.getElementById("qs-calendar-popover").style.display = "none";
    });

    // Clock / Calendar Popover Toggle
    const clockBtn = document.getElementById("qs-clock-trigger");
    const calPopover = document.getElementById("qs-calendar-popover");
    clockBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = calPopover.style.display === "block";
      calPopover.style.display = isVisible ? "none" : "block";
      audioPopover.style.display = "none";
      if (!isVisible) this.renderCalendar();
    });

    document.addEventListener("click", (e) => {
      if (!e.target.closest("#qs-audio-popover") && !e.target.closest("#qs-audio-trigger")) {
        audioPopover.style.display = "none";
      }
      if (!e.target.closest("#qs-calendar-popover") && !e.target.closest("#qs-clock-trigger")) {
        calPopover.style.display = "none";
      }
    });

    // Audio controls
    const volSlider = document.getElementById("qs-vol-slider");
    const volLabel = document.getElementById("qs-vol-label");
    volSlider.addEventListener("input", (e) => {
      volLabel.textContent = `${e.target.value}%`;
    });

    const audioToggle = document.getElementById("qs-audio-toggle");
    audioToggle.addEventListener("change", (e) => {
      sound.enabled = e.target.checked;
    });

    const clickToggle = document.getElementById("qs-click-toggle");
    clickToggle.addEventListener("change", (e) => {
      sound.keyboardAudio = e.target.checked;
    });

    // Compositor subscribers
    this.compositor.on("workspaceChange", (ws) => this.updateWorkspaces(ws));
    this.compositor.on("focusChange", (win) => this.updateActiveWindow(win));
    this.compositor.on("windowListChange", () => this.updateWorkspaceDots());
  }

  setAgent(name, model) {
    this.activeAgentName = name;
    this.activeAgentModel = model;
    const nameElem = document.getElementById("qs-agent-name");
    if (nameElem) nameElem.textContent = name;
  }

  updateWorkspaces(activeWs) {
    const btns = this.bar.querySelectorAll(".qs-ws-btn");
    btns.forEach(b => {
      const ws = parseInt(b.dataset.ws);
      if (ws === activeWs) {
        b.classList.add("active");
      } else {
        b.classList.remove("active");
      }
    });
    this.updateWorkspaceDots();
  }

  updateWorkspaceDots() {
    const btns = this.bar.querySelectorAll(".qs-ws-btn");
    btns.forEach(b => {
      const ws = parseInt(b.dataset.ws);
      const hasWins = this.compositor.windows.some(w => w.workspace === ws);
      if (hasWins) {
        b.classList.add("has-windows");
      } else {
        b.classList.remove("has-windows");
      }
    });
  }

  updateActiveWindow(win) {
    const pill = document.getElementById("qs-active-title");
    if (!pill) return;
    if (win) {
      pill.style.display = "flex";
      pill.querySelector(".qs-win-icon").textContent = win.icon;
      pill.querySelector(".qs-win-name").textContent = win.title;
    } else {
      pill.style.display = "none";
    }
  }

  startHardwareMonitor() {
    setInterval(() => {
      // Simulate live CPU fluctuation with realistic micro-load
      const cpu = Math.floor(10 + Math.random() * 18);
      this.cpuHistory.push(cpu);
      if (this.cpuHistory.length > 12) this.cpuHistory.shift();

      const cpuElem = document.getElementById("qs-cpu-val");
      if (cpuElem) cpuElem.textContent = `${cpu}%`;

      const sparkline = document.getElementById("qs-cpu-sparkline");
      if (sparkline) {
        sparkline.innerHTML = this.cpuHistory.map(v => {
          const h = Math.max(3, Math.min(16, (v / 50) * 16));
          return `<span style="height: ${h}px;"></span>`;
        }).join("");
      }
    }, 2000);
  }

  startClock() {
    const update = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const dateStr = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

      const timeElem = document.getElementById("qs-clock-time");
      const dateElem = document.getElementById("qs-clock-date");
      if (timeElem) timeElem.textContent = timeStr;
      if (dateElem) dateElem.textContent = dateStr;
    };
    update();
    setInterval(update, 1000);
  }

  renderCalendar() {
    const grid = document.getElementById("qs-calendar-grid");
    if (!grid) return;
    const now = new Date();
    const days = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    let html = `<div class="qs-cal-row headers">${days.map(d => `<span>${d}</span>`).join("")}</div>`;

    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    html += `<div class="qs-cal-grid-days">`;
    for (let i = 0; i < firstDay; i++) {
      html += `<span class="empty"></span>`;
    }
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday = day === now.getDate();
      html += `<span class="${isToday ? 'today' : ''}">${day}</span>`;
    }
    html += `</div>`;
    grid.innerHTML = html;
  }
}
