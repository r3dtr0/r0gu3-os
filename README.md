# R0GU3 OS v2.2 — Web-Based Linux Desktop Environment

A fully functional web-based Linux desktop environment that runs entirely in your browser. No server required. Supports full offline use via Service Worker and can be launched from a USB drive via the `file://` protocol.

![R0GU3 OS](https://img.shields.io/badge/R0GU3-OS-cyan?style=for-the-badge&logo=linux&logoColor=cyan)
![Version](https://img.shields.io/badge/Version-2.2-magenta?style=for-the-badge)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-3.4-06B6D4?style=for-the-badge&logo=tailwindcss)

---

## Features

### Desktop Environment
- **Live animated wallpaper** — Drifting neon color blobs with floating particles
- **Desktop icons** — Left-aligned app shortcuts with colored icon badges
- **Top status bar** — CPU, WiFi, battery, clock, system menus
- **Bottom taskbar** — App launcher with active indicators and tooltips
- **Widgets** — Live clock, system info panel
- **Glassmorphism UI** — Frosted glass panels with backdrop blur

### 10 Built-in Apps

| App | Description | Icon Color |
|-----|-------------|------------|
| Web Browser | iframe-based with tabs, bookmarks, history | Cyan |
| Notes | Rich text note-taking with search & pinning | Amber |
| Code Editor | Monaco-style editor with file tree & syntax highlight | Green |
| Music Player | Playlist management with visualizer | Fuchsia |
| Calendar | Month view, events & reminders | Purple |
| Todo | Task management with categories & priorities | Teal |
| Password Manager | Encrypted vault with password generator | Red |
| JSON Formatter | Prettify, minify, validate & tree view | Indigo |
| Color Picker | HSL/RGB/HEX with palette generator | Pink |
| Hash Generator | MD5, SHA-1, SHA-256, SHA-512 | Orange |

### OS Features
- **Offline support** — Service Worker caches all assets
- **file:// protocol compatible** — Runs from USB without a server
- **HashRouter** — Works with static file hosting
- **Settings panel** — About, Display, Sound, Account, Storage, Network, System tabs
- **Keyboard shortcuts** — `Ctrl+K` for shortcuts help
- **Neon color system** — Cyan, magenta, lime, orange, purple accents

---

## Quick Start

### Option 1: Visit Online
Open in any modern browser:
```
https://xorvydkdxmrwa.kimi.page
```

### Option 2: Open Locally
1. Download the latest release ZIP
2. Extract to any folder
3. Open `index.html` in your browser
4. Works offline — no internet required after first load

### Option 3: USB Drive (file:// protocol)
1. Extract the ZIP to your USB drive
2. Open `index.html` directly from the USB
3. Full functionality without any server

### Option 4: Ventoy USB
1. Copy the ISO file to your Ventoy USB drive
2. Boot from USB
3. R0GU3 OS auto-launches in fullscreen kiosk mode

---

## Project Structure

```
R0GU3-OS/
  src/
    pages/
      Home.tsx          # OS desktop with live wallpaper
      Settings.tsx      # Settings panel with About tab
    apps/               # 10 application modules
      webBrowser/
      notes/
      codeEditor/
      musicPlayer/
      calendar/
      todo/
      passwordManager/
      jsonFormatter/
      colorPicker/
      hashGenerator/
    components/
      Layout.tsx        # OS chrome (status bar + taskbar)
      AnimatedBackground.tsx  # Live wallpaper
      Particles.tsx     # Floating neon particles
      ui/               # shadcn/ui components
  public/
    sw.js               # Offline service worker
  dist/                 # Production build output
  index.html
  package.json
  vite.config.ts
  tailwind.config.js
  tsconfig.json
```

---

## Development

### Prerequisites
- Node.js 20+
- npm

### Setup
```bash
git clone https://github.com/r3dtr0/r0gu3-os.git
cd r0gu3-os
npm install
```

### Development Server
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

The `dist/` folder contains the static site ready for deployment.

---

## Tech Stack

- **React 19** + TypeScript
- **Vite 7** — Build tool
- **Tailwind CSS 3.4** — Utility-first styling
- **shadcn/ui** — Component library (40+ components)
- **Lucide React** — Icons
- **HashRouter** — SPA routing for static hosting
- **Service Worker** — Offline support
- **Canvas 2D** — Animated background & particles

---

## License

MIT License — feel free to use, modify, and distribute.

---

Built with passion by the R0GU3 team.
