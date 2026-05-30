import { ExternalLink, Github } from "lucide-react";

const LINKS = [
  {
    href: "https://github.com/yourgotopyromaniac",
    label: "GitHub",
    Icon: Github,
  },
  {
    href: "https://biola.is-a.dev",
    label: "Portfolio",
    Icon: ExternalLink,
  },
] as const;

const sectionStyle = { marginTop: "1.5rem" };
const headingStyle = { marginBottom: "0.5rem" };
const creatorBodyStyle = { marginBottom: "1rem" };

export default function AboutPage() {
  return (
    <div className="flex h-full min-h-[calc(100vh-3.5rem)] items-center justify-center overflow-auto bg-background px-5 py-10 text-foreground sm:px-8">
      <article className="w-full max-w-3xl">
        <header>
          <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-primary">
            About
          </p>
          <h1 className="mb-6 font-display text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
            Better Markdown
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-foreground">
            A fast, fully client-side Markdown editor with a live preview, local
            file open/download, recent files, shareable compressed links, a
            searchable cheatsheet, and light, dark, system, and accent theme
            controls.
          </p>
        </header>

        <div className="text-sm leading-7 text-foreground">
          <section aria-labelledby="inspiration" style={sectionStyle}>
            <h2
              id="inspiration"
              className="font-display text-xl font-semibold tracking-tight text-primary"
              style={headingStyle}
            >
              Inspiration
            </h2>
            <p className="max-w-2xl">
              Inspired by{" "}
              <a
                href="https://markdownlivepreview.dev/"
                target="_blank"
                rel="noreferrer"
                className="font-medium text-primary underline-offset-4 hover:underline"
              >
                markdownlivepreview.dev
              </a>
              , with extra care around privacy, sharing, theming, and a cleaner
              writing flow.
            </p>
          </section>

          <section aria-labelledby="creator" style={sectionStyle}>
            <h2
              id="creator"
              className="font-display text-xl font-semibold tracking-tight text-primary"
              style={headingStyle}
            >
              Creator
            </h2>
            <div>
              <p style={creatorBodyStyle}>
                Built by{" "}
                <span className="font-medium text-primary">
                  yourgotopyromaniac
                </span>
                .
              </p>
              <div className="flex flex-wrap gap-3">
                {LINKS.map(({ href, label, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-md border border-primary/30 px-3 text-sm font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    <Icon className="size-4" />
                    {label}
                  </a>
                ))}
              </div>
            </div>
          </section>
        </div>
      </article>
    </div>
  );
}
