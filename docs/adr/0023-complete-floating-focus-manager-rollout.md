# ADR 0023: Complete the floating focus manager rollout (remainder of ADR 0017)

- Status: Proposed
- Date: 2026-07-12
- Decision owners: Radix NG maintainers
- Related: **ADR 0017 (floating focus manager)** — this ADR carries the work **de-scoped** from 0017 when
  its core was Accepted (2026-07-12); ADR 0015 (dismissal engine — reads the `markOthers` marker this work
  extends to more primitives), ADR 0016 (scroll-lock parity — sibling floating concern), ADR 0010
  (structural portal presence — the multi-root, no-wrapper portal the §6a bridge must model), ADR 0012
  (thin positioners — where Popover/Combobox/Autocomplete internal backdrops are hosted), ADR 0014 (unified
  combobox/autocomplete engine — the migration surface for WS1). Code:
  `packages/primitives/floating-focus-manager`, `packages/primitives/core/src/floating`,
  `packages/primitives/focus-scope`.

> This is a **scoping / tracking ADR**, not new design. The design for every item below already lives in
> **ADR 0017** (§1, §3, §5, §6a and its Acceptance Criteria); this ADR only enumerates the remaining
> workstreams, their acceptance, and dependencies so 0017 could be Accepted for its shipped core without
> silently dropping the rest. Read the cited 0017 sections for the authoritative design.

## Context

ADR 0017 introduced `RdxFloatingFocusManager` (entry `@radix-ng/primitives/floating-focus-manager`) as the
single owner of the independent focus-policy set (enabled, modal/trapped, initial/return/restore focus,
close-on-focus-out, aria-hidden, the `markOthers` marker, inside-elements). On 2026-07-12 its **core was
Accepted**: the manager is in production for **Dialog, Popover, Menu, Select** (via
`provideFloatingFocusManagerConfig` in each `*-popup.ts`) and, transitively, **Context Menu + Menubar**
(through `menu-popup`); `RdxInternalBackdrop` (`core/src/floating/internal-backdrop.ts`,
`setupInternalBackdrop`) is wired into Dialog/Menu/Select/Combobox/Autocomplete; and the
`disableOutsidePointerEvents` / `DocumentPointerEventsState` body toggle was removed.

Several items from 0017's Acceptance Criteria were **not** shipped and were explicitly de-scoped (see 0017
"Follow-up (de-scoped)"). Rather than leave them as loose notes inside an Accepted ADR, this ADR owns them
as concrete workstreams. The verified 2026-07-12 gaps:

- **Combobox / Autocomplete run no focus manager** — their `src/` contains no `RdxFloatingFocusManager`,
  `RdxFocusScope`, `markOthers`, or `trapped`; they wire only `setupInternalBackdrop`. So the §1
  marker / aria-hidden rows for the `input-inside` / `input-outside` modes are unmet.
- **Popover wires no internal backdrop** — neither `popover-popup.ts` nor `popover-positioner.ts`
  references an internal backdrop, though 0017 §5 requires one for modal Popover with a trigger cutout.
- **The full §6a portal-focus bridge / scoped registry is absent** — none of `ownRootElements`,
  `focusRootElements`, `contentRootElements`, `descendantPortalRoots`, or `portalParent` exist in code;
  only a partial bridge was built. Guard-driven portal **tab order** is therefore unimplemented.
- **The Phase-5 verification matrix is unwritten** — no dedicated Playwright specs for multi-root Dialog
  guards, nested-portal keep-sets, tab-order via guards, custom-container child, backdrop-not-focus-boundary,
  or inline (non-portaled) modal.
- **Select ships `closeOnFocusOut: () => false`** (`select-popup.ts:161`) — the listbox owns DOM focus and
  navigates virtually via `aria-activedescendant`, so it keeps the Radix divergence. 0017's Phase-0 "adopt
  Base UI parity (Select closes on focus-out)" decision is **not** shipped.
- **AT / browser gates remain open** — the `aria-modal` AT-review, the `markOthers` `inert` internal
  variant (no Base UI consumer passes it), and the WebKit / screen-reader (Tier-B) matrices.

## Decision

Track the remainder of ADR 0017 as six independent workstreams (WS1–WS6). Each is self-contained and can
land on its own schedule; none blocks 0017's Accepted core. Design authority stays with ADR 0017 — this ADR
does not re-decide it, only records completion criteria and ordering.

### WS1 — Migrate Combobox + Autocomplete onto `RdxFloatingFocusManager`

Add `provideFloatingFocusManagerConfig` to the combobox/autocomplete popup so the manager produces the
`markOthers` marker + `aria-hidden` isolation for their §1 rows, replacing any ad-hoc wiring. The relevant
0017 §1 modes:

- **input-inside** — `!inputInsidePopup ‖ modal` ⇒ `modal` (default non-modal, untrapped, typeable ⇒
  `isUntrappedTypeableCombobox`); aria-hidden `modal ‖ typeable`; `insideElements = popup + [startDismissRef, endDismissRef]`.
- **input-outside** — `⇒ true` (modal, trapped); aria-hidden yes.
- **Autocomplete** — = Combobox with `selectionMode='none'`.

Because Combobox already owns the internal backdrop (WS-independent), WS1 is specifically the **focus
manager** adoption: marker, aria-hidden, trap in the input-outside case, and the dismiss-ref inside-elements.
Reconcile with the unified engine (ADR 0014) so both consumers share one config path.

### WS2 — Internal backdrop for modal Popover

Host an `RdxInternalBackdrop` from the Popover **positioner** (ADR 0012) when
`mounted && modal !== false && reason !== triggerHover`, with `cutout = triggerElement`, `data-*-inert`,
and `inert` when `!open` (0017 §5 Popover row). Reuse the shared `setupInternalBackdrop` mechanism; do
**not** auto-render a backdrop for hover-open Popover.

### WS3 — Full §6a portal-focus bridge + scoped portal registry

Build the typed contract 0017 §6a specifies (only a partial bridge exists today):

- **Two independent hierarchies** — `portalParent` (portal context → DOM nesting / keep-sets) and
  `floatingNode` (floating tree → dismissal/focus), each resolved independently; an explicit custom
  `container` severs `portalParent` (`container ?? parentPortalNode ?? body`).
- **Three root roles** — `ownRootElements` (all relocated roots, DOM-footprint bookkeeping only) ⊇
  `focusRootElements` (guards/tabbability, excludes backdrop) and `contentRootElements` (`aria-owns`,
  excludes backdrop); `descendantPortalRoots` (nested child portals, Base UI's `portalNodes`).
- Both `RdxPortal` and `RdxPortalPresence` implement `RdxPortalRegistration`; attribute portals register
  with `mounted=true`, `open=undefined` (never coerced to an active boundary).
- **Guard-driven tab order** — leading/trailing visually-hidden `tabindex=0` guards + capture-phase
  inside-tabbability toggle + the single `aria-owns` anchor, tied to the portal, re-derived on
  mount/unmount/container change.

### WS4 — Phase-5 verification matrix

Author the browser tests 0017 Phase 5 lists, as `apps/visual-regression/tests/*.behavior.spec.ts` (jsdom
cannot resolve layout / guards / `inert` hit-testing):

- multi-root Dialog: guards on **focus** roots, `aria-owns` on **content** roots, keep-sets exactly
  `[popup, ...descendantPortalRoots]`, backdrop in `ownRootElements` but marked/`aria-hidden`;
- nested-portal keep-sets (open parent + portaled `Select`/`Menu` child not marked / hidden);
- closing-child-during-parent's-keep-pass; registered-but-ineligible closed-but-mounted child;
- tab order via guards (Tab in / Shift+Tab back / sibling portals / closed-but-mounted excluded);
- dynamic portal container change within one document;
- custom-container child excluded from the parent's keep-sets (`portalParent === null`);
- backdrop is not a focus boundary;
- inline (non-portaled) modal traps + renders inside guards; inline non-modal renders no guards;
- always-mounted attribute portal participates via `mounted` but never as an active dismissal/focus boundary;
- portal membership is not dismissal-inside (contextless portal click still counts as outside-press);
- internal-backdrop clipPath cutout / menubar content-element cutout / input-group cutout / `inert`-during-exit /
  cutout-not-stale-on-scroll (the 0017 §5 browser-verify-pending checks);
- SSR: no markers, no browser globals.

### WS5 — Select focus-out parity decision

Decide whether to flip Radix Select from the shipped `closeOnFocusOut: false` (`select-popup.ts:161` — the
listbox owns DOM focus + `aria-activedescendant`) to Base UI's close-on-focus-out (0017 §1 Select row /
Phase-0 resolution). This is **AT-gated**: confirm with a real screen reader whether closing on focus-out
regresses the virtual-navigation UX before shipping the breaking change. Outcome is either "flip + record
the breaking change" or "keep the divergence permanently, close the item."

### WS6 — AT / browser gates

- **`aria-modal` AT-review** — we emit it only for `modal === true`; Base UI emits none and relies on
  `inert`. Confirm with AT which is correct and align.
- **`markOthers` `inert` internal variant** — deferred; build only if a real consumer needs it (0017 §3).
- **WebKit / screen-reader (Tier-B) matrices** — the 0017 pre-Acceptance confirmations (WebKit
  blur-before-unmount, restore-focus landing, multi-IDREF `aria-owns`).

## Implementation Plan

The workstreams are independent; suggested order maximizes reuse and de-risks the hardest piece:

1. **WS2** (Popover internal backdrop) — smallest, reuses shipped `setupInternalBackdrop`; good warm-up and
   closes 0017 AC #7.
2. **WS1** (Combobox/Autocomplete adoption) — depends only on the shipped manager + config seam; closes the
   §1 marker/aria-hidden rows (AC #1/#9).
3. **WS3** (portal-focus bridge/registry) — the largest; net-new infra. Do before WS4 tab-order tests since
   they exercise it.
4. **WS4** (Phase-5 matrix) — verifies WS1–WS3 and the already-shipped core; some rows can land earlier
   against the core.
5. **WS5 / WS6** (AT-gated decisions) — run the AT matrix once, resolve Select focus-out and `aria-modal`
   together.

## Consequences

### Positive

- ADR 0017 stays Accepted and honest about scope; the remainder is tracked with concrete acceptance instead
  of prose caveats.
- Completing WS1 removes the last "primitive computes its own focus policy" gap — the manager becomes the
  sole executor across every §1 consumer.
- WS3 + WS4 give the portal/focus system real browser coverage it currently lacks (jsdom-only).

### Negative

- WS3 is a sizable net-new subsystem (two hierarchies, three root roles, guard tab-order) for a
  correctness/parity gain that is invisible in the common single-root case.
- WS5/WS6 are AT-gated: they cannot be closed by code review alone and need a real screen-reader pass.

### Risks

- WS1 could re-introduce per-primitive policy drift if Combobox/Autocomplete compute modality locally
  instead of passing inputs to the manager — the migration must route everything through the config seam.
- WS5 flipping Select is a **breaking change**; shipping it without the AT pass risks regressing virtual
  navigation.

## Acceptance Criteria

Each maps back to the ADR 0017 criterion it leaves open. This ADR is Accepted once WS1–WS4 land and WS5/WS6
are resolved (either implemented or recorded as an intentional, AT-confirmed omission).

1. **WS1** — Combobox and Autocomplete consume `RdxFloatingFocusManager` via
   `provideFloatingFocusManagerConfig`; the marker and `aria-hidden` passes run per their §1 rows
   (`input-inside` / `input-outside`), with `insideElements` including the dismiss refs. No ad-hoc
   trap/aria-hidden/marker wiring remains in their `src/`. (0017 AC #1, #9.)
2. **WS2** — modal Popover renders an `RdxInternalBackdrop` from the positioner with a trigger cutout,
   `inert` when `!open`, and none for hover-open. (0017 AC #7.)
3. **WS3** — the §6a portal-focus bridge + scoped registry exist with the two hierarchies, the three root
   roles, `descendantPortalRoots`, custom-container severing, and guard-driven tab order; both `RdxPortal`
   and `RdxPortalPresence` register. (0017 AC #5.)
4. **WS4** — the Phase-5 behavior specs listed above are green in `apps/visual-regression`, including a
   `pageerror`/console-error guard. (0017 Phase 5.)
5. **WS5** — the Select focus-out behavior is decided against real AT and recorded: either flipped to
   close-on-focus-out (breaking change noted) or kept as an intentional Radix divergence with rationale.
   (0017 AC #4.)
6. **WS6** — `aria-modal` is confirmed against AT and aligned; the `markOthers` `inert` variant is either
   built (with a real call site) or recorded as permanently deferred; the WebKit / screen-reader Tier-B
   matrix is run. (0017 AC #2, #3, #6.)

## Base UI References

Design references are exhaustively cited in **ADR 0017** (§1, §3, §5, §6a and its "Base UI References").
The load-bearing ones for this ADR:

- Focus manager per-primitive policy — `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx`;
  Combobox `combobox/popup/ComboboxPopup.tsx` (`!inputInsidePopup ‖ modal`), Autocomplete
  `autocomplete/root/AutocompleteRoot.tsx` (`AriaCombobox`, `selectionMode='none'`), Select
  `select/popup/SelectPopup.tsx` (`modal={false}`, `closeOnFocusOut` default `true`).
- Internal backdrop — `utils/InternalBackdrop.tsx`; Popover `popover/positioner/PopoverPositioner.tsx`
  (`cutout={triggerElement}`, `inert={inertValue(!open)}`).
- Portal / focus guards — `FloatingPortal.tsx`, `utils/FocusGuard.tsx`, `utils/markOthers.ts`.
