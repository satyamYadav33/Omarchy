// Omarchy Global Keyboard Dispatcher
// Matches exact keybindings defined in Omarchy Linux (Hyprland + Quickshell)

import { sound } from "./sound.js";

export class KeybindingManager {
  constructor({ compositor, launcher, appManager, themeManager, controlCenter, screensaver }) {
    this.compositor = compositor;
    this.launcher = launcher;
    this.appManager = appManager;
    this.themeManager = themeManager;
    this.controlCenter = controlCenter;
    this.screensaver = screensaver;

    this.init();
  }

  init() {
    window.addEventListener("keydown", (e) => this.handleKeyDown(e));
  }

  handleKeyDown(e) {
    // Sound effect on typing
    sound.playKeyClick();

    // Check if user is typing inside an input/textarea and not using Super/Alt modifiers
    const isEditing = ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName);
    const hasSuper = e.metaKey || (e.altKey && e.code === "Space"); // Treat Alt+Space or Windows Key as Super

    // If typing in input and no Super/Meta key pressed, do not intercept standard typing
    if (isEditing && !e.metaKey && !e.ctrlKey) {
      if (e.key === "Escape") {
        document.activeElement.blur();
        if (this.launcher && this.launcher.isOpen) {
          this.launcher.close();
          e.preventDefault();
        }
      }
      return;
    }

    const key = e.key.toUpperCase();
    const code = e.code;
    const isSuper = e.metaKey; // Windows key / Command key
    const isCtrl = e.ctrlKey;
    const isShift = e.shiftKey;
    const isAlt = e.altKey;

    // SUPER + SPACE -> App Launcher
    if ((isSuper && code === "Space") || (isAlt && code === "Space")) {
      e.preventDefault();
      this.launcher.toggle();
      return;
    }

    // SUPER + RETURN -> Terminal
    if (isSuper && !isShift && code === "Enter") {
      e.preventDefault();
      this.appManager.launch("terminal");
      return;
    }

    // SUPER + SHIFT + RETURN -> Browser
    if (isSuper && isShift && code === "Enter") {
      e.preventDefault();
      this.appManager.launch("webapp-github");
      return;
    }

    // SUPER + SHIFT + N -> Neovim Editor
    if (isSuper && isShift && (key === "N" || code === "KeyN")) {
      e.preventDefault();
      this.appManager.launch("neovim");
      return;
    }

    // SUPER + SHIFT + A -> AI Coding Agent
    if (isSuper && isShift && (key === "A" || code === "KeyA")) {
      e.preventDefault();
      this.appManager.launch("agent");
      return;
    }

    // SUPER + SHIFT + Y -> YouTube
    if (isSuper && isShift && (key === "Y" || code === "KeyY")) {
      e.preventDefault();
      this.appManager.launch("webapp-youtube");
      return;
    }

    // SUPER + SHIFT + X -> X / Twitter
    if (isSuper && isShift && (key === "X" || code === "KeyX")) {
      e.preventDefault();
      this.appManager.launch("webapp-x");
      return;
    }

    // SUPER + SHIFT + C -> Calendar / HEY
    if (isSuper && isShift && (key === "C" || code === "KeyC")) {
      e.preventDefault();
      this.appManager.launch("webapp-calendar");
      return;
    }

    // SUPER + SHIFT + E -> Email / HEY
    if (isSuper && isShift && (key === "E" || code === "KeyE")) {
      e.preventDefault();
      this.appManager.launch("webapp-email");
      return;
    }

    // SUPER + Q or SUPER + W -> Close window
    if (isSuper && (key === "Q" || key === "W" || code === "KeyQ" || code === "KeyW")) {
      e.preventDefault();
      this.compositor.closeActiveWindow();
      return;
    }

    // SUPER + F -> Fullscreen toggle
    if (isSuper && !isCtrl && !isAlt && (key === "F" || code === "KeyF")) {
      e.preventDefault();
      this.compositor.toggleFullscreen();
      return;
    }

    // SUPER + T -> Float toggle
    if (isSuper && (key === "T" || code === "KeyT")) {
      e.preventDefault();
      this.compositor.toggleFloat();
      return;
    }

    // SUPER + J -> Split layout toggle
    if (isSuper && (key === "J" || code === "KeyJ")) {
      e.preventDefault();
      this.compositor.toggleSplit();
      return;
    }

    // SUPER + SHIFT + BACKSPACE -> Toggle Gaps
    if (isSuper && isShift && (code === "Backspace")) {
      e.preventDefault();
      this.compositor.toggleGaps();
      return;
    }

    // SUPER + CTRL + SPACE -> Background wallpaper next
    if (isSuper && isCtrl && code === "Space") {
      e.preventDefault();
      this.themeManager.nextWallpaper();
      return;
    }

    // SUPER + SHIFT + CTRL + SPACE -> Open Theme Picker
    if (isSuper && isShift && isCtrl && code === "Space") {
      e.preventDefault();
      this.controlCenter.toggle();
      return;
    }

    // SUPER + ESCAPE -> Lock screen / Screensaver
    if (isSuper && code === "Escape") {
      e.preventDefault();
      this.screensaver.activate();
      return;
    }

    // ALT + TAB -> Cycle Next Window
    if (isAlt && code === "Tab") {
      e.preventDefault();
      this.compositor.focusNextWindow(isShift);
      return;
    }

    // SUPER + 1..9, 0 -> Workspaces
    if (isSuper && !isAlt) {
      let targetWs = null;
      if (code >= "Digit1" && code <= "Digit9") {
        targetWs = parseInt(code.replace("Digit", ""));
      } else if (code === "Digit0") {
        targetWs = 10;
      }

      if (targetWs !== null) {
        e.preventDefault();
        if (isShift) {
          // Move window to workspace
          this.compositor.moveActiveWindowToWorkspace(targetWs);
        } else {
          // Switch to workspace
          this.compositor.setWorkspace(targetWs);
        }
        return;
      }
    }
  }
}
