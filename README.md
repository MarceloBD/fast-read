# Fast Read

RSVP (Rapid Serial Visual Presentation) speed reading app that displays one word at a time with ORP (Optimal Recognition Point) highlighting. Supports PDF, EPUB, Markdown, HTML, and plain text files.

## Features

- **RSVP Speed Reading** — One word at a time with drift-corrected timing (50-1500 WPM)
- **ORP Highlighting** — Optimal Recognition Point letter highlighted for faster word recognition
- **Dual Mode** — Study mode pauses on code/images; Speed mode replaces them with placeholders
- **Multi-Format** — PDF, EPUB, Markdown, HTML, TXT file support
- **Themes** — Dark, Light, Sepia, High Contrast
- **Font Size** — Adjustable 16px to 64px
- **Keyboard Controls** — Full keyboard navigation with hold-to-repeat
- **Context Preview** — See surrounding words while reading

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Space | Play / Pause (or continue from code/image) |
| ← | Previous word (hold to repeat) |
| → | Next word (hold to repeat) |
| ↑ | Increase speed +25 WPM (hold to repeat) |
| ↓ | Decrease speed -25 WPM (hold to repeat) |
| M | Toggle reading mode (Study / Speed) |
| R | Restart from beginning |

## Project Structure

```
fast-read/
├── src/              # Shared source (Tauri desktop app)
│   ├── domain/       # Entities, enums, value objects
│   ├── application/  # RSVP engine service, ports
│   ├── infrastructure/ # File parsers, storage
│   └── presentation/ # React components, hooks, context
├── src-tauri/        # Rust backend (Tauri desktop)
├── web/              # Next.js browser version (Vercel)
└── tests/e2e/        # Playwright E2E tests
```

## Setup — Desktop App (Tauri)

Requires: Node.js 18+, Rust toolchain

```bash
# Install Rust (if not installed)
winget install Rustlang.Rustup    # Windows
# or: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh  # macOS/Linux

# Install dependencies
npm install

# Run in development (opens native desktop window)
npm run tauri dev

# Build for production
npm run tauri build
```

## Setup — Browser Version (Vite dev server)

Requires: Node.js 18+

```bash
# Install dependencies
npm install

# Run dev server (opens at http://localhost:5173)
npm run dev

# Build for production
npm run build
```

## Setup — Web Deployment (Next.js / Vercel)

Requires: Node.js 18+

```bash
cd web

# Install dependencies
npm install

# Run dev server (opens at http://localhost:3000)
npm run dev

# Build for production
npm run build

# Deploy to Vercel
npx vercel
```

## Running Tests

```bash
# Install Playwright browsers (first time only)
npx playwright install chromium

# Run E2E tests (requires dev server running)
npm run dev &
npx playwright test

# Run with UI
npx playwright test --ui
```

## Tech Stack

**Desktop (Tauri)**
- Tauri 2 (Rust backend)
- React 19 + TypeScript
- Vite
- CSS Modules

**Web (Next.js)**
- Next.js 15 + React 19
- TypeScript
- CSS Modules
- Vercel-ready

**Parsing**
- pdfjs-dist (PDF)
- epubjs (EPUB)
- marked (Markdown)
- highlight.js (code syntax)
