# Styling guide for demos

Radix NG primitives are **headless** — directives carry no styles. The styling you see in
Storybook lives entirely in the demos. This page is the single source of truth for how those demos
look, so examples stay consistent instead of each story reinventing its own classes.

Visual reference: [coss.com](https://coss.com/ui) (Base UI + Tailwind). The Storybook theme in
`apps/radix-storybook/.storybook/demo-styles.css` defines these tokens and their light and dark values.

## Rules

1. **Use Tailwind v4 utilities** directly in templates. No story-local CSS files, no `styleUrl` /
   `styles`, no inline `<style>` or `style="…"`. (Documented exceptions: CSS custom properties for
   animation dimensions.)
2. **Keep shared styles in one place.** Theme values belong in `@theme`. Stable combinations of
   classes that should change together may use `@apply` in the shared `@layer components`.
   Keep sizes, spacing, layout and state utilities specific to an example visible in its template.
   Reuse the common classes from `demo-styles.css`.
3. **Reach for semantic tokens first** — `bg-background`, `text-foreground`, `bg-muted`,
   `bg-popover`, `border-border`, `text-primary-foreground`, `ring-ring`. Avoid raw Radix theme
   colors (`violet`, `mauve`, `black-a*`) or hard-coded `white`/`black` when a token exists. These
   tokens respond to the Storybook **theme toolbar** (light/dark), so demos work in both.
4. **Wrap demos** with `tailwindDemoDecorator()` (or keep `data-demo="tailwind"` on the outermost
   container) so Tailwind preflight and the theme variables stay active.
5. **Type dynamic variants in TS** and use full class names (for example, a typed map of
   `compact: 'w-64 p-3'` and `comfortable: 'w-80 p-4'`). Tailwind cannot discover interpolated
   fragments such as `w-${size}`.

## The style layer

Storybook and Playground share `apps/radix-storybook/.storybook/main.css`, which imports
`demo-styles.css`. That portable stylesheet owns the theme, common recipes and keyframes.

| Class | Purpose |
| --- | --- |
| `demo-button` | Button appearance, intrinsic alignment, shared focus and disabled states. |
| `demo-button-primary`, `demo-button-outline`, … | One button color variant. |
| `demo-input` | Text input appearance and shared focus. |
| `demo-focus` | The same focus-visible ring for other controls. |
| `demo-surface` | Card or panel colors, border, rounding and shadow. |
| `demo-arrow` | Common popup arrow fill and border shadow. |
| `demo-label` | Shared label typography. |
| `demo-select-*`, `demo-combobox-*`, … | Appearance shared by parts of one family. |

Sizes, spacing, content layout and state rules specific to an example stay in the template:

```html
<button rdxButton class="demo-button demo-button-primary h-9 px-4">Primary</button>
<button rdxButton class="demo-button demo-button-outline h-8 px-3 text-xs">Outline</button>
<input rdxInput class="demo-input h-9 w-full px-3" />
<div
  rdxPopoverPopup
  class="demo-surface relative w-80 p-4 data-[starting-style]:animate-popover-popup-in data-[ending-style]:animate-popover-popup-out"
>…</div>
```

The button variants are `primary`, `secondary`, `outline`, `ghost` and `destructive`. Sizes are
ordinary utilities on each example. `demo-button` handles native `disabled`, `data-disabled` and
`aria-disabled`; `demo-focus` is also shared by button and input selectors in a single declaration.

Utilities have priority over `components`. Local `bg-muted`, `border-transparent`, `shadow-none`
or size utilities override the corresponding common defaults regardless of class-string order.

## Copy an example into your app

The component's **Show code** uses explicit imports from public Radix NG entry points. The page's
**Setup and shared files** section includes wrapper/helper sources, dependencies and the actual CSS
read with `?raw` from the file used by both applications. Consumer skills preserve those same blocks.
The old TS style exports and Playground's re-export are no longer needed.

Install `@radix-ng/primitives` and the dependencies listed on the example page, such as
`@lucide/angular` for icons. Configure Tailwind v4 through `@tailwindcss/postcss`. Save the supplied
CSS as `demo-styles.css`, then import it after Tailwind in your global stylesheet:

```css
@import 'tailwindcss';
@import './demo-styles.css';
```

Import the example component into its parent and use its selector. Copy additional files alongside
it, preserving their relative import paths. Set `data-theme="dark"` on `<html>` for the dark theme.
Explicit directive imports also work when Angular compiles the copied component against an installed
package: avoid spreading published arrays such as `popoverImports` in component metadata.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxButtonDirective } from '@radix-ng/primitives/button';

@Component({
    host: { class: 'contents' },
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'rdx-button-default-example',
    imports: [RdxButtonDirective],
    template: `
        <button class="demo-button demo-button-primary h-9 px-4" rdxButton>Button</button>
    `
})
export class ButtonDefaultStory {}
```

<details>
<summary>demo-styles.css</summary>

```css
@theme {
    --duration-demo-drawer-swipe: 450ms;
    --duration-demo-drawer-keyboard: 200ms;
    --duration-demo-drawer-page-transform: 400ms;
    --duration-demo-drawer-page-radius: 250ms;
    --duration-demo-presence-animation: 300ms;
    --duration-demo-presence-dynamic: 2s;
    --ease-demo-drawer-swipe: cubic-bezier(0.32, 0.72, 0, 1);
    --transition-demo-drawer-swipe: transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer-snap:
        transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe),
        box-shadow var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer-keyboard:
        transform var(--duration-demo-drawer-swipe) var(--ease-demo-drawer-swipe),
        max-height var(--duration-demo-drawer-keyboard) ease;
    --transition-demo-drawer-page:
        transform var(--duration-demo-drawer-page-transform) var(--ease-demo-drawer-swipe),
        border-radius var(--duration-demo-drawer-page-radius) var(--ease-demo-drawer-swipe);
    --transition-demo-drawer: transform 300ms ease, scale 300ms ease, translate 300ms ease;
    --transition-demo-toast-stack: transform 320ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease;
    --transition-demo-toast-swipe: transform 220ms ease;
    --color-*: initial;
    --color-white: white;
    --color-black: black;

    /* Gray scale that is roughly compatible with Tailwind's grays */
    --color-gray-50: oklch(98% 0.25% 264deg);
    --color-gray-75: oklch(97% 0.325% 264deg); /* Not a Tailwind step, don't use it in the demos */
    --color-gray-100: oklch(12% 9.5% 264deg / 5%);
    --color-gray-200: oklch(12% 9% 264deg / 7%);
    --color-gray-300: oklch(12% 8.5% 264deg / 17%);
    --color-gray-400: oklch(12% 8% 264deg / 38%);
    --color-gray-500: oklch(12% 7.5% 264deg / 50%);
    --color-gray-600: oklch(12% 7% 264deg / 67%);
    --color-gray-700: oklch(12% 6% 264deg / 77%);
    --color-gray-800: oklch(12% 5% 264deg / 85%);
    --color-gray-900: oklch(12% 5% 264deg / 90%);
    --color-gray-950: oklch(12% 5% 264deg / 95%);

    /* Functional colors for the docs */
    --color-content: white;
    --color-popup: var(--popover);
    --color-gridline: oklch(91.6% 1% 264deg);
    --color-selection: oklch(80% 50% 264deg / 25%);
    --color-highlight: var(--color-blue);
    --color-line-highlight: oklch(80% 50% 264deg / 10%);
    --color-line-highlight-strong: oklch(80% 50% 264deg / 25%);
    --color-inline-highlight: oklch(80% 50% 264deg / 15%);

    /* Text colors for the docs */
    --color-gray: var(--color-gray-600);
    --color-navy: oklch(31% 25% 264deg);
    --color-blue: oklch(45% 50% 264deg);
    --color-green: oklch(46% 30% 150deg);
    --color-purple: oklch(40% 45% 360deg);
    --color-violet: oklch(40% 60% 300deg);
    --color-red: oklch(50% 55% 31deg);

    /* Typography */
    --font-sans:
        Inter, ui-sans-serif, system-ui, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol',
        'Noto Color Emoji';
    --font-mono:
        'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New',
        monospace;

    --text-xs: 0.8125rem;
    --text-xs--line-height: 1.25rem;
    --text-xs--letter-spacing: 0.001em;

    --text-sm: 0.875rem;
    --text-sm--line-height: 1.25rem;
    --text-sm--letter-spacing: 0.016em;

    --text-md: 0.9375rem;
    --text-md--line-height: 1.375rem;
    --text-md--letter-spacing: 0.016em;

    --text-base: 1rem;
    --text-base--line-height: 1.5rem;
    --text-base--letter-spacing: 0em;

    --text-lg: 1.125rem;
    --text-lg--line-height: 1.75rem;
    --text-lg--letter-spacing: -0.0025em;

    --text-xl: 1.3125rem;
    --text-xl--line-height: 1.625rem;
    --text-xl--letter-spacing: -0.005em;

    --text-2xl: 1.5rem;
    --text-2xl--line-height: 1.25;
    --text-2xl--letter-spacing: -0.0125em;

    --text-3xl: 1.875rem;
    --text-3xl--line-height: 1.2;
    --text-3xl--letter-spacing: -0.015em;

    --text-4xl: 2.25rem;
    --text-4xl--line-height: 2.5rem;
    --text-4xl--letter-spacing: -0.015em;

    --text-5xl: 3rem;
    --text-5xl--line-height: 1;
    --text-5xl--letter-spacing: -0.015em;

    --text-6xl: 3.75rem;
    --text-6xl--line-height: 0.95;
    --text-6xl--letter-spacing: -0.015em;

    --ease-out-fast: cubic-bezier(0.45, 1.005, 0, 1.005);
    --ease-in-slow: cubic-bezier(0.375, 0.015, 0.545, 0.455);
    --header-height: 3rem;

    --animate-popover-in: popover-in 150ms ease-out;
    --animate-popover-out: popover-out 120ms ease-in forwards;
    --animate-popover-viewport-in: popover-viewport-in 200ms ease-out;
    --animate-popover-viewport-out: popover-viewport-out 200ms ease-in forwards;

    --animate-navigation-menu-popup-in: navigation-menu-popup-in 200ms ease;
    --animate-navigation-menu-popup-out: navigation-menu-popup-out 200ms ease forwards;
    --animate-navigation-menu-content-in: navigation-menu-content-in 250ms ease;
    --animate-navigation-menu-content-out: navigation-menu-content-out 250ms ease forwards;

    --animate-dialog-overlay-in: dialog-overlay-in 150ms ease-out;
    --animate-dialog-overlay-out: dialog-overlay-out 150ms ease-in forwards;
    --animate-dialog-popup-in: dialog-popup-in 150ms ease-out;
    --animate-dialog-popup-out: dialog-popup-out 150ms ease-in forwards;

    --animate-drawer-overlay-in: dialog-overlay-in 250ms ease-out;
    --animate-drawer-overlay-out: dialog-overlay-out 200ms ease-in forwards;
    --animate-drawer-in-bottom: drawer-in-bottom 250ms ease-out;
    --animate-drawer-out-bottom: drawer-out-bottom 200ms ease-in forwards;
    --animate-drawer-in-top: drawer-in-top 250ms ease-out;
    --animate-drawer-out-top: drawer-out-top 200ms ease-in forwards;
    --animate-drawer-in-left: drawer-in-left 250ms ease-out;
    --animate-drawer-out-left: drawer-out-left 200ms ease-in forwards;
    --animate-drawer-in-right: drawer-in-right 250ms ease-out;
    --animate-drawer-out-right: drawer-out-right 200ms ease-in forwards;

    --animate-toast-in: toast-in 300ms cubic-bezier(0.22, 1, 0.36, 1);
    --animate-toast-out: toast-out 250ms ease-in forwards;
    --animate-toast-in-top: toast-in-top 300ms cubic-bezier(0.22, 1, 0.36, 1);
    --animate-toast-out-top: toast-out-top 250ms ease-in forwards;

    --animate-accordion-down: accordion-down 200ms ease-out;
    --animate-accordion-up: accordion-up 200ms ease-out;
    --animate-accordion-right: accordion-right 200ms ease-out;
    --animate-accordion-left: accordion-left 200ms ease-out;

    --animate-tabs-panel-in: tabs-panel-in 250ms ease;
    --animate-tabs-panel-out: tabs-panel-out 200ms ease;
}

@theme {
    /* Semantic colors shared by Tailwind demos */
    --color-background: var(--background);
    --color-foreground: var(--foreground);
    --color-card: var(--card);
    --color-card-foreground: var(--card-foreground);
    --color-popover: var(--popover);
    --color-popover-foreground: var(--popover-foreground);
    --color-primary: var(--primary);
    --color-primary-foreground: var(--primary-foreground);
    --color-muted: var(--muted);
    --color-muted-foreground: var(--muted-foreground);
    --color-destructive: var(--destructive);
    --color-destructive-foreground: var(--destructive-foreground);
    --color-border: var(--border);
    --color-ring: var(--ring);
    --color-input: var(--border);
    --color-accent: var(--muted);
    --color-accent-foreground: var(--foreground);
    /* Distinct accent for search-match highlighting (e.g. fuzzy results). Stays available in demos
       (not reset in the [data-demo] block below), unlike the docs-only `--color-highlight`. */
    --color-match: var(--match);

    --animate-popover-popup-in: popover-popup-in 150ms ease-out;
    --animate-popover-popup-out: popover-popup-out 120ms ease-in forwards;
}

:root {
    --background: white;
    --foreground: oklch(14.5% 1% 264deg);
    --card: white;
    --card-foreground: var(--foreground);
    --popover: white;
    --popover-foreground: var(--foreground);
    --primary: oklch(20.5% 1% 264deg);
    --primary-foreground: white;
    --muted: oklch(96.5% 0.5% 264deg);
    --muted-foreground: oklch(46% 1% 264deg);
    --destructive: oklch(57.7% 0.245 27.325deg);
    --destructive-foreground: white;
    --border: oklch(90% 1% 264deg);
    --ring: oklch(55% 1% 264deg);
    --match: oklch(45% 50% 264deg);
}

:root[data-theme='dark'] {
    --background: oklch(14.5% 1% 264deg);
    --foreground: oklch(96% 0.5% 264deg);
    --card: oklch(18% 1% 264deg);
    --card-foreground: var(--foreground);
    --popover: oklch(18% 1% 264deg);
    --popover-foreground: var(--foreground);
    --primary: oklch(92% 0.5% 264deg);
    --primary-foreground: oklch(18% 1% 264deg);
    --muted: oklch(24% 1% 264deg);
    --muted-foreground: oklch(70% 1% 264deg);
    --destructive: oklch(70.4% 0.191 22.216deg);
    --destructive-foreground: oklch(18% 1% 264deg);
    --border: oklch(30% 1% 264deg);
    --ring: oklch(65% 1% 264deg);
    --match: oklch(69% 50% 264deg);

    --color-gray-50: oklch(17% 0.25% 264deg);
    --color-gray-75: oklch(19% 0.5% 264deg); /* Not a Tailwind step, don't use it in the demos */
    --color-gray-100: oklch(28% 0.75% 264deg / 65%);
    --color-gray-200: oklch(29% 0.75% 264deg / 80%);
    --color-gray-300: oklch(35% 0.75% 264deg / 80%);
    --color-gray-400: oklch(47% 0.875% 264deg / 80%);
    --color-gray-500: oklch(64% 1% 264deg / 80%);
    --color-gray-600: oklch(82% 1% 264deg / 80%);
    --color-gray-700: oklch(92% 1.125% 264deg / 80%);
    --color-gray-800: oklch(93% 0.875% 264deg / 85%);
    --color-gray-900: oklch(95% 0.5% 264deg / 90%);
    --color-gray-950: oklch(94% 0.375% 264deg / 95%);

    /* Functional colors */
    --color-content: black;
    --color-gridline: oklch(24% 1% 264deg);
    --color-highlight: oklch(45% 40% 264deg);
    --color-selection: oklch(50% 50% 264deg / 40%);
    --color-line-highlight: oklch(50% 50% 264deg / 20%);
    --color-line-highlight-strong: oklch(50% 50% 264deg / 35%);
    --color-inline-highlight: oklch(50% 50% 264deg / 35%);

    /* Text colors */
    --color-gray: var(--color-gray-600);
    --color-blue: oklch(69% 50% 264deg);
    --color-green: oklch(75% 25% 150deg);
    --color-navy: oklch(85% 25% 264deg);
    --color-purple: oklch(85% 30% 360deg);
    --color-red: oklch(80% 55% 31deg);
    --color-violet: oklch(80% 60% 280deg);
}

@layer components {
    .demo-surface {
        @apply bg-card text-card-foreground border-border rounded-md border shadow-sm;
    }
}

@keyframes popover-popup-in {
    from {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}

@keyframes popover-popup-out {
    from {
        opacity: 1;
        transform: translateY(0) scale(1);
    }

    to {
        opacity: 0;
        transform: translateY(-0.25rem) scale(0.98);
    }
}

@layer components {
    .demo-focus,
    .demo-button,
    .demo-input,
    .demo-combobox-select-trigger {
        @apply focus-visible:ring-ring focus-visible:ring-offset-background outline-none focus-visible:ring-2 focus-visible:ring-offset-2;
    }

    .demo-arrow {
        @apply fill-current drop-shadow-[0_1px_0_var(--color-border)];
    }

    .demo-button {
        @apply inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-colors disabled:pointer-events-none disabled:opacity-50 aria-disabled:cursor-not-allowed aria-disabled:opacity-50 data-[disabled]:pointer-events-none data-[disabled]:opacity-50;
    }

    .demo-button-primary {
        @apply bg-primary text-primary-foreground hover:bg-primary/90;
    }

    .demo-button-secondary {
        @apply bg-muted text-foreground hover:bg-muted/80;
    }

    .demo-button-outline {
        @apply border-border bg-background text-foreground hover:bg-muted border;
    }

    .demo-button-ghost {
        @apply text-foreground hover:bg-muted;
    }

    .demo-button-destructive {
        @apply bg-destructive text-destructive-foreground hover:bg-destructive/90;
    }

    .demo-input {
        @apply border-border bg-background text-foreground placeholder:text-muted-foreground rounded-md border text-sm;
    }

    .demo-select-trigger {
        @apply border-border bg-background text-foreground hover:bg-muted rounded-md border text-start text-sm shadow-sm disabled:cursor-not-allowed;
    }

    .demo-select-popup {
        @apply border-border bg-popover text-popover-foreground rounded-lg border shadow-md;
    }

    .demo-select-item {
        @apply text-popover-foreground cursor-default rounded-sm text-sm leading-none outline-none select-none;
    }

    .demo-select-group-label {
        @apply text-muted-foreground text-xs leading-6;
    }

    .demo-select-scroll-button {
        @apply bg-popover text-muted-foreground hover:bg-muted cursor-default;
    }

    .demo-otp-field-slot {
        @apply border-border bg-background text-foreground rounded-md border text-center font-mono text-lg;
    }

    .demo-label {
        @apply text-foreground text-sm font-medium;
    }

    .demo-editable-preview {
        @apply text-foreground hover:bg-muted cursor-text rounded-md border border-transparent text-sm;
    }

    .demo-calendar-root {
        @apply border-border bg-background rounded-xl border shadow-sm;
    }

    .demo-calendar-head-cell {
        @apply text-muted-foreground rounded-md text-center text-xs;
    }

    .demo-calendar-day {
        @apply text-foreground hover:bg-muted cursor-pointer rounded-full text-sm outline-none;
    }

    .demo-dialog-title {
        @apply text-card-foreground text-base font-semibold;
    }

    .demo-drawer-popup {
        @apply bg-card text-card-foreground shadow-lg;
    }

    .demo-drawer-side-bottom {
        @apply border-border rounded-t-2xl border-t border-b-0;
    }

    .demo-drawer-side-top {
        @apply border-border rounded-b-2xl border-b;
    }

    .demo-drawer-side-left {
        @apply border-border rounded-r-2xl border-r;
    }

    .demo-drawer-side-right {
        @apply border-border rounded-l-2xl border-l;
    }

    .demo-toast-title {
        @apply text-card-foreground text-sm font-semibold;
    }

    .demo-popover-title {
        @apply text-popover-foreground text-sm font-semibold;
    }

    .demo-checkbox-button {
        @apply border-border bg-background rounded-md border shadow-sm disabled:cursor-not-allowed aria-disabled:cursor-not-allowed;
    }

    .demo-radio-item {
        @apply border-border bg-background hover:bg-muted rounded-full border shadow-sm disabled:cursor-not-allowed;
    }

    .demo-avatar-root {
        @apply bg-muted rounded-full select-none;
    }

    .demo-accordion-root {
        @apply border-border bg-card rounded-xl border shadow-xs;
    }

    .demo-accordion-item-h {
        @apply border-border border-r border-b-0;
    }

    .demo-accordion-trigger {
        @apply bg-background text-foreground hover:bg-muted aria-disabled:text-muted-foreground aria-disabled:hover:bg-background cursor-default text-[15px] transition-colors aria-disabled:cursor-not-allowed;
    }

    .demo-accordion-content {
        @apply text-muted-foreground bg-muted text-[15px];
    }

    .demo-navigation-menu-trigger {
        @apply hover:bg-muted focus-visible:bg-muted rounded-md outline-none;
    }

    .demo-navigation-menu-card-link {
        @apply hover:bg-muted focus-visible:bg-muted rounded-md transition-colors outline-none select-none;
    }

    .demo-navigation-menu-card-text {
        @apply text-muted-foreground text-sm leading-snug;
    }

    .demo-tooltip-popup {
        @apply border-border bg-popover text-popover-foreground rounded-md border text-sm select-none;
    }

    .demo-menubar-root {
        @apply border-border bg-background rounded-md border shadow-sm;
    }

    .demo-menubar-trigger {
        @apply hover:bg-muted focus-visible:bg-muted cursor-default rounded-sm text-sm font-medium whitespace-nowrap outline-none select-none;
    }

    .demo-menu-context-area {
        @apply border-border text-muted-foreground focus-visible:outline-ring rounded-md border-2 border-dashed text-sm select-none focus-visible:outline-2;
    }

    .demo-menu-popup {
        @apply bg-popover text-popover-foreground border-border rounded-md border shadow-md outline-none;
    }

    .demo-menu-item {
        @apply cursor-default rounded-sm text-sm outline-none select-none;
    }

    .demo-menu-selectable-item {
        @apply cursor-default rounded-sm text-start text-sm outline-none select-none;
    }

    .demo-menu-group-label {
        @apply text-muted-foreground text-xs font-semibold;
    }

    .demo-cropper-root {
        @apply cursor-move touch-none rounded-lg outline-none;
    }

    .demo-cropper-crop-area {
        @apply border-[3px] border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.4)] group-focus-visible:shadow-[0_0_0_9999px_rgba(0,0,0,0.4),0_0_0_3px_rgba(255,255,255,0.5)];
    }

    .demo-cropper-output {
        @apply bg-muted text-muted-foreground rounded-md text-sm whitespace-pre;
    }

    .demo-combobox-control {
        @apply border-border bg-background rounded-md border;
    }

    .demo-combobox-input {
        @apply text-foreground rounded-md bg-transparent text-sm outline-none;
    }

    .demo-combobox-input-inline {
        @apply text-foreground bg-transparent text-sm outline-none;
    }

    .demo-combobox-trigger {
        @apply text-muted-foreground hover:text-foreground rounded-sm;
    }

    .demo-combobox-popup {
        @apply border-border bg-popover text-popover-foreground rounded-md border shadow-md;
    }

    .demo-combobox-empty {
        @apply text-muted-foreground text-center text-sm;
    }

    .demo-combobox-select-trigger {
        @apply border-border bg-background text-foreground hover:bg-muted rounded-md border text-sm;
    }

    .demo-combobox-popup-input {
        @apply text-foreground rounded-sm bg-transparent text-sm outline-none;
    }

    .demo-combobox-chip {
        @apply bg-muted text-foreground rounded text-xs;
    }
}

@keyframes tabs-panel-in {
    from {
        opacity: 0;
        transform: translateY(6px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes tabs-panel-out {
    from {
        opacity: 1;
        transform: translateY(0);
    }

    to {
        opacity: 0;
        transform: translateY(6px);
    }
}

@keyframes accordion-down {
    from {
        height: 0;
    }

    to {
        height: var(--accordion-panel-height);
    }
}

@keyframes accordion-up {
    from {
        height: var(--accordion-panel-height);
    }

    to {
        height: 0;
    }
}

@keyframes accordion-right {
    from {
        width: 0;
    }

    to {
        width: var(--accordion-panel-width);
    }
}

@keyframes accordion-left {
    from {
        width: var(--accordion-panel-width);
    }

    to {
        width: 0;
    }
}

@keyframes popover-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes popover-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

@keyframes popover-viewport-in {
    from {
        opacity: 0;
        transform: translateX(0.5rem);
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes popover-viewport-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }

    to {
        opacity: 0;
        transform: translateX(-0.5rem);
    }
}

@keyframes navigation-menu-popup-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes navigation-menu-popup-out {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(0.96);
    }
}

/*
 * Content morph between items. The viewport sets `data-activation-direction` so the entering and
 * leaving content slide toward the newly active trigger.
 */
@keyframes navigation-menu-content-in {
    from {
        opacity: 0;
        transform: translateX(var(--navigation-menu-content-in-x, 0));
    }

    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes navigation-menu-content-out {
    from {
        opacity: 1;
        transform: translateX(0);
    }

    to {
        opacity: 0;
        transform: translateX(var(--navigation-menu-content-out-x, 0));
    }
}

@keyframes dialog-overlay-in {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

@keyframes dialog-overlay-out {
    from {
        opacity: 1;
    }

    to {
        opacity: 0;
    }
}

/*
 * Centering is handled by the popup's `-translate-x-1/2 -translate-y-1/2` utilities, which Tailwind v4
 * compiles to the standalone `translate` property. These keyframes must therefore animate only
 * `transform: scale()` — re-applying `translate(-50%, -50%)` here would compose with the `translate`
 * property and shift the popup by an extra -50%/-50% for the duration of the animation.
 */
@keyframes dialog-popup-in {
    from {
        opacity: 0;
        transform: scale(0.96);
    }

    to {
        opacity: 1;
        transform: scale(1);
    }
}

@keyframes dialog-popup-out {
    from {
        opacity: 1;
        transform: scale(1);
    }

    to {
        opacity: 0;
        transform: scale(0.96);
    }
}

/*
 * Drawer slide keyframes. The popup's resting transform is driven by the swipe variables
 * (--drawer-swipe-movement-*), so these animate the full `transform` to slide the panel on/off the
 * matching edge; when the animation ends the resting swipe transform (0 by default) takes over.
 */
@keyframes drawer-in-bottom {
    from {
        transform: translateY(100%);
    }
}

@keyframes drawer-out-bottom {
    to {
        transform: translateY(100%);
    }
}

@keyframes drawer-in-top {
    from {
        transform: translateY(-100%);
    }
}

@keyframes drawer-out-top {
    to {
        transform: translateY(-100%);
    }
}

@keyframes drawer-in-left {
    from {
        transform: translateX(-100%);
    }
}

@keyframes drawer-out-left {
    to {
        transform: translateX(-100%);
    }
}

@keyframes drawer-in-right {
    from {
        transform: translateX(100%);
    }
}

@keyframes drawer-out-right {
    to {
        transform: translateX(100%);
    }
}

@keyframes toast-in {
    from {
        transform: translateX(110%);
        opacity: 0;
    }
}

@keyframes toast-out {
    to {
        transform: translateX(110%);
        opacity: 0;
    }
}

@keyframes toast-in-top {
    from {
        transform: translateY(-120%);
        opacity: 0;
    }
}

@keyframes toast-out-top {
    to {
        transform: translateY(-120%);
        opacity: 0;
    }
}

@layer base {
    body {
        color: var(--foreground);
        background-color: var(--background);
        font-synthesis: none;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }
}

@layer components {
    .demo-switch {
        @apply bg-muted cursor-pointer rounded-full border-0 shadow-sm transition-colors;
    }

    .demo-switch-thumb {
        @apply bg-background rounded-full shadow-sm;
    }
}

@layer components {
    .demo-tabs-root {
        @apply border-border bg-background text-foreground rounded-xl border shadow-sm;
    }
}

@layer components {
    .demo-tabs-list {
        @apply border-border bg-muted/30 border-b;
    }
}

@layer components {
    .demo-tabs-tab {
        @apply text-muted-foreground hover:text-foreground text-sm font-medium transition-colors outline-none;
    }
}

@layer components {
    .demo-tabs-panel {
        @apply bg-background text-foreground text-sm leading-6 outline-none;
    }
}

@layer components {
    .demo-toolbar-root {
        @apply border-border bg-background rounded-lg border shadow-sm;
    }
}

@layer components {
    .demo-toolbar-button {
        @apply text-foreground hover:bg-muted rounded-md text-sm font-medium transition-colors outline-none;
    }
}

@layer components {
    .demo-toolbar-toggle {
        @apply text-muted-foreground hover:bg-muted rounded-md transition-colors outline-none;
    }
}

@layer components {
    .demo-toolbar-link {
        @apply text-muted-foreground hover:text-foreground rounded-md text-sm outline-none;
    }
}
```

</details>

## Positioning popups: put `z-index` on the positioner

Popper-based popups (Combobox, Select, Popover, Menu, Tooltip, …) render a **positioner** wrapper
(`RdxPopperContentWrapper`) around the **popup** content (`RdxPopperContent`). The positioner is the
element teleported into the body and given a `position: fixed`/`absolute`, so it is the natural owner
of the stacking `z-index` — Base UI places it there too.

Practical rule: **set the stacking `z-*` on the positioner element, not the popup.**

```html
<!-- ✅ z on the positioner -->
<div rdxComboboxPositioner class="z-50 w-64">
  <div rdxComboboxPopup class="…">…</div>
</div>
```

This matters most in **modal** mode: a `Backdrop` (e.g. `z-40`) must sit *below* the popup. Putting
the `z-*` on the positioner keeps the whole popup above the backdrop.

> **Migration (ADR 0012).** Earlier versions copied the popup's computed `z-index` onto the
> positioner, so the guidance was the inverse ("put `z-*` on the popup"). The positioner no longer
> copies anything; if you set the stacking `z-*` on the popup, move it up one element to the
> positioner. Combobox templates place `z-50` on the positioner for this reason.
