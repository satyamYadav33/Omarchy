// Omarchy Screensaver & Lock Screen Component
// Floating geometric Omarchy emblem, ambient particle canvas, digital clock, and unlocker

import { sound } from "./sound.js";

export class ScreensaverApp {
  constructor(overlayElem, { themeManager }) {
    this.overlay = overlayElem;
    this.themeManager = themeManager;
    this.active = false;
    this.animId = null;

    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    this.overlay.innerHTML = `
      <div class="screensaver-backdrop" id="screensaver-backdrop">
        <canvas class="screensaver-canvas" id="screensaver-canvas"></canvas>
        <div class="screensaver-content">
          <div class="screensaver-logo-wrapper">
            <svg class="screensaver-svg-logo" viewBox="0 0 100 100" fill="none">
              <polygon points="50,10 90,85 10,85" stroke="var(--theme-accent)" stroke-width="4" fill="rgba(122, 162, 247, 0.1)" />
              <circle cx="50" cy="55" r="14" fill="var(--theme-accent)" />
            </svg>
          </div>
          <div class="screensaver-title">OMARCHY</div>
          <div class="screensaver-clock" id="screensaver-clock">15:48</div>
          <div class="screensaver-date" id="screensaver-date">Sunday, October 11</div>

          <div class="screensaver-unlock-box">
            <div class="screensaver-user-badge">satyam@omarchy</div>
            <input type="password" class="screensaver-pass" id="screensaver-pass" placeholder="Password or Press Enter to Unlock" autofocus />
            <button class="screensaver-unlock-btn" id="screensaver-unlock-btn">Unlock ➔</button>
          </div>
          <div class="screensaver-hint">Press [Enter] or type password to resume workstation</div>
        </div>
      </div>
    `;
    this.overlay.style.display = "none";
  }

  bindEvents() {
    const passInput = this.overlay.querySelector("#screensaver-pass");
    const unlockBtn = this.overlay.querySelector("#screensaver-unlock-btn");

    const doUnlock = () => {
      this.deactivate();
    };

    unlockBtn.addEventListener("click", doUnlock);
    passInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        doUnlock();
      }
    });

    this.overlay.addEventListener("click", () => {
      passInput.focus();
    });
  }

  activate() {
    this.active = true;
    this.overlay.style.display = "flex";
    sound.playSnap();

    const passInput = this.overlay.querySelector("#screensaver-pass");
    passInput.value = "";
    setTimeout(() => passInput.focus(), 50);

    this.updateClock();
    this.startCanvasAnimation();
  }

  deactivate() {
    this.active = false;
    sound.playBootChime();
    this.overlay.classList.add("unlocking");

    setTimeout(() => {
      this.overlay.style.display = "none";
      this.overlay.classList.remove("unlocking");
      if (this.animId) cancelAnimationFrame(this.animId);
    }, 250);
  }

  updateClock() {
    const clockElem = this.overlay.querySelector("#screensaver-clock");
    const dateElem = this.overlay.querySelector("#screensaver-date");
    if (!clockElem) return;

    const now = new Date();
    clockElem.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    dateElem.textContent = now.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  }

  startCanvasAnimation() {
    const canvas = this.overlay.querySelector("#screensaver-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();

    // Floating particles
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 2.5 + 1,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      alpha: Math.random() * 0.6 + 0.2
    }));

    const renderFrame = () => {
      if (!this.active) return;
      this.updateClock();

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const accent = getComputedStyle(document.documentElement).getPropertyValue("--theme-accent").trim() || "#7aa2f7";

      ctx.fillStyle = accent;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      this.animId = requestAnimationFrame(renderFrame);
    };

    renderFrame();
  }
}
