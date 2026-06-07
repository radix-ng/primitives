# ADR 0007: Author Documentation as Markdown in a New AnalogJS App (instead of MDX, a hand-built Angular app, or staying on Astro)

- Status: Proposed
- Date: 2026-06-07
- Decision owners: Radix NG maintainers
- Related apps: new `apps/<docs-app>` (Angular/AnalogJS); existing `apps/radix-docs` (Astro), `apps/radix-storybook`

## Context

We want a documentation surface for Radix NG that is, like [Base UI](https://base-ui.com/),
**content-driven**: a maintainer writes a documentation page as a markdown file and a page renders
from it — no hand-coding a component per page — while still embedding **interactive, live**
component demos. The interactive design produced in Claude design (currently JSX) is meant to seed
this surface. Storybook stays, but narrows to its real job: **debugging primitives**, not being the
public docs.

Three facts constrain the choice:

1. **MDX is not framework-neutral.** MDX is markdown + JSX; its compiler emits a module that calls a
   JSX runtime. It is intrinsically React-shaped, and there is no mature "MDX for Angular". So
   "documentation like Base UI" cannot mean "literally MDX rendering Angular components" without a
   React layer. Angular does **not** parse MDX natively.

2. **The repo already has an Astro + MDX path.** `apps/radix-docs` is Astro and depends on
   `@analogjs/astro-angular` (2.5.3), which renders real Angular components as islands inside
   Astro/MDX. That stack already delivers "MDX authoring + Angular interactivity" — but it keeps the
   docs on Astro, not on an Angular meta-framework, and the interactive shell is Astro's, not
   Angular's.

3. **AnalogJS is already partially present.** `@analogjs/vite-plugin-angular` (2.1.3) powers
   Storybook and Vitest here. AnalogJS is the Angular meta-framework (Vite + Nitro, file-based
   routing); its `@analogjs/content` package provides exactly the content-driven model we want:
   markdown files with frontmatter, `injectContent()` / `injectContentFiles()`, a single dynamic
   route template (`[slug].page.ts`) that renders any markdown file via `<analog-markdown>`, code
   highlighting, and the ability to embed registered Angular components inside markdown.

The requirement crystallized to: **write docs in `.md`, get file-based pages without hand-building
each one, embed interactive Angular components, and keep it a pure Angular app** (Storybook for
debugging only).

### Why the existing options do not fully fit

| Option                                               | Markdown authoring     | File-based pages | Interactive embeds    | Pure Angular app      |
| ---------------------------------------------------- | ---------------------- | ---------------- | --------------------- | --------------------- |
| Astro + MDX + Angular islands (current `radix-docs`) | ✅ `.mdx`              | ✅               | Angular islands       | ❌ (Astro shell)      |
| AnalogJS + `@analogjs/content`                       | ✅ `.md` + frontmatter | ✅               | ✅ Angular components | ✅                    |
| New Angular app + DIY markdown→`NgComponentOutlet`   | ✅ `.md`               | hand-rolled      | ✅ Angular            | ✅ (much custom code) |

The only material difference between Astro+MDX and Analog content is the **last column of the body
text**: MDX allows arbitrary JSX anywhere in prose, whereas Analog content allows markdown plus
**registered** components (named demo/callout/tabs components). For component documentation —
live previews, prop tables, tabs, callouts — registered components are sufficient; arbitrary inline
JSX is not a real requirement.

## Decision

1. Stand up a **new AnalogJS application** in the Nx monorepo as the documentation surface, using
   `@analogjs/content` for markdown-driven pages:
   - Documentation pages live as `.md` files (with frontmatter: `title`, `description`, ordering) under
     the app's content directory.
   - A single dynamic route template renders any markdown file — pages are not hand-built.
   - Interactive blocks (live primitive demos, tabs, theme toggle, copy-code) are **Angular
     components built on `@radix-ng/primitives`**, registered for embedding in markdown.

2. **Narrow Storybook to primitive debugging.** It remains the workbench for developing and
   inspecting primitives; it is no longer positioned as the public documentation site.

3. **Share the Tailwind v4 token system.** The new app reuses the semantic-token `@theme` layer
   currently defined in `apps/radix-storybook/.storybook/tailwind.css` (single source of truth for
   tokens), so docs and demos stay visually consistent. Extract the shared `@theme` + `:root`/dark
   token block into a common `.css` imported by both surfaces rather than copying it.

4. **Do not adopt MDX.** "Like Base UI" is satisfied by content-driven markdown + Angular embeds, not
   by porting a JSX/React MDX layer into an Angular codebase.

5. The Claude design artifact is ported as: static sections → markdown; interactive blocks → Angular
   components embedded in that markdown. Request the source from Claude design as **semantic HTML +
   Tailwind v4 utilities using our semantic tokens**, with interactivity described separately — not as
   JSX, and not as generated Angular.

This ADR records the **direction**; the build is deferred. The open questions below must be resolved
before implementation starts.

## Open Questions (to resolve before building)

- **Angular 21 compatibility.** The workspace is on Angular **21.2.9**. Confirm that
  `@analogjs/platform` and `@analogjs/content` have a release that supports Angular 21 before
  committing; Analog typically trails the Angular major by a short window. If not yet released, the
  decision holds but the start date slips.
- **Coexist vs. replace `radix-docs` (Astro).** Decide whether the AnalogJS app _replaces_ the Astro
  docs or _coexists_ (e.g. new app = landing/showcase, Astro = API reference). This is the single
  biggest scope driver.
- **LLM markdown routes.** `apps/radix-docs` (Astro) currently generates `/llms.txt` and
  `/primitives/**/*.md` for LLM consumption from Storybook MDX. If the AnalogJS app replaces Astro,
  these routes must be reproduced in Analog (file-based `.md`-emitting routes), or LLM docs regress.
- **App name.** e.g. `radix-site`, `radix-web`, `radix-landing`.

## Consequences

### Positive

- Documentation is authored as plain markdown with file-based routing — no per-page Angular
  scaffolding, which is the stated goal.
- The whole surface is a pure Angular app: live demos are real `@radix-ng/primitives` usage, making
  the docs a faithful, dogfooding showcase of the library.
- Reuses tooling already in the repo (`@analogjs/vite-plugin-angular`), so AnalogJS is an incremental
  addition rather than a new ecosystem.
- One Tailwind token source shared by docs and Storybook keeps visuals consistent.
- Storybook regains a focused role (primitive debugging), reducing the pull to make it do double duty.

### Negative / Risks

- No arbitrary inline JSX in prose (the one capability MDX has that Analog content lacks). Mitigated:
  component docs need registered components, not free-form JSX.
- A new app is real surface area: build target, routing, SEO/SSG, navigation, search, deploy. If it
  replaces Astro, it must also re-create the LLM `.md`/`llms.txt` routes.
- Version-timing risk against Angular 21 (see Open Questions); could delay start.
- Migration of existing Storybook MDX content into the new markdown format is non-trivial if the
  AnalogJS app is meant to subsume today's docs content.

## Alternatives Considered

### Stay on Astro + MDX with Angular islands (current `radix-docs`)

Already delivers MDX authoring + Angular interactivity and requires the least change. Rejected as the
primary docs surface because it keeps the shell on Astro rather than a pure Angular meta-framework,
and the goal is an Angular app. Retained as a viable coexistence option (API reference / LLM routes)
pending the coexist-vs-replace decision.

### Port/adopt MDX into an Angular app

MDX needs a JSX runtime; bringing it into Angular means dragging in a React-shaped rendering layer or
maintaining a bespoke MDX-to-Angular compiler. High cost, re-implements framework features, and only
to gain arbitrary-inline-JSX that component docs do not need. Rejected.

### New Angular app with a DIY markdown → dynamic-component pipeline

Parse markdown (marked/markdown-it) and render embedded components via `NgComponentOutlet`. Gives
full control but re-invents file-based routing, frontmatter, highlighting, and the content pipeline
that `@analogjs/content` already provides. Rejected as needless custom infrastructure.

### Keep documentation in Storybook MDX only

Storybook is a primitive workbench, not a public documentation site; its MDX is React-flavored and
its navigation/SEO are not a docs product. Rejected as the public surface; retained for debugging.

## Trigger for Revisit

- `@analogjs/platform` / `@analogjs/content` prove not to support Angular 21 within an acceptable
  window — reconsider coexistence on Astro as the longer-term path.
- A genuine need for arbitrary inline JSX-like authoring emerges that registered components cannot
  cover — re-evaluate an MDX-capable (React-layer) approach for that subset.
- Angular ships a first-party content/markdown-routing story that supersedes `@analogjs/content`.
- The coexist-vs-replace decision lands on "replace", materially expanding scope (LLM routes, content
  migration) — split into its own implementation ADR.
