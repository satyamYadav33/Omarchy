// Omarchy Hyprland Compositor Engine
// Implements dynamic tiling (master/stack, dwindle), floating, snapping, 10 virtual workspaces, and focus management

import { sound } from "./sound.js";

export class HyprlandCompositor {
  constructor(containerElem) {
    this.container = containerElem;
    this.windows = [];
    this.activeWindowId = null;
    this.activeWorkspace = 1;
    this.layoutMode = "dwindle"; // "dwindle" or "master"
    this.gaps = true;
    this.gapSize = 12; // px
    this.subscribers = {
      workspaceChange: [],
      focusChange: [],
      windowListChange: []
    };

    window.addEventListener("resize", () => this.relayout());
  }

  on(event, callback) {
    if (this.subscribers[event]) {
      this.subscribers[event].push(callback);
    }
  }

  emit(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach(cb => {
        try { cb(data); } catch (e) { console.error(e); }
      });
    }
  }

  setWorkspace(wsIndex) {
    if (wsIndex < 1 || wsIndex > 10) return;
    if (this.activeWorkspace === wsIndex) return;

    this.activeWorkspace = wsIndex;
    sound.playSnap();

    // Hide windows not in this workspace, show ones in this workspace
    this.windows.forEach(win => {
      if (win.workspace === this.activeWorkspace) {
        win.element.style.display = "flex";
      } else {
        win.element.style.display = "none";
      }
    });

    const activeInWs = this.getWindowsInActiveWorkspace();
    if (activeInWs.length > 0) {
      this.focusWindow(activeInWs[activeInWs.length - 1].id);
    } else {
      this.activeWindowId = null;
      this.emit("focusChange", null);
    }

    this.relayout();
    this.emit("workspaceChange", this.activeWorkspace);
  }

  moveActiveWindowToWorkspace(targetWs) {
    if (!this.activeWindowId || targetWs < 1 || targetWs > 10) return;
    const win = this.getWindow(this.activeWindowId);
    if (!win) return;

    win.workspace = targetWs;
    sound.playSnap();

    if (targetWs !== this.activeWorkspace) {
      win.element.style.display = "none";
      this.relayout();
      const activeInWs = this.getWindowsInActiveWorkspace();
      if (activeInWs.length > 0) {
        this.focusWindow(activeInWs[activeInWs.length - 1].id);
      } else {
        this.activeWindowId = null;
        this.emit("focusChange", null);
      }
    }

    this.emit("workspaceChange", this.activeWorkspace);
    this.emit("windowListChange", this.windows);
  }

  getWindowsInActiveWorkspace() {
    return this.windows.filter(w => w.workspace === this.activeWorkspace);
  }

  getWindow(id) {
    return this.windows.find(w => w.id === id);
  }

  createWindow({ id = null, title, icon = "💻", appType, renderContent, isFloating = false, width = 850, height = 550 }) {
    const winId = id || "win-" + Date.now() + "-" + Math.floor(Math.random() * 1000);

    const winElem = document.createElement("div");
    winElem.className = "hypr-window" + (isFloating ? " floating" : " tiled");
    winElem.id = winId;
    winElem.setAttribute("tabindex", "0");

    // Header / Titlebar
    const header = document.createElement("div");
    header.className = "hypr-window-header";
    header.innerHTML = `
      <div class="hypr-window-title">
        <span class="hypr-window-icon">${icon}</span>
        <span class="hypr-window-name">${title}</span>
      </div>
      <div class="hypr-window-controls">
        <button class="hypr-btn hypr-btn-split" title="Toggle Split (Super+J)">⇄</button>
        <button class="hypr-btn hypr-btn-float" title="Toggle Float (Super+T)">⧉</button>
        <button class="hypr-btn hypr-btn-max" title="Fullscreen (Super+F)">⤢</button>
        <button class="hypr-btn hypr-btn-close" title="Close (Super+Q)">✕</button>
      </div>
    `;

    // Content container
    const content = document.createElement("div");
    content.className = "hypr-window-content";

    winElem.appendChild(header);
    winElem.appendChild(content);

    const winObj = {
      id: winId,
      title,
      icon,
      appType,
      element: winElem,
      header,
      content,
      workspace: this.activeWorkspace,
      isFloating,
      isMaximized: false,
      floatingRect: {
        x: Math.max(50, (window.innerWidth - width) / 2 + (Math.random() * 40 - 20)),
        y: Math.max(50, (window.innerHeight - height) / 2 + (Math.random() * 40 - 20)),
        width,
        height
      }
    };

    if (renderContent) {
      renderContent(content, winObj);
    }

    this.setupWindowInteractions(winObj);
    this.container.appendChild(winElem);
    this.windows.push(winObj);

    sound.playSnap();
    this.focusWindow(winId);
    this.relayout();

    this.emit("windowListChange", this.windows);
    this.emit("workspaceChange", this.activeWorkspace);

    return winObj;
  }

  setupWindowInteractions(win) {
    const el = win.element;
    const header = win.header;

    el.addEventListener("mousedown", () => {
      this.focusWindow(win.id);
    });

    const closeBtn = header.querySelector(".hypr-btn-close");
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.closeWindow(win.id);
    });

    const maxBtn = header.querySelector(".hypr-btn-max");
    maxBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleFullscreen(win.id);
    });

    const floatBtn = header.querySelector(".hypr-btn-float");
    floatBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleFloat(win.id);
    });

    const splitBtn = header.querySelector(".hypr-btn-split");
    splitBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleSplit(win.id);
    });

    // Dragging for floating windows
    let isDragging = false;
    let dragStartX, dragStartY;
    let initialX, initialY;

    header.addEventListener("mousedown", (e) => {
      if (e.target.closest(".hypr-btn")) return;
      if (!win.isFloating || win.isMaximized) return;

      isDragging = true;
      dragStartX = e.clientX;
      dragStartY = e.clientY;
      initialX = win.floatingRect.x;
      initialY = win.floatingRect.y;

      const onMouseMove = (moveEvent) => {
        if (!isDragging) return;
        const dx = moveEvent.clientX - dragStartX;
        const dy = moveEvent.clientY - dragStartY;
        win.floatingRect.x = Math.max(0, Math.min(window.innerWidth - 100, initialX + dx));
        win.floatingRect.y = Math.max(34, Math.min(window.innerHeight - 60, initialY + dy));
        el.style.left = `${win.floatingRect.x}px`;
        el.style.top = `${win.floatingRect.y}px`;
      };

      const onMouseUp = () => {
        isDragging = false;
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onMouseUp);
      };

      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onMouseUp);
    });
  }

  focusWindow(id) {
    this.windows.forEach(w => {
      if (w.id === id) {
        w.element.classList.add("active");
        w.element.style.zIndex = "10";
      } else {
        w.element.classList.remove("active");
        w.element.style.zIndex = w.isFloating ? "5" : "1";
      }
    });

    this.activeWindowId = id;
    const focused = this.getWindow(id);
    if (focused) {
      this.emit("focusChange", focused);
    }
  }

  focusNextWindow(reverse = false) {
    const list = this.getWindowsInActiveWorkspace();
    if (list.length <= 1) return;
    const curIdx = list.findIndex(w => w.id === this.activeWindowId);
    let nextIdx = reverse ? curIdx - 1 : curIdx + 1;
    if (nextIdx < 0) nextIdx = list.length - 1;
    if (nextIdx >= list.length) nextIdx = 0;
    this.focusWindow(list[nextIdx].id);
    sound.playSnap();
  }

  closeWindow(id) {
    const idx = this.windows.findIndex(w => w.id === id);
    if (idx === -1) return;

    const win = this.windows[idx];
    sound.playSnap();
    win.element.classList.add("closing");

    setTimeout(() => {
      if (win.element.parentNode) {
        win.element.parentNode.removeChild(win.element);
      }
      this.windows.splice(idx, 1);

      const remainingInWs = this.getWindowsInActiveWorkspace();
      if (this.activeWindowId === id) {
        if (remainingInWs.length > 0) {
          this.focusWindow(remainingInWs[remainingInWs.length - 1].id);
        } else {
          this.activeWindowId = null;
          this.emit("focusChange", null);
        }
      }

      this.relayout();
      this.emit("windowListChange", this.windows);
      this.emit("workspaceChange", this.activeWorkspace);
    }, 150);
  }

  closeActiveWindow() {
    if (this.activeWindowId) {
      this.closeWindow(this.activeWindowId);
    }
  }

  toggleFloat(id = this.activeWindowId) {
    const win = this.getWindow(id);
    if (!win) return;

    win.isFloating = !win.isFloating;
    sound.playSnap();

    if (win.isFloating) {
      win.element.classList.remove("tiled");
      win.element.classList.add("floating");
    } else {
      win.element.classList.remove("floating");
      win.element.classList.add("tiled");
      win.isMaximized = false;
    }

    this.relayout();
  }

  toggleFullscreen(id = this.activeWindowId) {
    const win = this.getWindow(id);
    if (!win) return;

    win.isMaximized = !win.isMaximized;
    sound.playSnap();

    if (win.isMaximized) {
      win.element.classList.add("maximized");
    } else {
      win.element.classList.remove("maximized");
    }

    this.relayout();
  }

  toggleSplit(id = this.activeWindowId) {
    this.layoutMode = this.layoutMode === "dwindle" ? "master" : "dwindle";
    sound.playSnap();
    this.relayout();
  }

  toggleGaps() {
    this.gaps = !this.gaps;
    this.gapSize = this.gaps ? 12 : 0;
    sound.playSnap();
    this.relayout();
  }

  relayout() {
    const containerW = this.container.clientWidth;
    const containerH = this.container.clientHeight;
    const gap = this.gapSize;

    const wsWindows = this.getWindowsInActiveWorkspace();
    const tiledWindows = wsWindows.filter(w => !w.isFloating && !w.isMaximized);
    const floatingWindows = wsWindows.filter(w => w.isFloating && !w.isMaximized);
    const maximizedWindows = wsWindows.filter(w => w.isMaximized);

    // Layout Maximized Windows
    maximizedWindows.forEach(win => {
      win.element.style.left = `${gap}px`;
      win.element.style.top = `${gap}px`;
      win.element.style.width = `${containerW - gap * 2}px`;
      win.element.style.height = `${containerH - gap * 2}px`;
    });

    // Layout Floating Windows
    floatingWindows.forEach(win => {
      win.element.style.left = `${win.floatingRect.x}px`;
      win.element.style.top = `${win.floatingRect.y}px`;
      win.element.style.width = `${win.floatingRect.width}px`;
      win.element.style.height = `${win.floatingRect.height}px`;
    });

    // Layout Tiled Windows
    const count = tiledWindows.length;
    if (count === 0) return;

    if (count === 1) {
      tiledWindows[0].element.style.left = `${gap}px`;
      tiledWindows[0].element.style.top = `${gap}px`;
      tiledWindows[0].element.style.width = `${containerW - gap * 2}px`;
      tiledWindows[0].element.style.height = `${containerH - gap * 2}px`;
      return;
    }

    if (this.layoutMode === "master") {
      // Master & Stack: window[0] takes left 50%, remaining stacked vertically on right
      const masterWidth = Math.floor((containerW - gap * 3) * 0.52);
      const stackWidth = containerW - gap * 3 - masterWidth;

      // Master window
      tiledWindows[0].element.style.left = `${gap}px`;
      tiledWindows[0].element.style.top = `${gap}px`;
      tiledWindows[0].element.style.width = `${masterWidth}px`;
      tiledWindows[0].element.style.height = `${containerH - gap * 2}px`;

      // Stack windows
      const stackCount = count - 1;
      const stackHeight = Math.floor((containerH - gap * (stackCount + 1)) / stackCount);

      for (let i = 1; i < count; i++) {
        const idx = i - 1;
        const top = gap + idx * (stackHeight + gap);
        tiledWindows[i].element.style.left = `${gap + masterWidth + gap}px`;
        tiledWindows[i].element.style.top = `${top}px`;
        tiledWindows[i].element.style.width = `${stackWidth}px`;
        tiledWindows[i].element.style.height = `${stackHeight}px`;
      }
    } else {
      // Dwindle layout: Recursive binary splitting
      this.computeDwindleRects(tiledWindows, 0, count, gap, gap, containerW - gap * 2, containerH - gap * 2, gap, true);
    }
  }

  computeDwindleRects(windows, start, end, x, y, w, h, gap, splitVertical) {
    const n = end - start;
    if (n <= 0) return;
    if (n === 1) {
      windows[start].element.style.left = `${x}px`;
      windows[start].element.style.top = `${y}px`;
      windows[start].element.style.width = `${w}px`;
      windows[start].element.style.height = `${h}px`;
      return;
    }

    if (splitVertical || w > h) {
      // Split horizontally into left and right
      const w1 = Math.floor((w - gap) / 2);
      const w2 = w - gap - w1;
      windows[start].element.style.left = `${x}px`;
      windows[start].element.style.top = `${y}px`;
      windows[start].element.style.width = `${w1}px`;
      windows[start].element.style.height = `${h}px`;

      this.computeDwindleRects(windows, start + 1, end, x + w1 + gap, y, w2, h, gap, false);
    } else {
      // Split vertically into top and bottom
      const h1 = Math.floor((h - gap) / 2);
      const h2 = h - gap - h1;
      windows[start].element.style.left = `${x}px`;
      windows[start].element.style.top = `${y}px`;
      windows[start].element.style.width = `${w}px`;
      windows[start].element.style.height = `${h1}px`;

      this.computeDwindleRects(windows, start + 1, end, x, y + h1 + gap, w, h2, gap, true);
    }
  }
}
