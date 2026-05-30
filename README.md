# Better Markdown

A fast, fully client-side Markdown editor with a live preview, file
upload/download, recent files, shareable links, theming, and a searchable
Markdown cheatsheet.

Live app: https://better-markdown-lyart.vercel.app/

Repository: https://github.com/Yourgotopyromaniac/better-markdown

## What It Does

Better Markdown lets you write GitHub-flavored Markdown and see the rendered
preview immediately. It supports local `.md` uploads, downloading the current
document, reopening recent files, and sharing a document through a compressed
URL.

The app runs entirely in the browser. There is no backend, account system, or
remote data store. Documents, recents, and theme preferences are stored locally
in the browser.

## Why It Exists

The goal is to provide a simple, polished Markdown workspace for quick writing,
editing, previewing, and sharing without sending document content to a server.
It is useful for drafting README files, notes, documentation, and Markdown
snippets that need an accurate live preview.

## Features

- Split editor and live preview for GitHub-flavored Markdown.
- Sanitised preview for safe rendering of shared documents and inline HTML.
- Upload local Markdown files and download the current document.
- Recent files stored in `localStorage`.
- Shareable links powered by URL compression.
- Searchable Markdown cheatsheet with rendered examples.
- Light, dark, system, and accent theme options.
- First-run guided tour for the main UI controls.

## Run Locally

Requirements:

- Node.js 20 or newer.
- npm.

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL shown by Vite, usually:

```text
http://localhost:5173
```

## Scripts

| Command             | Description                         |
| ------------------- | ----------------------------------- |
| `npm run dev`       | Start the local development server  |
| `npm run build`     | Type-check and build for production |
| `npm run preview`   | Preview the production build        |
| `npm run typecheck` | Run TypeScript checks only          |
| `npm run lint`      | Run ESLint                          |
| `npm run test`      | Run tests in watch mode             |
| `npm run test:run`  | Run tests once                      |

## Tech Stack

React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Zustand, CodeMirror,
react-markdown, remark-gfm, rehype-sanitize, and Vitest.
