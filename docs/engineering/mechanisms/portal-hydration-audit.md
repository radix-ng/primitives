# Portal hydration and deferred views audit

Research date: 2026-11-17. Runtime baseline: `69ba1ad923e77bdd941b9eff1690eedab6c365c9`.
Angular 22.0.2, Node 24.22.2, Playwright 1.60.0. Status: implemented through
[ADR 0085](../../adr/0085-hydration-owned-identity-and-view-ranges.md), with a permanent SSR/browser
regression target. Historical findings below describe the baseline, not current runtime behavior.

The baseline exposed three shared mechanism defects: server-rendered trigger guards,
order-dependent generated IDs, and stale structural Portal root-node snapshots. The implementation
uses browser render hooks, native-owner identity and managed physical view ranges. The expanded
43-case regression passes in Chromium, Firefox and WebKit (129 browser/case observations).

## Reproduce

The [audit fixture](../../../apps/radix-ssr-testing/hydration-audit/) builds an Angular AOT browser
application and a real `renderApplication` server. Run from the workspace root with the repository's
Node version and pnpm dependencies:

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs
node apps/radix-ssr-testing/hydration-audit/audit.mjs --project=chromium --case=inner-defer-structural
# Equivalent Nx target for the complete three-engine run:
pnpm exec nx run radix-ssr-testing:hydration
```

Each command type-checks the application and tools, builds both targets, starts its own preview and
stops it on completion. An occupied port is rejected; choose `--port=4492` to use another port.
`--skip-build` reuses outputs only when client/server manifests match and runtime/fixture hashes are
current. `--project=all` (the default) runs Chromium, Firefox and WebKit sequentially. The regression
uses unmodified production runtime modules; the historical build-only phase experiments have been
retired.

JSON observations, server HTML and stacks are written under `dist/portal-hydration-audit/results/`.
**Exit code 1 means a regression invariant failed.** Affected CI browser jobs run this target for
shared identity, Portal/Presence, focus-manager and overlay-family changes. Raw current evidence
uses the `runtime-<engine>.json` filenames and includes separate framework-limit observations.

The recorded [result summary](../../spikes/portal-hydration-results.json) preserves the dated findings.
Fresh raw outputs contain runtime hashes, browser versions and checkpoints for each case.

## Method

- Warm a long-lived SSR process before each fresh browser page, checking application-scoped IDs.
- Gate browser JavaScript requests while reading and editing the server HTML.
- Save native host/input references and compare object identity after hydration, rather than only
  comparing HTML or accepting the absence of hydration warnings.
- Observe actual Angular incremental hydration with `hydrate when` and `hydrate on interaction`.
  Check that untouched islands remain dehydrated and an initiating click is replayed exactly once.
- Include ordinary client-rendered `@defer` placeholders and two genuinely split lazy Portal
  components; the runner checks that their `lazy-view` JavaScript chunk was requested.
- Hydrate sibling islands in reverse order. Record duplicate IDs and the actual targets of `for`
  and `aria-controls` throughout the intermediate state.
- Check the content's destination and change that destination after hydration. Successful DOM reuse
  alone does not establish successful portal relocation.
- Exercise both utility Portal forms and an initially open public Popover, plus a Popover opened
  after application hydration. Popup audit controls use public cancellation to keep outside presses
  from closing the fixture during observation.

Input edit/focus checks apply to server-visible fields. The real Popover's server positioner is
hidden, so its pre-bootstrap input editing is skipped. Relationships and node reuse are still checked.
The Vite server supplies Angular's exported event-dispatch contract asset, which the Angular CLI
normally inserts. Omitting it makes interaction hydration fail even for the inline control fixture.

## Historical results

| Build phase          | Browser  | Cases | All observed invariants hold | Cases exposing defects |
| -------------------- | -------- | ----- | ---------------------------- | ---------------------- |
| Baseline             | Chromium | 32    | 21                           | 11                     |
| Baseline             | Firefox  | 32    | 21                           | 11                     |
| Baseline             | WebKit   | 32    | 21                           | 11                     |
| Portal after render  | Chromium | 32    | 21                           | 11                     |
| Trigger after render | Chromium | 32    | 23                           | 9                      |

The baseline has 96 browser/case observations: 63 satisfy every checked invariant and 33 expose the
three mechanism defects below. A case can fail several invariants. The two experimental builds add
64 Chromium observations; they establish causal boundaries rather than full production acceptance.

## Findings at the historical baseline

### P1: Trigger guards alter the serialized DOM outside Angular's view model

An initially open Popover fails during hydration in `PortalView_Case_0_Template` while updating its
trigger text: the renderer attempts to write `nodeValue` on a null node. The same case inside an
incrementally hydrated parent fails when that parent hydrates. A closed Popover can hydrate and then
open successfully.

[useTriggerFocusGuards](../../../packages/primitives/floating-focus-manager/src/trigger-interaction.ts)
inserts two outside guards and an aria-owns anchor from an ordinary `effect`. The helper also runs on
the server. These unmanaged siblings appear in serialized HTML while Angular's hydration metadata
still describes the authored trigger/template structure. The focus manager's own browser guard does
not protect this separate trigger helper.

The build-only `focus-after-render` phase changes the two helper effects in `trigger-interaction.ts`
to `afterRenderEffect`, leaving production files unchanged. The eager and deferred-open Popover cases
then hydrate, reuse their server nodes and respond to input. The reverse-order Popover reaches the
separate ID defect below instead of failing at bootstrap. This isolates the trigger helper as a cause.

Follow-up: make trigger guard/anchor creation an explicit browser render-phase responsibility shared
with the focus infrastructure. Preserve keyboard handoff, cleanup and return-focus contracts, then
cover real open-on-server Menu/Select/Dialog consumers. The experimental replacement establishes
causality; its full keyboard/focus behavior has not been certified for a production migration.

### P1: Generated IDs depend on hydration order

[RdxIdGenerator](../../../packages/primitives/core/src/id-generator.ts) owns per-application,
per-prefix counters. This isolates applications and SSR requests, but selective hydration can
instantiate component owners in a different order than the server.

With two islands, the server emits `first=…0` and `second=…1`. Hydrating `second` first assigns it
`…0` while the dehydrated first island still has `…0`. Both IDs now exist, and the second label targets
the first island's input. Hydrating the first island later swaps its generated ID to `…1`; native
nodes survive, but their server identities do not.

The defect reproduces in inline content, attribute Portal and structural Portal. It also appears when
a Portal targets a still-dehydrated container. After isolating the guard defect, two real Popovers
also acquire incorrect trigger/popup associations during reverse hydration. Explicit stable IDs
eliminate the failures in the authored-ID controls.

Follow-up: define a hydration-aware identity contract that recovers the server owner's identity
independently of construction order. Candidate designs include native-part server markers and an
explicit stable owner scope. A TransferState sequence replay or a different application prefix alone
does not supply that owner mapping. Structural owners without an element need an explicit design.
Keep counters as a CSR fallback, and retain cross-request/multi-application checks.

React's `useId` provides this ordering guarantee through the component's parent path; our counter
does not implement that guarantee. See [React's explanation](https://react.dev/reference/react/useId#why-is-useid-better-than-an-incrementing-counter).

### P2: Structural Portal keeps a snapshot of roots which can change later

[usePresence](../../../packages/primitives/presence/src/use-presence.ts) reads `view.rootNodes` when
creating an embedded view and stores the array. [RdxPortalPresence](../../../packages/primitives/portal/src/portal-presence.ts)
moves those stored nodes when presence or destination changes.

When a hydrate-triggered `@defer` is a direct root inside the Portal template, its dehydrated native
content is absent from that live-view snapshot. Portal anchors/other roots move, but the server
content remains at the declaration. Hydrating it later reuses the node in that original location.
There is no Angular error, yet the Portal destination contract is violated. Interaction-triggered
hydration has the same problem.

An ordinary client `@defer` can initially insert its materialized content at the moved anchor. Later
changing `container` still moves the old snapshot instead of the current content. This demonstrates
a dynamic-root ownership problem beyond initial server hydration.

Controls establish the boundary: an attribute Portal works; a structural Portal with a native
`<section>` enclosing the deferred block also works. Standard popup anatomy already has a native
Positioner boundary, so this finding concerns a direct top-level deferred block in a wrapper-free
structural template.

Follow-up: specify the supported native root boundary and make dynamic root ownership explicit.
Supporting arbitrary top-level deferred views without a wrapper requires a live footprint/range
strategy, including dehydrated nodes and destination changes. Re-reading nodes only at initial
mount or changing the observation phase is insufficient.

## Render-phase experiments

The `portal-after-render` phase replaces the relocation effects in both actual Portal directives
with `afterRenderEffect`. The `focus-after-render` phase replaces only the trigger focus helper
effects. The build checks that the expected runtime modules were transformed and records the phase;
there are no source edits to the library.

Portal-only postponement leaves the same defect classes. Focus-helper postponement removes the
open-on-server Popover bootstrap failure while leaving the ID and dynamic-root failures. Native
wrapper and authored-ID controls address those two independent mechanisms respectively.

Angular's [afterNextRender contract](https://angular.dev/api/core/afterNextRender) explicitly warns
that a callback does not guarantee every component has hydrated. A root application's stability or
one render callback therefore cannot serve as a global "all deferred islands hydrated" flag.

## Implementation and current regressions

Trigger guards and aria-owns anchors now use `afterRenderEffect`, with no unmanaged SSR siblings.
Both Portal forms relocate in the browser render write phase, before focus-manager marking/isolation
in mixedReadWrite. `injectId` restores each native owner's allocations
from opaque metadata, and TransferState reserves every server allocation before new client content
can consume IDs. Comment-backed owners use an inert Angular-managed template component.

The relocation context follows Angular DI declaration ancestry, moving parent portals before nested
ones independently of hook queue order. Isolation preserves registered internal backdrops and owned content
focus guards; neutral outside marking continues to include decorative sibling roots.

Presence creates managed inert start/end boundaries around its embedded view. Portal reads the live
physical range when moving it; after-render observation also refreshes dynamic roots and standalone
animation participants. Teardown removes current and last observed roots: Angular can destroy the
boundary views before the declaring directive's DestroyRef runs during parent disposal.

The current 43-case suite adds real `ng-container` Popover Roots, structural Tabs Panel Presence,
new client content created before reversed islands, initially open Menu/Select/Dialog, and a gated
lazy import while the Portal closes, loses its owner or changes destinations. All 43 cases pass in each desktop
engine. The lazy-retarget case reuses the original input, value and ID at the new destination.

The cancellation cases expose an Angular 22 limitation separately: destroying a hydrating `@defer`
while its lazy import is pending leaves `ApplicationRef.isStable` false. The ordinary `@if` control
reproduces this and retains its dehydrated server nodes. Portal/Presence removes its owned nodes
and never constructs the destroyed probe after import resolves; the application remains interactive.
The runner records these framework limitations without asserting that Angular must remain broken.
It does not claim cancellation restores application stability. Keep the view mounted through
hydration if application logic depends on `whenStable()` resolving across that cancellation.

These observations establish the listed Angular 22 desktop scenarios. They do not establish the
Angular 21 peer contract, every overlay composition, or real assistive-technology behavior.

## Verification limits outside the hydration regression

Final checks passed: 1,150 focused primitive unit tests, 26 SSR render tests, 129 hydration cases,
657 browser behavior checks (9 existing skips), and 84 pinned Popover comparisons. Library,
SSR-app and Storybook builds, affected-check planner tests, lint, formatting, contributor setup
and consumer-bundle generation also passed.

The full pinned Tabs comparison executed 912 browser/case pairs: 910 passed; two WebKit keyboard
cases recorded native scroll differences. `keyboard-h-rtl-auto-loop` passed three isolated repeats.
`keyboard-v-ltr-manual-clamp` failed one of three repeats with the changes and one of four repeats
on unchanged `69ba1ad9` in an isolated checkout. The latter differs in the React control's transient
negative scroll offset (`-2` with changes, `-1` on unchanged HEAD, versus Angular `0`). This is not a
new reviewed parity exception and the full Tabs run is not reported as green. Local comparison and
baseline-control evidence is retained in
`dist/portal-hydration-audit/results/tabs-reference-verification.json`.

Sources: Angular [incremental hydration](https://angular.dev/guide/incremental-hydration),
[deferred views](https://angular.dev/guide/templates/defer), and
[hydration DOM constraints](https://angular.dev/guide/hydration#direct-dom-manipulation).
