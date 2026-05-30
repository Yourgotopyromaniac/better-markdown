# Better Markdown

A fast, elegant, fully client-side **Markdown editor + live preview** with a
VS Code-inspired theme, GitHub-flavored rendering, file upload/download, a
recent-files history (stored locally), and a syntax cheatsheet.

Inspired by [markdownlivepreview.dev](https://markdownlivepreview.dev/), built
with React 19, Vite, Tailwind + shadcn/ui, Zustand and CodeMirror.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
```

## Scripts

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `npm run dev`       | Start the dev server                 |
| `npm run build`     | Type-check and build for production  |
| `npm run preview`   | Preview the production build         |
| `npm run typecheck` | Type-check only                      |
| `npm run lint`      | Lint                                 |
| `npm run test`      | Run tests (watch)                    |
| `npm run test:run`  | Run tests once                       |

## Features

- ✍️ Split-pane Markdown editor with live preview (GitHub-flavored)
- 📂 Upload local `.md` files and download your work
- 🕘 Recent files remembered in `localStorage`
- 📖 Searchable Markdown cheatsheet
- 🎨 VS Code-inspired light / dark / system theming

See [AGENTS.md](./AGENTS.md) for architecture, conventions and roadmap.

## Tech

React 19 · TypeScript · Vite · Tailwind CSS + shadcn/ui · Zustand ·
CodeMirror · react-markdown (remark-gfm).
