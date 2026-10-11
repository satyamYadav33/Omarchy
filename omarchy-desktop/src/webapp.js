// Omarchy Web App Runner & Generator Component
// Implements Omarchy's standout feature: turning web services into native desktop window apps

export class WebAppRunner {
  constructor(contentElem, { title, url, icon }) {
    this.container = contentElem;
    this.title = title;
    this.url = url;
    this.icon = icon || "🌐";

    this.init();
  }

  init() {
    this.container.innerHTML = `
      <div class="webapp-wrapper">
        <div class="webapp-nav-bar">
          <button class="webapp-nav-btn" id="webapp-back" title="Back">◀</button>
          <button class="webapp-nav-btn" id="webapp-fwd" title="Forward">▶</button>
          <button class="webapp-nav-btn" id="webapp-reload" title="Reload">🔄</button>
          <div class="webapp-url-bar">
            <span class="webapp-ssl">🔒</span>
            <input type="text" class="webapp-url-input" id="webapp-url-input" value="${this.url}" />
          </div>
          <button class="webapp-nav-btn" id="webapp-open-ext" title="Open in External Browser">↗</button>
        </div>
        <div class="webapp-frame-container">
          <iframe class="webapp-iframe" id="webapp-iframe" src="${this.url}" allow="clipboard-read; clipboard-write; camera; microphone"></iframe>
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const iframe = this.container.querySelector("#webapp-iframe");
    const reloadBtn = this.container.querySelector("#webapp-reload");
    const openExtBtn = this.container.querySelector("#webapp-open-ext");
    const urlInput = this.container.querySelector("#webapp-url-input");

    reloadBtn.addEventListener("click", () => {
      iframe.src = iframe.src;
    });

    openExtBtn.addEventListener("click", () => {
      window.open(this.url, "_blank");
    });

    urlInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        let newUrl = urlInput.value.trim();
        if (!newUrl.startsWith("http://") && !newUrl.startsWith("https://")) {
          newUrl = "https://" + newUrl;
        }
        this.url = newUrl;
        iframe.src = newUrl;
      }
    });
  }
}
