# Server-Side Rendering & Hydration

Using Radix NG primitives with Angular SSR, full hydration and incremental `@defer` hydration.

Radix NG is built to render on the server with [`@angular/ssr`](https://angular.dev/guide/ssr) and
hydrate cleanly on the client. Headless UI primitives are a classic source of hydration mismatches —
generated IDs, portals that move DOM around, layout measurements, and `window` / `document` access all
have to behave identically (or do nothing) on the server. This guide explains how the library handles
each, and what you need to do in your own code.

## Why headless primitives are tricky under SSR

Four things commonly break hydration in a component library:

- **Non-deterministic IDs** — if `id` / `aria-*` values differ between server and client, Angular
  reports a hydration mismatch.
- **`window` / `document` access** — touching browser globals during server render throws.
- **Portals** — teleporting an element to `document.body` changes the DOM tree shape.
- **Measurements & positioning** — reading layout (sizes, `getComputedStyle`, Floating UI) is
  meaningless on the server.

Radix NG addresses all four. The sections below describe the mechanism and the consumer-facing
implication of each.

## Stable IDs

Primitives generate their internal `id` / `aria-*` values with `injectId` (backed by `RdxIdGenerator`
in `@radix-ng/primitives/core`). Server allocations are stored on their Angular-owned native owner
and recovered during hydration. Sibling `@defer` islands can hydrate in a different order from SSR.
Transferred counters reserve every server ID before new client content is created. Use matching
`APP_ID` values on server/client and distinct values for multiple applications in one document.

```ts
import { injectId } from '@radix-ng/primitives/core';

// Recovers this owner's server ID, independently of other islands' hydration order.
readonly contentId = injectId('rdx-dialog-content-');
```

**What you need to do:** when you generate your own IDs (e.g. wiring a custom label to a control), use
`injectId` too — or any deterministic source. Avoid `Math.random()` / `Date.now()` / `crypto.randomUUID()`
for render-time IDs, since those differ between server and client and will trigger a mismatch.

Keep constructor allocations stable within each owner and prefix. Generated IDs are opaque;
preserve their SSR metadata and the inert managed templates used by comment-backed owners such as
`ng-container`. `RdxIdGenerator.getId()` and `injectId` outside a native view owner allocate fresh
IDs; use explicit application IDs for persistent business identity.

## Browser-only work runs after render

Work which requires browser layout or interaction —
`ResizeObserver`, event listeners, geometry — is deferred to `afterNextRender()` / `afterRenderEffect()`,
which Angular runs **only in the browser, after the first render**. Examples: the Tabs indicator measures
the active tab, Scroll Area sets up its `ResizeObserver`, and Select's item-aligned positioning measures
the trigger — all after render, never on the server.

Where a primitive must touch `window` / `document` outside a render hook, it guards with
`isPlatformBrowser(inject(PLATFORM_ID))`. For instance, `RdxLiveAnnouncer` is a **no-op on the server**
and only appends its visually-hidden `aria-live` region once running in the browser.

**What you need to do:** apply the same discipline in your own wrapper components and demos — guard any
`window` / `document` access with `isPlatformBrowser`, or move it into `afterNextRender()`.

## Portals render in place on the server

Attribute `rdxPortal` and structural portals used by Dialog, Popover, Menu and Select render at
their declaration on the server. Browser render hooks move the existing nodes to their destination
in the write phase, before focus/background-isolation hooks inspect their final ancestry.

In practice this is rarely visible, because portaled content (dialog/popover/menu panels) is mounted
through [Presence](../utils/presence.md) and is **closed on first paint**, so it isn't in
the server HTML at all. If you do render an overlay open on initial load, expect its content to start in
place and move to the body on hydration.

Structural portals include still-dehydrated `@defer` roots and roots materialized later. They retain
native nodes, edited values and IDs when a destination changes. An owning view can hydrate while
other islands remain dehydrated; a render callback does not mean the whole application has hydrated.
Inert Angular-managed template boundaries delimit these views and must be preserved in SSR HTML.

Angular 22 can leave a hydration task pending when an already hydrating `@defer` is destroyed during
its lazy import. An ordinary `@if` reproduces this limitation. Portal/Presence cleans up its own DOM;
keep the view mounted until hydration finishes if application logic depends on `whenStable()`
resolving across that cancellation.

## Positioning happens in the browser

Floating elements (anything built on the Popper layer — Popover, Menu, Tooltip, Select, Context Menu,
Navigation Menu) are positioned with [Floating UI](https://floating-ui.com/). Position is computed in an
`afterRenderEffect()` and kept in sync with `autoUpdate()` — both **browser-only**. Until the first
position is computed, the floating element renders off-screen and hidden, so the server never computes
coordinates.

**Caveat:** if you force a floating element **open during the initial render**, its content is present in
the server HTML but unpositioned until the client computes its placement.

## Consumer checklist

- Set up SSR with [`@angular/ssr`](https://angular.dev/guide/ssr) and enable hydration with
  `provideClientHydration()` (optionally `withEventReplay()`).
- Generate your own render-time IDs with `injectId` from `@radix-ng/primitives/core`, not random/time-based
  sources.
- Guard your own `window` / `document` access with `isPlatformBrowser(inject(PLATFORM_ID))` or move it into
  `afterNextRender()`.
- Keep overlays (dialogs, popovers, menus, tooltips) **closed on first paint** unless you accept a
  position-after-hydrate flash.
- Make sure any `@if` / `@for` that gates a primitive evaluates to the same result on server and client —
  branching on `window`, `localStorage`, or the current time produces different trees and breaks hydration.

## Troubleshooting hydration mismatches

If Angular logs a hydration mismatch (`NG0500` / "node mismatch") around a primitive:

| Symptom                                    | Likely cause                                                    | Fix                                                                 |
| ------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------------------------------- |
| Mismatch on an `id` / `aria-*` attribute   | A custom ID from `Math.random()` / `Date.now()` / `randomUUID`  | Use `injectId` (or another deterministic value).                    |
| Mismatch on whether an element is rendered | An `@if` / `@for` condition that differs server vs client       | Make the condition deterministic; defer client-only branches with `afterNextRender()`. |
| Error during server render                 | Your own component touches `window` / `document` at render time | Guard with `isPlatformBrowser` or move into `afterNextRender()`.    |
| Overlay flashes / jumps after load         | A floating element was open during the initial render           | Open it on interaction instead of on first paint.                   |

## Related

- [injectId](../utils/inject-id.md) — SSR-stable ID generation.
- [Portal](../utils/portal.md) — teleporting content; no-op on the server.
- [LiveAnnouncer](../utils/live-announcer.md) — `aria-live` announcements; no-op on the server.
