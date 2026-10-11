// Omarchy btop System Monitor Component
// Graphical TUI recreation of btop: live CPU cores, memory meters, disk space, and process manager

import { sound } from "./sound.js";

export class BtopApp {
  constructor(contentElem) {
    this.container = contentElem;
    this.intervalId = null;
    this.processes = [
      { pid: 1, name: "systemd", cpu: 0.1, mem: 18.4, user: "root" },
      { pid: 340, name: "pipewire", cpu: 0.4, mem: 24.1, user: "omarchy" },
      { pid: 412, name: "hyprland", cpu: 2.1, mem: 142.0, user: "omarchy" },
      { pid: 528, name: "quickshell", cpu: 1.8, mem: 98.6, user: "omarchy" },
      { pid: 610, name: "ghostty", cpu: 0.8, mem: 62.4, user: "omarchy" },
      { pid: 842, name: "omarchy-agent (claude)", cpu: 3.4, mem: 184.2, user: "omarchy" },
      { pid: 950, name: "btop", cpu: 1.2, mem: 34.5, user: "omarchy" },
      { pid: 1104, name: "nvim", cpu: 0.5, mem: 46.8, user: "omarchy" },
      { pid: 1320, name: "wireplumber", cpu: 0.2, mem: 19.3, user: "omarchy" }
    ];

    this.init();
  }

  init() {
    this.render();
    this.startLiveStats();
    this.bindEvents();
  }

  render() {
    this.container.innerHTML = `
      <div class="btop-wrapper">
        <div class="btop-top-grid">
          <!-- CPU Box -->
          <div class="btop-box btop-cpu-box">
            <div class="btop-box-title">CPU <span id="btop-cpu-overall">16%</span> [8 Cores @ 3.8 GHz]</div>
            <div class="btop-cpu-bars" id="btop-cpu-bars">
              ${[0, 1, 2, 3, 4, 5, 6, 7].map(i => `
                <div class="btop-core-row">
                  <span class="btop-core-label">Core ${i}</span>
                  <div class="btop-bar-track">
                    <div class="btop-bar-fill" id="core-bar-${i}" style="width: 15%;"></div>
                  </div>
                  <span class="btop-core-pct" id="core-pct-${i}">15%</span>
                </div>
              `).join("")}
            </div>
          </div>

          <!-- Memory & Disk Box -->
          <div class="btop-box btop-mem-box">
            <div class="btop-box-title">MEMORY & DISK</div>
            <div class="btop-mem-stat">
              <div class="btop-stat-label">RAM Usage: <span id="btop-ram-txt">2.14 GiB / 16.00 GiB (13%)</span></div>
              <div class="btop-bar-track">
                <div class="btop-bar-fill mem-fill" id="btop-ram-bar" style="width: 13%;"></div>
              </div>
            </div>

            <div class="btop-mem-stat">
              <div class="btop-stat-label">Swap: <span>120 MiB / 8.00 GiB (1%)</span></div>
              <div class="btop-bar-track">
                <div class="btop-bar-fill" style="width: 1%; background: var(--theme-blue);"></div>
              </div>
            </div>

            <div class="btop-disk-stat">
              <div class="btop-stat-label">Storage (Omarchy Clone): <span style="color: var(--theme-green); font-weight: bold;">84 MiB Used (99.7% Saved)</span></div>
              <div class="btop-bar-track">
                <div class="btop-bar-fill" style="width: 0.5%; background: var(--theme-green);"></div>
              </div>
              <div class="btop-disk-meta">Original Arch footprint: ~25 GiB | Omarchy Clone: 84 MiB</div>
            </div>
          </div>
        </div>

        <!-- Processes Box -->
        <div class="btop-box btop-proc-box">
          <div class="btop-box-title">PROCESSES (${this.processes.length} tasks)</div>
          <div class="btop-proc-table-header">
            <span style="width: 80px;">PID</span>
            <span style="flex: 1;">Program Name</span>
            <span style="width: 100px;">User</span>
            <span style="width: 90px;">CPU %</span>
            <span style="width: 110px;">Memory (MB)</span>
            <span style="width: 80px;">Action</span>
          </div>
          <div class="btop-proc-list" id="btop-proc-list"></div>
        </div>
      </div>
    `;

    this.renderProcesses();
  }

  renderProcesses() {
    const list = this.container.querySelector("#btop-proc-list");
    if (!list) return;

    list.innerHTML = this.processes.map(p => `
      <div class="btop-proc-row" data-pid="${p.pid}">
        <span style="width: 80px; color: var(--theme-muted);">${p.pid}</span>
        <span style="flex: 1; font-weight: bold; color: var(--theme-foreground);">${p.name}</span>
        <span style="width: 100px; color: var(--theme-cyan);">${p.user}</span>
        <span style="width: 90px; color: ${p.cpu > 2 ? 'var(--theme-red)' : 'var(--theme-green)'};">${p.cpu.toFixed(1)}%</span>
        <span style="width: 110px; color: var(--theme-yellow);">${p.mem.toFixed(1)} MiB</span>
        <span style="width: 80px;">
          <button class="btop-kill-btn" data-pid="${p.pid}" title="Terminate Process">Kill</button>
        </span>
      </div>
    `).join("");
  }

  bindEvents() {
    this.container.addEventListener("click", (e) => {
      const killBtn = e.target.closest(".btop-kill-btn");
      if (killBtn) {
        const pid = parseInt(killBtn.dataset.pid);
        this.processes = this.processes.filter(p => p.pid !== pid);
        sound.playSnap();
        this.renderProcesses();
      }
    });
  }

  startLiveStats() {
    this.intervalId = setInterval(() => {
      let totalCpu = 0;
      for (let i = 0; i < 8; i++) {
        const coreVal = Math.floor(8 + Math.random() * 22);
        totalCpu += coreVal;
        const fill = this.container.querySelector(`#core-bar-${i}`);
        const pct = this.container.querySelector(`#core-pct-${i}`);
        if (fill && pct) {
          fill.style.width = `${coreVal}%`;
          pct.textContent = `${coreVal}%`;
          if (coreVal > 25) {
            fill.style.background = "var(--theme-red)";
          } else {
            fill.style.background = "var(--theme-accent)";
          }
        }
      }

      const avgCpu = Math.floor(totalCpu / 8);
      const overall = this.container.querySelector("#btop-cpu-overall");
      if (overall) overall.textContent = `${avgCpu}%`;

      // Fluctuate process stats slightly
      this.processes.forEach(p => {
        if (p.pid !== 1) {
          p.cpu = Math.max(0.1, p.cpu + (Math.random() * 0.8 - 0.4));
        }
      });
      this.renderProcesses();
    }, 1500);
  }

  destroy() {
    if (this.intervalId) clearInterval(this.intervalId);
  }
}
