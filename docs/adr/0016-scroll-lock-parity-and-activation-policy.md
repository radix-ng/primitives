# ADR 0016: Scroll-lock parity and activation policy

- Status: Accepted
- Date: 2026-06-14 (accepted 2026-06-16)
- Decision owners: Radix NG maintainers
- Related: ADR 0015 (dismissal engine — scopes these concerns out in its §9), ADR 0017 (floating focus
  manager — owns aria-hidden isolation, marker, focus trap; sibling to this ADR), ADR 0005 (owned
  floating stack), `packages/primitives/core/src/dom/use-scroll-lock.ts`

> Narrowed: modal isolation (`aria-hidden`), the third-party marker, and focus trap moved to **ADR
> 0017**. This ADR owns **scroll lock** only.

## Context

Base UI keeps three concerns **separate** from `useDismiss`, all of which ADR 0015 scoped out (its §9).
Two of them — `aria-hidden`/marker isolation and focus management — are now owned by **ADR 0017**
(`RdxFloatingFocusManager`). This ADR owns the third: **scroll lock**, which Base UI implements as a
dedicated `useScrollLock` utility plus an **activation policy** (`useAnchoredPopupScrollLock`) computed
per primitive.

Today `core/useScrollLock` locks `<html>` + `<body>` overflow and compensates the scrollbar gutter, but
is much thinner than Base UI: no html-vs-body strategy choice, no scroll-position save/restore, no
resize handling, no WebKit pinch-zoom handling, no reference/owner element. ADR 0015 Phase -1 already
requires the per-`Document` correctness fix (module-global → `WeakMap`); this ADR is the **behavioral
parity** port plus the activation policy.

Worse, the 6 call sites each do `useScrollLock(modal)` and nothing else — ignoring `open`, the
open-reason, the popup type, and touch — whereas Base UI computes **whether to lock** from a per-primitive
positioner policy.

### Current `useScrollLock` callers

`dialog-popup.ts:92`, `popover-popup.ts:94`, `menu-popup.ts:108`, `select-popup.ts:223`,
`combobox-popup.ts:43`, `autocomplete-popup.ts:44` — all call `useScrollLock(modal)`.

### `disableOutsidePointerEvents` removal is **not** this ADR's concern

The body pointer-events toggle (ADR 0015 §6, transitional) blocks **pointer interaction** with the
background. It does **not** lock scroll, and scroll lock does not replace it. So its removal depends only
on **ADR 0017** (which provides the correct interactivity/a11y isolation), and is **independent of this
ADR**. Scroll-lock parity here neither blocks nor is blocked by that removal — keeping the two mechanisms
decoupled, which is the whole point of the 0015/0016/0017 split.

## Decision

Port `core/useScrollLock` to Base UI behavioral parity and add a per-primitive **scroll-lock activation
policy**. This ADR owns **no** aria-hidden, marker, or focus trap (those are ADR 0017).

### 1. Behavioral `useScrollLock` port — full confirmed Base UI set

**Decision (strict parity): port the complete confirmed Base UI behavioral set; nothing is deferred as
nice-to-have.** `core/useScrollLock` (already document-scoped per ADR 0015 Phase -1) gains all of:

- html-vs-body scroller selection (handle `<html>`-scroller pages, as Storybook sets);
- save and restore scroll position;
- scrollbar-gutter compensation (reconcile the partial gutter logic already present);
- resize handling;
- WebKit pinch-zoom handling;
- reference / owner-element / owner-document support.

The position-restore **mechanism** matches Base UI's own `useScrollLock` source (read it during Phase 1
and mirror it — `position: fixed` body trick vs overflow-only is decided by what Base UI does, not by us).
This is an implementation task of Phase 1, not an open design question.

**Per-`Document` isolation requires encapsulating _all_ mutable state, not just a counter.** Verified
against `packages/utils/src/useScrollLock.ts`, Base UI keeps `originalHtmlStyles`, `originalBodyStyles`,
and `originalHtmlScrollBehavior` at **module level**. A `WeakMap<Document, ScrollLocker>` that still calls
module-level helpers would let two documents **overwrite each other's snapshots**. So **every** piece of
mutable algorithm state — style/scroll-position **snapshots**, scrollbar-gutter values, `setTimeout` /
`requestAnimationFrame` handles, and the restore callback — must be **owned by the per-`Document`
`ScrollLocker` instance**, with nothing left at module scope. (This sharpens ADR 0015 Phase -1, which only
required the lock counter to be document-scoped.)

> **§1 status (2026-06-16): LANDED.** `core/src/dom/use-scroll-lock.ts` is now a faithful port of Base UI's
> `useScrollLock` — the two strategies (`preventScrollOverlayScrollbars` for iOS / overlay-scrollbar
> documents, `preventScrollInsetScrollbars` for inset scrollbars), html-vs-body scroller selection
> (`isOverflowElement`), scroll-position save/restore, `scrollbar-gutter: stable` feature-detect with the
> `body { position: relative; width/height: calc(...) }` compensation fallback, WebKit pinch-zoom bail-out,
> and resize re-lock. **Divergence from Base UI (intentional, per the paragraph above):** every snapshot
> (`originalHtmlStyles` / `originalBodyStyles` / `originalHtmlScrollBehavior`) is **closure-local** and the
> ref count + restore callback live on a per-`Document` `ScrollLocker` (Base UI keeps the snapshots at
> module scope) — iframe-safe. Two small **deliberate omissions**: the `setTimeout(0)` lock/unlock
> coalescing (a React-render micro-optimization; our signal effect locks/unlocks once per `active()` edge),
> and the body `overflow` short-hand is written as `overflowX`/`overflowY` long-hands so the snapshot
> restores symmetrically. A strategy-independent `data-rdx-scroll-locked` marker on `<html>` exposes the
> lock (the inset and overlay strategies set different overflow properties). Verified: unit
> (`use-scroll-lock.spec.ts` — marker, overflow applied, exact restore round-trip, ref-count, per-document
> isolation, SSR no-op, respect-author-overflow) + browser (the marker-based lock/release tests across
> Dialog / Popover / Menu, 92 behavior tests green). **Not done:** non-DI owner-element / `referenceElement`
> support (the current helper resolves the owner document from Angular DI); the **scroll-position-preservation**
> behavior is the verbatim Base UI port (which has its own tests) but is **not** browser-asserted here — the
> Storybook iframe positions `#storybook-root` out of body flow, so it is not a usable scroll harness.

### 2. Scroll-lock **activation policy** — not just the utility

Base UI gates **whether** to lock per primitive/mode/open-reason/interaction, via
`useAnchoredPopupScrollLock` for anchored popups. The 6 `useScrollLock(modal)` call sites are replaced by
the computed predicate below. Verified against `mui/base-ui` master (References).

**Every predicate keys off `open`, not mounted-state.** This matters for the shared
`mounted`/`open`/`preventUnmountOnClose` lifecycle (ADR 0015 §1): a popup kept **mounted but closed**
(animated exit or `preventUnmountOnClose`) must **unlock scroll on close** — the predicate reads
`open()`, never `mounted()`.

| Primitive / mode   | scroll-lock predicate (verified)                                                                   | touch (`openMethod==='touch'`) |
| ------------------ | -------------------------------------------------------------------------------------------------- | ------------------------------ |
| Dialog             | `useScrollLock(open && modal === true)` (not anchored)                                             | n/a                            |
| Popover click      | `open && modal === true && openReason !== triggerHover`                                            | yes                            |
| Popover hover-open | — (hover excluded)                                                                                 | —                              |
| Menu root          | `open && (menubarModal ‖ popupModal)`, `popupModal = modal && !hover`                              | yes                            |
| Menu submenu       | — (`parent.type === 'menu'`)                                                                       | —                              |
| Context Menu       | `popupModal` (`modal && !hover`)                                                                   | yes                            |
| Menubar child      | `open && menubarModal` (`parent.type === 'menubar' && menubar.modal`, default `true`)              | yes                            |
| Select             | `(alignItemWithTriggerActive ‖ modal) && open` — **locks even when `modal=false`** if item-aligned | yes                            |
| Combobox           | `open && modal`                                                                                    | yes                            |
| Autocomplete       | `open && modal` (= Combobox engine)                                                                | yes                            |

**Ours vs. action** (ours verified from code; all six just call `useScrollLock(modal)`):

| Primitive / mode | Ours (verified)                  | Gap → action                                                                                                                                                                                        |
| ---------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dialog           | `useScrollLock(modal===true)`    | **Add `&& open`** (Base UI = `open && modal`): with kept-mounted / animated-exit the popup stays mounted while closing, so `open` matters. Either add it or prove lifecycle-equivalence with a test |
| Popover click    | `useScrollLock(modal===true)`    | Add `openReason !== triggerHover` (hover must not lock) + touch                                                                                                                                     |
| Popover hover    | locks if `modal===true`          | **Gap → hover opt-out** (no lock on hover-open)                                                                                                                                                     |
| Menu root        | `useScrollLock(effectiveModal)`  | Add hover opt-out + touch; reconcile `effectiveModal` with `popupModal`/`menubarModal`                                                                                                              |
| Menu submenu     | no lock (`effectiveModal` false) | Aligned                                                                                                                                                                                             |
| Context Menu     | lock via `effectiveModal`        | Add hover opt-out + touch                                                                                                                                                                           |
| Menubar child    | lock via menu `effectiveModal`   | **≈aligned** — Base UI keys on `menubar.modal`, ours on `menu.modal`; add touch                                                                                                                     |
| Select           | `useScrollLock(modal)`           | **No `alignItemWithTrigger` mode** → add item-aligned lock rule or document omission; add touch                                                                                                     |
| Combobox         | `useScrollLock(modal)`           | Add `&& open` + touch                                                                                                                                                                               |
| Autocomplete     | `useScrollLock(root.modal)`      | Same as Combobox                                                                                                                                                                                    |

> **§2 status (2026-06-16): the `&& open` gating is LANDED for all six popups.** Dialog (`open && modal === true`)
> and Menu/Menubar/Context Menu (`open && (menubarModal ‖ popupModal)`, hover-excluded) were already gated;
> Popover (`open && modal === true && !hover`), Combobox / Autocomplete (`open && modal`), and Select
> (`(alignItemWithTriggerActive || modal) && open`) were migrated off the plain `useScrollLock(modal)`. Each
> predicate keys on `open()` so the lock releases at **close-start** even when an exit animation keeps the
> popup mounted — verified by the `popover.behavior` "releases the scroll lock at close-start" Playwright
> test (mirrors the Dialog one). **Select `alignItemWithTrigger` — RESOLVED (AC #3, 2026-06-16):** we keep
> the two structural positioner directives (`[rdxSelectPositioner]` popper vs `[rdxSelectItemAlignedPosition]`
> item-aligned) but made the item-aligned one Base-UI-faithful in **behavior** — it exposes
> `alignItemWithTriggerActive = open && !openedByTouch` (the positioner falls back to a plain anchored
> dropdown on touch, Base UI parity), and the popup locks scroll whenever it is active **even if
> `modal === false`** (the item-aligned popup overlays the trigger, so the page must not scroll behind it).
> Verified by `select.behavior` "aligned-position locks page scroll even when modal=false". The **touch**
> near-fullscreen opt-out is §3 (status below).

### 3. Anchored-popup touch / near-fullscreen policy

`useAnchoredPopupScrollLock`'s second argument is `openMethod === 'touch'`: a **touch-opened anchored
popup does not lock scroll** unless it is **near-fullscreen**.

**Decision (Base UI value): "near-fullscreen" = the popup leaves a total horizontal gap of ≤ 20px** to
the viewport. This is a **single anchored-popup policy** in `useAnchoredPopupScrollLock`, **not** a
per-primitive threshold — Select/Combobox/Menu all inherit it. (Confirm the exact 20px constant against
the Base UI source during Phase 1.)

> **§3 status (2026-06-16): LANDED and wired into every anchored popup.** `core`'s
> **`useAnchoredScrollLock(enabled, { touchOpen, element })`** is the reusable Base UI
> `useAnchoredPopupScrollLock` (the `VIEWPORT_WIDTH_TOLERANCE_PX = 20` constant confirmed against source):
> a non-touch open locks while `enabled()`; a **touch** open locks only when `popupWidth >= viewportWidth -
20px`. The gate is unit-tested (`use-scroll-lock.spec.ts` — stubbing `offsetWidth` / `clientWidth`, since
> jsdom has no layout). **Wired into Combobox, Autocomplete, Select, Menu / Menubar / Context Menu, and
> Popover** — every popup measures its own element. Each primitive now plumbs an `openedByTouch` signal
> through its open path and resets it on close: Combobox / Autocomplete via the shared engine; **Select**
> (trigger `handlePointerOpen` records the `pointerType`); **Menu** family (`RdxMenuRoot.show()` derives it
> from the open event's `pointerType`, so hover / mouse / keyboard all read non-touch; **Context Menu**
> threads the touch long-press event through `openAt → show`); **Popover** (trigger captures the
> `pointerdown` `pointerType`, with a `detail === 0` guard so a keyboard-activated click reads non-touch).
> A non-touch open is byte-for-byte the old `useScrollLock` behavior (verified: full unit suite + the
> mouse-driven browser suites across all consumers stay green). The **touch** path itself is unit-only
> (our Playwright suite has no touch-open harness).

## Out of scope (owned elsewhere)

- `aria-hidden` isolation, the `data-*` marker, and focus trap — **ADR 0017** (`RdxFloatingFocusManager`).
- The third-party outside-press guard that reads the marker — **ADR 0015** (reads) + **ADR 0017**
  (produces).
- Escape / outside-press / ownership tree — **ADR 0015**.

## Implementation Plan

> Depends on ADR 0015 Phase -1 (document-scoped `useScrollLock`).

### Phase 1: Behavioral `useScrollLock` port (§1)

- Implement the agreed Base UI behavioral set behind the existing document-scoped `useScrollLock`.

### Phase 2: Activation policy (§2, §3)

- Replace the 6 `useScrollLock(modal)` call sites with the computed per-primitive predicate, including the
  Select `alignItemWithTrigger` rule and the touch / near-fullscreen policy.

### Phase 3: Verification

- Chromium tests: a non-modal **item-aligned** Select locks; a hover-open Popover/Menu does **not** lock;
  a touch-opened anchored popup does not lock except near-fullscreen; scroll position preserved across
  `<html>`- and `<body>`-scroller pages; multiple/nested locks compose.
- SSR: no browser-global access; nothing emitted on the server.

## Consequences

### Positive

- Scroll lock matches Base UI across scroller types and edge cases, and **whether** to lock is computed
  correctly per primitive instead of a blanket `modal` boolean.
- This ADR stays a pure scroll-lock concern; isolation/marker/focus live in ADR 0017.

### Negative

- The full behavioral port (incl. pinch-zoom, resize) is non-trivial and is now **committed** (§1, no
  nice-to-have deferral) — sized accordingly.

### Risks

- Changing the lock predicate is a visible behavior change (e.g. item-aligned Select now locks when
  non-modal) — gate behind the verified table and browser tests.
- Position save/restore jank — mirror Base UI's mechanism exactly (§1) and verify against real layout.

## Alternatives Considered

- **Port `useScrollLock` without the activation policy.** Rejected — the utility port alone leaves the
  blanket `useScrollLock(modal)` call sites, which already diverge from Base UI (item-aligned Select,
  hover opt-out, touch).
- **Keep modal isolation here (ADR 0016 first cut).** Rejected — folding aria-hidden/marker/focus into a
  "scroll-lock" ADR silently grows a focus engine; moved to ADR 0017.

## Acceptance Criteria

This ADR can move to Accepted when:

1. `core/useScrollLock` ports the confirmed Base UI behavioral set (§1 — html/body, scroll-position,
   gutter, resize, pinch-zoom; owner-element/`referenceElement` support is explicitly deferred) across `<html>`- and `<body>`-scroller
   pages, with scroll position preserved. **All** mutable algorithm state (style/scroll snapshots, gutter
   values, timers/frames, restore callback) is owned by the per-`Document` `ScrollLocker` — nothing at
   module scope — verified with a two-document/iframe test that one document's lock does not corrupt the
   other's snapshots.
2. The §2 activation policy replaces all 6 `useScrollLock(modal)` call sites — verified that a non-modal
   item-aligned Select locks, a hover-open Popover/Menu does not, and a touch-opened anchored popup does
   not lock unless near-fullscreen (≤ 20px total horizontal gap, §3).
3. The Select `alignItemWithTrigger` question is decided (implement the mode + lock rule, or record "no
   item-aligned mode" as an intentional Radix omission).
4. SSR access of browser globals is correct; no scroll-lock side effects on the server.
   (`disableOutsidePointerEvents` removal is **not** a gate here — it depends on ADR 0017 only, see
   Context.)

> **Acceptance status (2026-06-16): accepted with the documented owner-element gap.** (1)
> `core/use-scroll-lock.ts` ports the confirmed behavior with per-`Document` `ScrollLocker` state (see §1
> status). (2) All six call sites use
> the `open`-gated activation policy; the touch near-fullscreen opt-out is `useAnchoredScrollLock` (§2/§3
> statuses). (3) Select `alignItemWithTrigger` resolved — item-aligned mode kept as a structural directive
> but made Base-UI-faithful (`alignItemWithTriggerActive = open && !openedByTouch`, touch falls back to a
> plain dropdown, and it locks even when `modal === false`; see the §2 status). (4) `useScrollLock` is an
> `isPlatformBrowser`-guarded no-op on the server. Remaining future polish (non-gating): `referenceElement` /
> owner-element support, and a touch / scroll-position browser harness (our Playwright suite has neither).

## Base UI References

- Scroll-lock predicates per primitive — **verified against `mui/base-ui` master**:
  - Dialog `packages/react/src/dialog/root/useDialogRoot.ts`:
    `useScrollLock(open && modal === true, popupElement)` (not anchored).
  - Popover `packages/react/src/popover/positioner/PopoverPositioner.tsx`:
    `useAnchoredPopupScrollLock(open && modal === true && openReason !== REASONS.triggerHover, openMethod === 'touch', …)`.
  - Menu `packages/react/src/menu/positioner/MenuPositioner.tsx`:
    `useAnchoredPopupScrollLock(open && (menubarModal || popupModal), openMethod === 'touch', …)`,
    `menubarModal = parent.type === 'menubar' && parent.context.modal`,
    `popupModal = modal && lastOpenChangeReason !== REASONS.triggerHover`.
  - Select `packages/react/src/select/positioner/SelectPositioner.tsx`:
    `useAnchoredPopupScrollLock((alignItemWithTriggerActive || modal) && open, openMethod === 'touch', …)`.
  - Combobox `packages/react/src/combobox/positioner/ComboboxPositioner.tsx`:
    `useAnchoredPopupScrollLock(open && modal, openMethod === 'touch', …)`.
- `useScrollLock` / `useAnchoredPopupScrollLock` utilities — `packages/react/src/utils/` (confirm exact
  filenames for the behavioral set and the touch / near-fullscreen rule).
