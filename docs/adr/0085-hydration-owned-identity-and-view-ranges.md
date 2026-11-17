# ADR 0085: Recover view-owned IDs and move managed physical ranges during hydration

- Status: Accepted
- Date: 2026-11-17
- Decision owners: Radix NG maintainers
- Related: ADR 0010, ADR 0073, ADR 0077, ADR 0084, packages/primitives/core/src/id-generator.ts, packages/primitives/core/src/view-anchor.ts, packages/primitives/presence/src/use-presence.ts, packages/primitives/portal/src/portal-presence.ts

## Context

Angular incremental hydration constructs sibling islands independently of server creation order.
Application-scoped counters isolate requests but cannot associate an island with its server IDs.
Replaying a transferred sequence has the same defect; transferring only the final counter avoids
collisions for new content but cannot recover an existing owner's identity.

An EmbeddedViewRef rootNodes snapshot can omit still-dehydrated native @defer roots and becomes
stale when @defer, @if or @for materializes other roots. Moving a snapshot can therefore leave
content at its declaration or at a previous Portal destination. Native wrappers solve this but
change the structural, multiple-root Portal anatomy.

Unmanaged trigger guards created in an ordinary effect also execute on the server. Serialized
siblings which Angular does not own invalidate its hydration node mapping. The dated investigation
and controls are recorded in the [hydration audit](../engineering/mechanisms/portal-hydration-audit.md).

## Decision

injectId recovers constructor allocations from their native Angular owner. An opaque data-rdx-ids
attribute stores per-prefix allocation slots. The root RdxIdGenerator keeps a WeakMap of owners and
per-prefix cursors. Calls retain their order within one owner/prefix; sibling island order is free.
TransferState reserves the server's per-application high-water counters before fresh client IDs
are allocated, including before any server island hydrates. Keep the existing prefix/APP_ID format,
request isolation and distinct APP_ID requirement for multiple applications.

Comment-backed ng-container and ng-template owners receive an inert native template component
through the public ViewContainerRef API. Its component view participates in Angular's hydration
metadata. On the server, a one-time effect detaches/reinserts that view at its existing container
index after authored children are created; this aligns physical DOM with Angular's serialized
static-children-then-attached-views order. No Angular comment payload or private metadata is edited.
The managed container owns the marker's lifetime. getId and injectId outside native view owners
remain fresh allocators and do not recover persistent server identities.

Presence creates managed inert start/end template components around its embedded view, in container
order: start, content, end. Its footprint is the live physical sibling range, including boundaries
and dehydrated roots. After each browser render it publishes only identity/order changes and updates
standalone animation participants. Live Angular roots which own an attribute Portal remain animation
participants even when they move outside that range. Internal templates never participate in animation observation.
Borrowed Root lifetimes continue to use their semantic part registrations from ADR 0084.

Portal relocation runs in the write phase of afterRenderEffect and reads the current physical range when moving it.
It does not wait for all application islands to hydrate. Ready destination changes preserve child
instances and native values. Destruction removes the current and last observed roots, including
roots which have not acquired live client views. The last observation covers parent disposal:
Angular can destroy attached boundary views before the declaring directive's DestroyRef callback.
Attribute Portal retains its declaration anchor for Angular teardown.
Trigger focus guards and aria-owns anchors also run in afterRenderEffect, so no unmanaged guards
are serialized by SSR. Floating background marking/isolation uses the following mixedReadWrite
phase, after every Portal write, so it inspects the final ancestor chain rather than the declaration.
Isolation keeps owned content guards and registered internal backdrops interactive; neutral
outside marking remains narrow. This prevents the render phase from inerting its own Tab bridge or
outside-press target.
Public decorative Backdrop parts retain their existing isolation policy; the shared internal
backdrop utility declares its hit surfaces with the common internal marker in addition to a
primitive-specific marker.

Both Portal forms provide a typed internal relocation context through DI. A child write relocates
its declaring ancestors first, without subscribing to their signals, then moves its own range.
This preserves nested stacking order even when Angular queues a retained child's hook first.

## Consequences and migration

- Public structural anatomy stays wrapper-free and authored elements remain direct destination
  children. Extra inert template siblings and serialized ID metadata are intentional DOM changes.
  Consumers must preserve these markers and avoid deriving behavior from raw child counts or the
  exact numeric suffix of generated IDs. Template siblings also affect positional CSS selectors;
  scope styling to actual parts. Resolve popup relationships through part refs or trigger
  aria-controls rather than querying the first matching popup in the document.
- Constructor allocation order is local to an owner and prefix. Conditional calls which differ
  between server and client on that same owner are unsupported; use explicit application IDs when
  business identity must survive unrelated view creation.
- A live Presence adds two empty Angular component views and reads its sibling range after render.
  Publishing only changed identities prevents self-scheduling render loops. This cost preserves
  arbitrary top-level dynamic/dehydrated roots without a layout wrapper or private Angular API.
- Angular 22 leaves a pending hydration task when a hydrating @defer is destroyed during its lazy
  import. An ordinary @if control reproduces this and also leaves dehydrated DOM. Presence cleans
  up its own physical range; it cannot complete Angular's private task. Applications that require
  whenStable to resolve across this cancellation must retain the view until hydration finishes.

## Verification

The AOT SSR/browser regression target is `pnpm exec nx run radix-ssr-testing:hydration`.
It verifies node identity, edited values, IDs and label/ARIA targets through reversed hydration;
event replay exactly once; actual lazy chunks; initially open public overlays; destination changes
before and after hydration; and closing/owner disposal during import. The ordinary @if cancellation control
records Angular's limitation separately from the Portal invariants. Chromium, Firefox and WebKit
participate in affected CI browser jobs. Core, Portal and Presence unit checks cover request/app
isolation, fresh allocations before island hydration, dynamic roots, animation waits and cleanup.
