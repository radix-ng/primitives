# ADR 0087: Own complete Accordion Panel views through structural presence

- Status: Accepted
- Date: 2026-11-17
- Decision owners: Radix NG maintainers
- Related: [ADR 0077](0077-tabs-whole-panel-presence.md), [ADR 0084](0084-signal-render-lifecycle.md), [Accordion matrix](../../packages/primitives/accordion/PARITY.md)

## Context

Accordion Panel inherited Collapsible's native-host detachment. Angular still created children
while initially closed and retained their components, subscriptions and native state after close.
A comment marker and saved parent could hide the host but could not own the Angular view lifetime.
The pinned Base UI Panel removes the complete subtree by default and preserves it when retained.

## Decision

Require a structural template around the complete Accordion Panel host:

```html
<div *rdxAccordionPanelPresence rdxAccordionPanel>Fresh children on each return</div>
<div *rdxAccordionPanelPresence="{ keepMounted: true }" rdxAccordionPanel>Retained children</div>
```

- `RdxAccordionPanelPresenceDirective` delegates the embedded view and its physical range to
  `usePresence`. The existing Collapsible Root on Item supplies the shared `renderLifecycle`;
  structural presence does not create a second state machine or animation observer.
- The native Accordion Panel continues to compose Collapsible Panel for ID registration, state,
  search reveal and measurement. An internal typed Collapsible Panel owner context disables its
  marker/detachment path only when the structural owner's Root matches the native Panel's Root.
  Standalone Collapsible keeps its existing behavior; this decision does not certify its child views.
- Native Accordion Panels without a matching owner fail with a documented markup diagnostic. There
  is no retained legacy host path. All repository consumers migrate with this change.
- Per-panel `keepMounted` and `hiddenUntilFound` move to the structural expression's options object.
  Undefined properties inherit Root policy reactively; explicit false overrides it. Findable content
  remains mounted regardless of keepMounted. Native Panel keeps its authored `id` input.
- The Item's Collapsible Root outlives each native Panel, so generated panel identity and transition
  history survive close/remount. Native part destruction unregisters its ID; remount registers it
  again. Native input state resets after a completed exit and is preserved during an interrupted exit.
- Initial-open animation suppression belongs to the structural owner, not each recreated native
  host. It lasts through the first open lifecycle and clears on close, so remounting does not
  suppress every later enter. Measurement and exact motion sequencing remain separate G9 work.
- A structural template publishes the same transition ref through PresenceTarget context. Owned
  descendant exit participants use the existing shared lifecycle.

## Migration

Import `RdxAccordionPanelPresenceDirective` and put `*rdxAccordionPanelPresence` on every Panel host.
Move any native Panel mounting/search inputs into its options object:

```html
<div
  *rdxAccordionPanelPresence="{ keepMounted: keep(), hiddenUntilFound: findable() }"
  [id]="panelId()"
  rdxAccordionPanel
>
  Panel contents
</div>
```

The argument-free form inherits both Root policies. An explicit template can use
`<ng-template rdxAccordionPanelPresence>` or bind its options through `[rdxAccordionPanelPresence]`.
Root selection and request APIs do not change in this increment.

## Evidence and limits

Thirteen new units establish initial absence, child/subscription disposal, fresh versus retained state,
findable retention, tri-state overrides, IDs, `@for` moves, conditional parts, interrupted exit,
Root disposal and nested ownership. Focused SSR checks cover absent, retained, findable, open and
controlled-rejected complete Panel markup.

Eight new paired browser scenarios exercise complete views, native input state, exit interruption,
Root disposal, overrides, item reorder/removal and conditional Panel recreation. Their CSS declares
enter motion before first opening because the pinned implementation discovers animation type on
open; adding close-only CSS afterward cannot establish a held exit in that reference.
The public PanelLifetime story has a real-browser state-reset/retention regression.

Current counts and engine results live in the [suite README](../../apps/parity-testing/primitives/accordion/README.md).
Actual client hydration, measurement parity, full motion sequencing, arbitrary reparenting and real
browser find remain separate verification work. SSR annotations alone are not hydration evidence.

The G9 follow-up establishes scroll-size pixels during motion and auto after completion, a capture
frame before exit styling, immediate transition-based search reveal and SSR first-paint suppression.
Two client hydration cases in the shared audit verify server-node reuse, IDs and pre-bootstrap edits
across reverse islands and retained views; both run in all three desktop engines. Remaining motion/
author-style and hydration combinations stay explicit in the matrix.
