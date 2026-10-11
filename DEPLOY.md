# 🚀 Deploying Omarchy Clone to Vercel

This repository is pre-configured for instant, zero-configuration deployment to **[Vercel](https://vercel.com)**.

---

## ⚡ Option 1: One-Click Vercel Dashboard Deployment (Recommended)

1. Go to **[vercel.com/new](https://vercel.com/new)**.
2. Under **Import Git Repository**, find and select `Omarchy_Clone`.
3. In the project configuration screen:
   * **Framework Preset:** Select **Other** (auto-detected).
   * **Root Directory:** Leave as `./` (or select `omarchy-desktop`).
   * **Build & Output Settings:** Leave all empty/default (no build command needed — the static Wayland desktop is served directly).
4. Click **Deploy**.
5. Within 15 seconds, your Omarchy Linux Desktop clone will be live worldwide on a `.vercel.app` URL!

---

## 💻 Option 2: Deploy Using Vercel CLI

If you have the Vercel CLI installed:

```bash
# Login to Vercel (if not already logged in)
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## 🛠️ Configuration Details

* **`vercel.json`**: Located at the repository root, it automatically routes root requests (`/`), `/assets/*`, `/styles/*`, and `/src/*` directly to `omarchy-desktop`.
* **Zero Dependencies**: Pure modern ES Modules, HTML5, and CSS3. No heavy bundling or node_modules compilation required.
* **Storage Footprint**: The entire deployment is under **55 MB**, including 96 original wallpapers, 23 themes, and all 51 documentation chapters!
