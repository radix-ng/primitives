# ADR 0073: Defer Portal mounting and preserve Menu group labels

- Status: Accepted
- Date: 2026-11-15
- Decision owners: Radix NG maintainers
- Related: [ADR 0072](0072-portal-dom-destinations.md), Menu audit A4–A5, shared Portal/Presence/popup lifecycle

## Context

Base UI 1.9.0 (`cf696d6f6e08c699c5bda24d5a033430909f2285`) treats an explicit Portal
container=null as unavailable, instead of falling back to body. A React ref retries after attachment;
Angular signal queries already provide a reactive target. The native target surface from ADR 0072
did not distinguish pending from omitted containers. An initially open owner could also create the
structural view in the directive constructor, before the container input was bound.

Menu GroupLabel always generated an id, overwrote authored ids and omitted aria-hidden. The pin
preserves authored/reactive ids, registers them with Group/RadioGroup and hides the standalone label
from the accessibility tree while using it as the group's name.

## Decision

RdxPortalContainer accepts null. Undefined and omitted values retain the body fallback, as do
unmatched selectors and invalid wrappers. An explicit null suspends the Portal; it is not inferred
from an empty ElementRef, and no ref polling or React-style mutable object is introduced. Consumers
can bind `[container]="target()?.nativeElement ?? null"` to a signal query.

Structural Portal starts its PresenceMachine after initial input binding through the existing
one-shot watch helper. While pending it creates no view, even with keepMounted. Losing the target
immediately destroys all roots and invalidates the old exit wait. A new target creates a fresh view.
Direct changes between ready targets still move the same view, as in ADR 0072.

The attribute Portal owns an already-created consumer element. In the browser it detaches that host
while pending, retains its Angular state and edited values, and reconnects the same element when
ready. It still restores the declaration anchor for disposal. On the server attribute Portal keeps
its existing in-place behavior; a pending structural Portal serializes no embedded content.

Presence reports suspension through its existing lifecycle registration. The shared popup lifecycle
waits for a usable destination before completing an enter, and starts a new enter when a suspended
view remounts while logically open. Closing before mounting emits no transition completion. Actual
open-change requests, cancellation and models remain owned by the primitive. This applies to the
Menu/Popover/Select lifecycle; Dialog's separate callback audit is not certified by these checks.

Presence animation timestamps use the watched roots' ownerDocument timeline. Reading the global
document misclassified iframe exits as old animations. Foreign animated targets use the owned core
HTMLElement guard when measuring the exit safety net.

Menu clears its active index when the current popup collection is destroyed while Root remains
open. A new popup must not inherit the disposed collection's highlight. Cleanup from an older
registration cannot clear a newer collection; live relocation keeps the existing registration.

GroupLabel uses a signal id input with a stable generated fallback, the same approach as Menu's
Trigger/SubTrigger/Popup. The shared Group context receives its resolved id reactively, with guarded
cleanup so removing an older label cannot clear a newer association. The host has aria-hidden=true;
native aria-labelledby still names Group/RadioGroup from that hidden label. The exported directive's
id property changes from a string to a signal input.

## Evidence and limits

Six pending Portal cases and six Group/RadioGroup label cases compare the unchanged reference with
native keyboard/pointer input. F3/F4/F6 change only application targets, ids and conditional labels.
Snapshots retain actual callbacks, completion arrays, ARIA links, focus and isolation; generated id
spelling stays in raw measurements while comparisons check native association and nonempty ids.
No new expected differences are needed. Existing live-retarget exceptions remain unchanged.

Unit regressions cover initial child construction, null/ready/undefined, keepMounted, stale exit
promises, owner cleanup, iframe animation clocks and label identity/naming/replacement. SSR checks
cover pending output suppression and authored group associations. The Custom Container story uses
a real signal query; separate browser regressions cover Popover, Dialog and Select destinations.
Independent family audits, real device/AT checks and mixed-tree native ARIA limits remain separate.

The affected unit checks passed: 616 tests initially, 343 Menu/Portal/lifecycle checks after the
collection cleanup, and 50 Context Menu/Menubar checks. The focused SSR run passed three cases;
the final nine Menu/Context Menu/Menubar story checks passed in all three engines, and two API-table
browser checks passed. Library and
Storybook builds, consumer generation, lint and contributor-documentation checks passed.

The first 144-browser-check run passed 142 checks, hit a Firefox overall timeout during snapshot
reading and missed a 400ms exit window in both frameworks on WebKit. The CSS-exit fixture now uses
a long natural animation and finishes it through native WAAPI after recording the intermediate
state; the retained CSS case still checks natural completion. A focused 60-check run then passed
all three engines. A subsequent highlighted-item witness exposed the stale index described above;
its regression compares suspension/remount with direct ready-to-ready relocation.
The final 36-comparison run passed in Chromium, Firefox and WebKit, including highlighted-item
remounts, ready-to-ready moves, ordinary keyboard opening and CSS exits. The existing 155 exact
exception fields remain unchanged.

Menu audit A4–A5 are addressed. Filtering (A6) is the next independent capability increment.
