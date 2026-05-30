# AGENTS.md — Better Markdown

Reference guide for anyone (human or AI) working on this project. Read this
before making changes so the scope, architecture and conventions stay coherent.

## 1. What we're building

A fast, elegant, **fully client-side** Markdown editor + live preview web app,
inspired by [markdownlivepreview.dev](https://markdownlivepreview.dev/) but
going further:

- **Editor + live preview** — split-pane, GitHub-flavored Markdown, instant
  rendering as you type.
- **File upload / download** — open a local `.md` file into the editor; export
  the current document back to disk.
- **Recent files** — uploaded files and opened share links are stored in
  `localStorage` (capped by count and total size) and can be reopened from the
  recents panel.
- **Shareable links** — encode the whole document into a compressed URL
  (`lz-string`); opening the link imports it. No backend, no account. Because a
  shared link can carry untrusted HTML, the preview is **always sanitised**.
- **Markdown cheatsheet** — a searchable syntax reference page with
  live-rendered examples.
- **Theming** — VS Code-inspired visual language with a light / dark / system
  toggle. The editor itself uses the VS Code CodeMirror theme.

It is a single-page app with **no backend** and **no data fetching layer**.
Everything (documents, recents, theme) lives in the browser.

## 2. Tech stack

| Concern        | Choice                                                            |
| -------------- | ----------------------------------------------------------------- |
| Build / dev    | Vite 6 + `@vitejs/plugin-react-swc`                               |
| Language       | TypeScript (strict), React 19                                     |
| Routing        | `react-router` v7 (declarative `<BrowserRouter>`)                 |
| Styling        | Tailwind CSS v3 + CSS variables, `tailwindcss-animate`            |
| Components     | shadcn/ui (new-york style) on Radix primitives                    |
| Prose styling  | `@tailwindcss/typography` (`prose` classes for the preview)       |
| State          | Zustand (with `persist` for theme + working document)            |
| Editor         | CodeMirror via `@uiw/react-codemirror` + `@uiw/...-theme-vscode`  |
| Markdown       | `react-markdown` + `remark-gfm` + `rehype-raw` + `rehype-sanitize` + `rehype-highlight` |
| Split panes    | `react-resizable-panels` v2 (shadcn `resizable` wrapper)         |
| Sharing        | `lz-string` (document compressed into the URL)                   |
| Icons          | `lucide-react`                                                    |
| Toasts         | `react-hot-toast`                                                 |
| Tests          | Vitest + Testing Library + jsdom                                  |
| Fonts          | Inter (UI), Outfit (display) via `@fontsource-variable`           |

> The starter template carried a lot of unrelated dependencies (a movie app).
> Those were removed. **Do not re-add** data-fetching/form libs (react-query,
> formik, yup, axios, etc.) unless a real need appears — this app is local-only.

## 3. Commands

```bash
npm run dev        # start the dev server
npm run build      # tsc -b && vite build (production bundle)
npm run typecheck  # tsc -b --noEmit
npm run lint       # eslint
npm run test       # vitest (watch)
npm run test:run   # vitest run (CI / one-shot)
```

## 4. Project structure

```
src/
  components/
    editor/      markdown-editor (CodeMirror), editor-toolbar, editor-workspace,
                 share-dialog, recents-menu
    preview/     markdown-preview (sanitised react-markdown renderer)
    layout/      app-shell.tsx — top bar + content region
    theme/       theme-provider.tsx, theme-toggle.tsx
    ui/          shadcn/ui primitives (button, card, dialog, dropdown-menu,
                 resizable, tabs, tooltip, …)
  data/          static content (cheatsheet.ts)
  hooks/         use-media-query.ts, use-share-loader.ts
  lib/
    utils.ts     cn() class merge helper
    share.ts     encode/decode a document into a URL (lz-string)
    file.ts      download / read-upload helpers
    format.ts    relative-time formatting
    errorBoundary.tsx
  pages/         route components (default-exported, lazy-loaded)
  router/        routes.ts (path constants), routeBuilder.tsx, appRouter.tsx
  store/         zustand stores (theme-store, editor-store, recents-store)
  styles/        highlight.css — VS Code-style syntax token colors
  test/          setup.ts (vitest/jsdom globals)
  App.tsx        renders <MainRouter/>
  providers.tsx  Theme + Tooltip + Router + Toaster
  main.tsx       entry; imports fonts + index.css + highlight.css
index.css        Tailwind layers + light/dark CSS variables
tailwind.config.js
```

### Editor & preview

- `editor-store.ts` holds the working document (`content` + `fileName`),
  persisted to `localStorage` (key `bmp-document`) so a refresh never loses
  work. The `MarkdownEditor` (CodeMirror) reads/writes `content`; the
  `MarkdownPreview` renders it.
- `editor-workspace.tsx` is responsive: a resizable split (editor | preview) on
  desktop, and a Write/Preview tab switch on mobile (`useIsDesktop`).
- The preview pipeline is **raw → sanitise → highlight** (see §7).

### Routing

Routes are declared as path constants in `src/router/routes.ts` and assembled
in `src/router/routeBuilder.tsx` (each entry: `path`, lazy `Element`, optional
`Layout`). `appRouter.tsx` maps them, wrapping each page in an `ErrorBoundary`
and a `Suspense` fallback, plus a `ScrollToTop`. Add a page by creating a
default-exported component in `src/pages/`, a constant in `routes.ts`, and an
entry in `routeBuilder.tsx`.

## 5. Theming (important)

- All colors are **CSS variables** in `src/index.css`, defined for `:root`
  (light) and `.dark` (dark), and mapped to Tailwind tokens in
  `tailwind.config.js` (`bg-background`, `text-foreground`, `border-border`,
  `bg-primary`, the app-specific `chrome` surface, etc.).
  **Always style with these tokens — never hardcode hex/`neutral-*` colors.**
- The palette is tuned to feel like VS Code (Light+ / Dark+).
- `src/store/theme-store.ts` holds the user's `mode` (`light|dark|system`,
  persisted) and the runtime-resolved theme. `ThemeProvider` applies the
  `.dark` class to `<html>` and tracks OS changes in `system` mode.
- `index.html` contains a small inline script that applies the persisted/system
  theme **before first paint** to avoid a flash. If you rename the storage key
  (`bmp-theme`) or change the persisted shape, update that script too.
- Use `useThemeStore(s => s.resolved)` to pick the matching CodeMirror theme.

## 6. Conventions

- Path alias `@/*` → `src/*`.
- shadcn components live in `src/components/ui` and use `cn()` + theme tokens.
  Add new ones in the same new-york style (Radix + CVA where relevant).
- Pages are **default-exported** (required by the lazy loader); shared
  components use **named exports**.
- Keep comments purposeful — explain the *why*, match surrounding density.
- Mobile-responsive and accessible by default (labels, focus rings, aria).

## 7. Security note

Because documents are **shareable via link**, the preview can render HTML
authored by someone else — so it is **always sanitised**. The rehype pipeline
(`src/components/preview/markdown-preview.tsx`) runs in this order:

1. `rehype-raw` — parse inline/raw HTML in the Markdown into real nodes.
2. `rehype-sanitize` — strip scripts, event handlers and dangerous markup. The
   schema extends `defaultSchema` to keep `className` on `code`/`span`.
3. `rehype-highlight` — add syntax-highlight classes (runs *after* sanitise, so
   its output is trusted and survives).

Share payloads are decoded defensively (`decodeShare` returns `null` on
corrupt input). If you add features that surface remote content, keep
sanitisation on and review the schema before widening it.

## 8. Roadmap / build order

1. ✅ **Foundation** — deps, Tailwind+shadcn theme system, routing, app shell,
   placeholder pages, theme provider/toggle.
2. ✅ **UI scaffolding + editor/preview core + sharing** — responsive editor
   workspace (resizable split / mobile tabs), toolbar (rename, copy, clear,
   stats), live sanitised preview, VS Code editor + highlight theming, and
   shareable links (`lz-string`). Cheatsheet page with search + live examples.
3. ✅ **Files & recents** — upload a local `.md`, download the document, and a
   recent-files history in `localStorage` (`recents-store`, capped by count +
   total size, deduped by name) with a reopen popover (`recents-menu`). Recents
   are recorded on upload and on opening a share link.
4. ⬜ **Cheatsheet** — expand the dataset in `src/data/cheatsheet.ts` and polish.
5. ⬜ **Theming polish** — refine light/dark contrast, code theme, transitions.
6. ⬜ **Tests** — stores (theme, document, recents), share encode/decode,
   sanitisation, components.

(Sharing + always-on sanitisation were pulled forward into step 2 by request.)
