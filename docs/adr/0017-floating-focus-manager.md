# ADR 0017: Floating focus manager (`RdxFloatingFocusManager`)

- Status: Accepted (core landed & in production; remaining items de-scoped to ADR 0023 — see "Implementation status" + "Follow-up (de-scoped)")
- Date: 2026-06-14 (accepted 2026-07-12)
- Decision owners: Radix NG maintainers
- Related: ADR 0015 (dismissal engine — **reads** the marker this ADR produces), ADR 0016 (scroll-lock
  parity — sibling concern, owns no focus/a11y), ADR 0005 (owned floating stack),
  `packages/primitives/focus-scope` (`RdxFocusScope`, the low-level primitive this wraps)

> Splits the focus / a11y-isolation / marker concerns out of ADR 0016 so one owner holds the independent
> focus-policy set. Architectural decisions are settled below; Phase 0 fills two parity-characterization
> tables before implementation.

> **Implementation status (2026-07-12): core Accepted; the rest de-scoped to follow-up.**
> `RdxFloatingFocusManager` (entry `@radix-ng/primitives/floating-focus-manager`) is built and **in
> production** for **Dialog, Popover, Menu, Select** (via `provideFloatingFocusManagerConfig`), and by
> transitivity **Context Menu + Menubar** (through `menu-popup`). It composes the reworked `RdxFocusScope`
> and owns the independent policies — `enabled`, `modal`→trap, the two `markOthers` passes (aria-hidden +
> marker, §3), `closeOnFocusOut` (§3), `initialFocus` and `returnFocus` (§2, both DONE). The
> `RdxInternalBackdrop` primitive (§5) lives in `core/src/floating/internal-backdrop.ts` and is wired into
> Dialog, Menu, Select, Combobox, Autocomplete; the `disableOutsidePointerEvents` /
> `DocumentPointerEventsState` body toggle is gone.
>
> **De-scoped to follow-up (see "Follow-up (de-scoped)" below) — the core is Accepted without them:**
> (1) **Combobox / Autocomplete do not yet consume the focus manager** (they wire only the internal
> backdrop), so the §1 marker / aria-hidden rows for them are unmet; (2) **Popover does not wire an internal
> backdrop**; (3) the **full §6a portal-focus bridge / scoped registry** (two hierarchies, `ownRootElements`
> / `focusRootElements` / `contentRootElements` / `descendantPortalRoots` / `portalParent`, guard-driven
> portal tab-order) is not built — only a partial bridge exists; (4) the **Phase-5 verification matrix**
> (multi-root Dialog guards, nested-portal keep-sets, tab-order via guards, custom-container child, inline
> modal) is not written; (5) **Select ships `closeOnFocusOut: false`** (keeps the Radix divergence — the
> listbox owns DOM focus and navigates virtually via `aria-activedescendant`), so the Phase-0 "adopt Base UI
> parity" flip is **not** shipped and moves to follow-up pending real-AT confirmation; (6) the **`aria-modal`
> AT-review**, the `markOthers` **`inert` internal variant** (no Base UI consumer passes it), and the
> **WebKit / screen-reader (Tier-B) matrices** remain open.

> **Naming correction (2026-06-28).** This ADR uses the name `RdxFocusGuards` for two different things;
> the implemented reality has since diverged from both, so read every later mention with this mapping:
>
> - The **legacy global `RdxFocusGuards` directive** (the old `@radix-ng/primitives/focus-guards`
>   entrypoint — a `document.body` singleton on the `data-radix-focus-guard` attribute, contrasted below as
>   "weaker") **was removed.** It was unused and is not the parity path.
> - The **portal-focus bridge** the ADR planned to build "as the `RdxFocusGuards` analog" landed instead as
>   a **function toolkit in `focus-scope/src/focus-guards.ts`** (`createFocusGuard`, `disableFocusInside` /
>   `enableFocusInside`, `useFocusGuardsTabbability`, `createAriaOwnsAnchor`, `isOutsideEvent` on the
>   `data-rdx-focus-guard` attribute), consumed by `RdxFloatingFocusManager` — **not** a separate primitive.
>
> So a future parity audit should compare Base UI's `FocusGuard` / `FloatingPortal` against
> `focus-scope/src/focus-guards.ts`, and ignore the deleted `focus-guards/` entrypoint.

## Context

Base UI co-locates a cluster of behaviors in **one** component, `FloatingFocusManager`, under **one
lifecycle** — but they are **independent inputs/policies**, not all derived from a single
`focusManagerModal`:

- `enabled` (`disabled={!mounted}`, and disabled on hover-open);
- `modal` / focus trap + focus guards;
- `initialFocus`, `returnFocus`, `restoreFocus`;
- `closeOnFocusOut`;
- `aria-hidden` isolation of outside content (`markOthers(..., { ariaHidden })`);
- the `data-*` marker the dismissal third-party guard reads (`markOthers(markerInsideElements)`).

`modal` is **one** of these inputs (it drives trap and the aria-hidden gate); it does **not** compute the
others. The manager's value is a single **owner of a coordinated set of independent policies**, not a
single boolean fanned out.

We split these across separate primitives — `RdxFocusScope` (trap), a planned `RdxMarkOthers`, and
per-primitive `modal` config — and **recompute the modality in several places**. That is the root cause
of a recurring class of drift bugs surfaced during the ADR 0015/0016 reviews:

- `aria-hidden` getting tied to the local `modal` input instead of the computed focus-modality (e.g.
  Select `modal=true` but focus-modality `false` ⇒ no aria-hidden);
- the marker getting tied to "has `RdxFocusScope`" instead of popup lifecycle;
- focus-out close (`closeOnFocusOut = !disablePointerDismissal`) being treated as a dismissal concern.

ADR 0015 made the dismissal engine read a marker it has **no producer** for; ADR 0016 was carrying the
focus/a11y/marker work as a side-effect of "modal isolation". This ADR gives those a single owner.

### Boundaries (what this ADR does **not** own)

| Concern                                           | Owner                         |
| ------------------------------------------------- | ----------------------------- |
| Escape / outside-press                            | ADR 0015                      |
| the floating **tree** (shared infra, ADR 0015 §1) | ADR 0015 owns, **0017 reads** |
| **marker production** (this ADR)                  | **0017**                      |
| marker **read** at outside-press                  | ADR 0015                      |
| scroll lock (utility + activation policy)         | ADR 0016                      |
| focus trap, aria-hidden, focus lifecycle          | **0017**                      |

Base UI keeps `useDismiss` separate from `FloatingFocusManager`; the **`markOthers` marker** is produced by
the focus manager and read by `useDismiss`. We mirror that: **0017 produces the `markOthers` marker → 0015
reads.** Caveat (§5, #2): the same `data-base-ui-inert` attribute has a **second** producer — the
internal-backdrop primitive's **static self-marker** — so "marker production = 0017" is shorthand for the
`markOthers` producer only.

## Decision

Introduce `RdxFloatingFocusManager`, a single popup-level owner of a **coordinated set of independent
focus policies** (enabled, modal/trapped, initial/return/restore focus, close-on-focus-out, aria-hidden,
marker, inside-elements). It is a **coordinator over three low-level parts** — `RdxFocusScope`, a
portal-focus bridge, and owner-`Document` focus guards (§4) — **not** a thin wrapper over `RdxFocusScope`
(those parts need parity work, §6/Phase 0). It also owns the question of **whether/when
`disableOutsidePointerEvents` can be removed** (ADR 0015 §6) — gated on a per-primitive
pointer-interaction parity table, **not** a settled decision (§5).

### 1. Per-primitive focus-policy table — independent columns

The point of this ADR is to own these as **separate** policies so drift cannot move inside the manager.
Each column is independent; `modal` does not compute the others. **All cells below are verified against
Base UI master** (References); `closeOnFocusOut` is absent on every popup **except Dialog**, so it
defaults to FloatingFocusManager's `true`. **Caveat:** `closeOnFocusOut = true` only means the manager
**installs the listeners** — whether focus-out actually closes also depends on the floating tree, focus
guards, inside-elements, pointer-down state, and modal mode. So this column is the **input**, and the
**resulting per-primitive focus-transition semantics** are what the focus-out parity table (filled in
**Phase 0**) records — not the raw prop value.

| Primitive / mode            | enabled                                    | modal / trapped                       | aria-hidden (`modal ‖ typeable`) | marker (manager active) | closeOnFocusOut            | initialFocus                       | returnFocus              | restoreFocus | insideElements                             |
| --------------------------- | ------------------------------------------ | ------------------------------------- | -------------------------------- | ----------------------- | -------------------------- | ---------------------------------- | ------------------------ | ------------ | ------------------------------------------ |
| Dialog                      | `mounted`                                  | `modal !== false`                     | yes when modal                   | ✓                       | `!disablePointerDismissal` | `resolvedInitialFocus`             | `finalFocus`             | `"popup"`    | popup                                      |
| Dialog `trap-focus` (Radix) | `mounted`                                  | Radix opt-in ⇒ traps                  | no (not modal)                   | ✓                       | n/a (Radix mode)           | `resolvedInitialFocus`             | `finalFocus`             | `"popup"`    | popup                                      |
| Popover click               | `mounted`                                  | `modal !== false && hasClosePart`     | yes when modal+Close             | ✓                       | default (`true`)           | `resolvedInitialFocus`             | `finalFocus`             | `"popup"`    | popup                                      |
| Popover hover-open          | **disabled** (`openReason===triggerHover`) | —                                     | —                                | **—** (manager off)     | —                          | —                                  | —                        | —            | —                                          |
| Menu root                   | `mounted`                                  | `isContextMenu` ⇒ `false`             | no                               | ✓                       | default (`true`)           | `parent.type !== 'menu'` ⇒ popup   | `finalFocus ?? computed` | `true`       | popup                                      |
| Menu submenu                | `mounted`                                  | `false`                               | no                               | ✓                       | default (`true`)           | `parent.type !== 'menu'` ⇒ `false` | `finalFocus ?? computed` | `true`       | popup                                      |
| Context Menu                | `mounted`                                  | `isContextMenu` ⇒ **`true`**          | yes                              | ✓                       | default (`true`)           | popup (`parent ≠ menu`)            | `finalFocus ?? computed` | `true`       | popup                                      |
| Menubar child               | `mounted`                                  | `false`                               | no                               | ✓                       | default (`true`)           | popup (`parent ≠ menu`)            | `finalFocus ?? computed` | `true`       | popup                                      |
| Select                      | `mounted`                                  | `false`                               | no                               | ✓                       | default (`true`)           | default                            | `finalFocus`             | `true`       | popup                                      |
| Combobox input-inside       | `mounted`                                  | `!inputInsidePopup ‖ modal` ⇒ `modal` | `modal ‖ typeable`               | ✓                       | default (`true`)           | `resolvedInitialFocus`             | `resolvedFinalFocus`     | default      | popup + `[startDismissRef, endDismissRef]` |
| Combobox input-outside      | `mounted`                                  | ⇒ **`true`**                          | **yes**                          | ✓                       | default (`true`)           | `resolvedInitialFocus`             | `resolvedFinalFocus`     | default      | popup + `[startDismissRef, endDismissRef]` |
| Autocomplete                | `mounted`                                  | = Combobox (`selectionMode='none'`)   | = Combobox                       | ✓                       | default (`true`)           | = Combobox                         | = Combobox               | default      | = Combobox                                 |

> **Verified out of scope: Tooltip, Preview Card, Navigation Menu render no `FloatingFocusManager`.**
> Their `*Popup.tsx` mount only a plain element (Tooltip/Preview Card use `useHoverFloatingInteraction`;
> Navigation Menu a `<nav>`). So Base UI gives them **no** focus trap, aria-hidden, marker, or
> `closeOnFocusOut` — they are **not** `RdxFloatingFocusManager` consumers. Where our Radix Tooltip /
> Preview Card / Navigation Menu close on focus-out, that is a **per-primitive concern**, owned by the
> primitive itself via the package-internal `useFocusOutside` (ADR 0015 §3/§7) — **not** this focus
> manager. Re-wiring it is a task of the **ADR 0015 migration** (Phase 4), not 0017.

**Divergence flagged for the Phase 0 focus-out parity table:** Base UI Select has
`closeOnFocusOut` default `true` (it **closes** on focus-out), but our Radix Select does **not** close.
**Shipped resolution:** Radix Select keeps the divergence — `select-popup.ts:161` sets
`closeOnFocusOut: () => false` because the listbox owns DOM focus and items are navigated virtually via
`aria-activedescendant`. Adopting Base UI's close-on-focus-out is **de-scoped to follow-up** pending
real-AT confirmation (see "Follow-up (de-scoped)").

### 2. The independent policies (each owned, none derived from `modal`)

- **enabled** — `mounted`, and **disabled on hover-open** (`openReason === triggerHover`). When disabled
  there is no trap, no aria-hidden, and **no marker** (the manager is off).
- **modal / trapped** — focus trap via `RdxFocusScope.trapped` ← the `modal` column. Context Menu,
  Combobox-input-outside, Dialog/Popover modal trap; Menu root, Select, submenu, Menubar do **not**.
- **initial / return / restore focus** — independent per-primitive policies (table, verified), **not**
  functions of `modal`. E.g. Menu `initialFocus = parent.type !== 'menu'` (root/context focus the popup,
  submenu does not); Combobox `initialFocus` is the input; `restoreFocus` is `"popup"` for Dialog/Popover
  but `true` for Menu/Select. **The callback forms carry an interaction argument (verified
  `FloatingFocusManager`):** `initialFocus(openInteractionType)` receives **how it opened**
  (pointer/touch/keyboard) and `returnFocus(closeType: InteractionType)` receives **how it closed** —
  user-observable (e.g. focus-visible ring only for keyboard opens). The policy interface must type these,
  **distinguishing `null` (programmatic open) from `''` (unknown interaction)** — verified, Base UI keys
  `preferPreviousFocus = openInteractionType == null` off exactly that, choosing the previously-focused
  element for programmatic opens vs the reference for unknown ones:

  ```ts
  // `null` = programmatic open (prefer previously-focused element); `''` = unknown interaction.
  type RdxInteractionType = 'mouse' | 'touch' | 'pen' | 'keyboard' | '' | null;
  initialFocus: Target | ((openInteractionType: RdxInteractionType) => Target);
  returnFocus: Target | ((closeInteractionType: RdxInteractionType) => Target | boolean);
  ```

- **Portal tab-order inputs (verified `MenuPopup`).** The focus manager also takes the portal-focus
  bridge's tab-order/guard inputs — Menu/Menubar pass all four, so they belong in the policy interface
  (omitting them would force a mid-migration contract change):

  ```ts
  externalTree?: RdxFloatingTree; // which tree/store (ADR 0015 §1); Menu: undefined for menubar children
  previousFocusableElement?: Element | null; // e.g. Menu's active trigger
  nextFocusableElement?: Element | null; // e.g. Menu root's trigger focus target
  beforeContentFocusGuardRef?: ElementRef | null; // the portal-focus bridge's leading guard (§4/§6)
  ```

- **`aria-hidden` isolation** — gated by `modal ‖ isUntrappedTypeableCombobox` (verified). Applied **only
  where the table says**, not for every local-`modal` popup (Select/Menu root get none).
- **`close-on-focus-out`** — Base UI `closeOnFocusOut` is the **input** (only Dialog sets it explicitly,
  `= !disablePointerDismissal`; others default `true`). The **resulting** close behavior also depends on
  the floating tree, focus guards, inside-elements, pointer-down state, and modal mode — so the
  per-primitive focus-out parity table (moved here from ADR 0015 §3) records the **resulting focus
  transition**, not the prop. It already surfaces one divergence: Base UI Select closes on focus-out
  (default `true`) while our Radix Select prevents it. This is a focus-manager concern, not a `useDismiss`
  one.
- **marker** — see §3; produced **when the manager is active**, independent of `modal`.

### 3. `markOthers`-equivalent — independent effects, two implemented + `inert` deferred

Owned here (moved from ADR 0016 §1). Base UI does **not** bundle `inert` + `aria-hidden` + marker; it
makes two separate `markOthers` calls and never passes `inert`:

1. **Accessibility isolation** — `markOthers(insideElements, { ariaHidden: modal ‖ typeable, mark: false })`.
2. **Marker-only** — `markOthers(markerInsideElements)`: runs whenever the focus manager is **active**,
   independent of `modal` — but **only where the manager is active**, not for every popup. A hover-open
   Popover disables its manager (`openReason === triggerHover`), so it produces **no** marker. (Tooltip
   and Preview Card have **no** manager at all — §1 — so they never produce a marker.) The marker is
   present for each popup/mode whose row in §1 has the manager `enabled`. Read by ADR 0015's outside-press
   guard.
3. **`inert`** — deferred internal capability; **no Base UI focus-manager consumer passes it** (verified).
   Do not build an opt-in `inert` API without a real call site.

**The manager is enabled by `mounted`, but its sub-effects split between `mounted` and `open` — verified
line-by-line.** `FloatingFocusManager` is mounted as `disabled={!mounted}` (`DialogPopup.tsx:123`), so the
component instance lives through the animated exit — but **not every effect inside it stays active**. The
**focus trap structure** (guards render `:934`, modal Tab-loop guard `:329`, tabIndex sync `:920`),
**close-on-focus-out** (`:410`), and **return-focus tracking/restore** (`:735`) are gated on `disabled`
only, so they **persist while mounted-but-closed**. But the **marker and `aria-hidden` isolation**
(`markOthers`, `:600` — `disabled || !floating || !open`), **pointer-outside tracking** (`:352`), and
**initial-focus** (`:655`) are additionally gated on `open`, so they **tear down the instant `open=false`**,
even though the DOM stays mounted. So: **trap + return-focus follow `mounted`; marker + aria-hidden follow
`open`.** `preventUnmountOnClose` only extends the `mounted` window, not the `open` one. Phase 0 pins this
exact per-effect timing against the shared `mounted`/`open`/`preventUnmountOnClose` tri-state (the full
breakdown lives in §6a's lifecycle split).

**Per-element reference counting + owner-scoped cleanup, respecting pre-existing attributes.** Ref-counting
alone is not enough. Like Base UI, the document state must:

- **reference-count overlapping owners** per element/attribute — an attribute is removed only when its
  count returns to zero;
- **preserve pre-existing attributes** — record which elements already had `aria-hidden` / `inert` set by
  the application **before** we touched them, and **never strip those on cleanup** (only remove what we
  added);
- **exclude `aria-live` regions** from `aria-hidden` (hiding them breaks announcements);
- **skip `<script>`** — and **only** `<script>` (Base UI's sole explicit exclusion). Do **not** broaden
  to a vague "non-rendered nodes" set, which could wrongly skip elements that should be marked/hidden; if
  more exclusions are ever needed, pin them against a confirmed Base UI list.

A "union of owned trees, restore on unmount" model is wrong for concurrent independent modals.

**`portalNodes` ≠ a popup's own roots (decided, verified against `FloatingFocusManager`).** Base UI's
`portalNodes` are the **nested child-portal containers _inside_ this popup**, not the popup's own relocated
roots: `Array.from(portalContext.portalNode.querySelectorAll('[data-base-ui-portal]'))` under the comment
_"Don't hide portals nested within the parent portal"_ (`FloatingFocusManager.tsx:605–608`). The floating
popup itself is passed **separately** as `floating`, and `markerInsideElements = [floating, ...portalNodes]`.
Because we have **no wrapper** (ADR 0010), a single `portalNodes: Element[]` is ambiguous — it would mix the
popup's own roots with its descendant portals. Split them into two named sets so a nested `Select`/`Menu`
inside an open popup is never mis-marked as outside / `aria-hidden`:

```ts
// What a portal exposes about its DOM — DISTINCT sets (Base UI keeps them apart):
//   ownRootElements      = ALL of this popup template's relocated roots (e.g. backdrop + popup) — DOM-footprint bookkeeping
//   focusRootElements    = the subset that participates in focus containment / tabbability / guards (NOT the backdrop)
//   contentRootElements  = the subset that is semantic content → aria-owns (a backdrop is NOT content)
//   descendantPortalRoots = nested CHILD portals' containers, living inside this popup (Base UI's portalNodes)
// (the full registration shape lives in §6a `RdxPortalRegistration` / `RdxPortalRegistry`)
```

`focusRootElements` feed the **portal-focus bridge** and **focus guards** (the backdrop, an `ownRootElement`,
does **not**); `contentRootElements` feed **`aria-owns`** only; `descendantPortalRoots` feed
`ariaKeepElements` / `markerKeepElements` (Base UI's `...portalNodes`); the **popup** is the floating node,
passed on its own (§6a).

**`ownRootElements` is DOM-footprint bookkeeping, NOT a keep-set — never fold it into the keep-sets.** This
popup's own keep-sets are exactly `markerKeepElements = [popup, ...descendantPortalRoots]` and the wider
`ariaKeepElements` (§ below); **its own sibling roots — backdrop, internal backdrop, any extra relocated
root — are deliberately _not_ kept**, so the marker/aria passes correctly mark/`aria-hide` them (a backdrop
**should** be `aria-hidden`/inert). `ownRootElements` exists only so **other** machinery can see this
popup's full DOM footprint — (1) a **parent** subtracts a registered child's `ownRootElements` from _its_
keep-sets via `descendantPortalRoots` (the registry walk), (2) guard re-seating / container-move
re-derivation / cleanup operate over all roots. Adding `ownRootElements` to this popup's own
`ariaKeepElements`/`markerKeepElements` would keep its backdrop visible/unmarked — a divergence from Base
UI, whose keep-set is only `[floating, ...portalNodes]`.

**`floatingElement` vs `floatingFocusElement` are two roles with a resolution algorithm (decided, verified
against `getFloatingFocusElement`).** The element the tree/dismissal uses (`floatingElement`) is **not**
necessarily the element focus is managed on. Base UI resolves the focus host as
`getFloatingFocusElement(floating)` (`utils/element.ts:82`): **if `floating` itself carries the focusable
marker** (`FOCUSABLE_ATTRIBUTE`) **use it; otherwise `floating.querySelector('[FOCUSABLE_ATTRIBUTE]') ||
floating`** — i.e. when the floating element is acting as a **positioning wrapper**, focus is managed on the
**child** that carries the event handlers / aria props. So:

- **`floatingElement`** — dismissal, the floating **tree/node**, outside-press containment (ADR 0015);
- **`floatingFocusElement`** — focus **trap**, `initialFocus` / `returnFocus`, `tabIndex` management, and
  the `getTabbableContent` base.

The focus host must be **resolved explicitly** (via a stable focusable marker), **never** assumed to equal
the popup host. They coincide for the common case (popup carries the handlers), but **diverge** for
positioner-is-floating and wrapper-based compositions (Select item-aligned, future wrappers). The
`RdxFloatingFocusManagerPolicy.popup` below is the resolved **`floatingFocusElement`**; the
**`floatingElement`** is what ADR 0015's node/tree references. Phase 0 pins the marker and the resolution.

**Inside-elements contract (decided).** A popup declares its inside sets to the manager via:

```ts
interface RdxFloatingFocusManagerPolicy {
  popup: HTMLElement; // the resolved floatingFocusElement (getFloatingFocusElement) — passed SEPARATELY
  descendantPortalRoots: readonly Element[]; // Base UI's `portalNodes`: nested child portals, NOT own roots
  // "keep" = elements kept visible/marked; the *complement* is aria-hidden / carries the marker.
  ariaKeepElements: readonly Element[]; // wide keep-set, see below
  markerKeepElements: readonly Element[]; // NARROW keep-set, see below
}
```

Naming: these are the elements **kept** (the `markOthers` "inside" set) — the complement is what gets
`aria-hidden` / the marker. `…KeepElements` reflects the real operation better than `…Inside`.

The sets use `Element` (not `HTMLElement`) to match Base UI's `markOthers` / `getInsideElements`, which
operate on `Element` — otherwise SVG triggers, custom elements, and Shadow DOM hosts would force a
breaking contract change later.

**Marking root is always the owner-document `body` (decided, verified against `markOthers`).** Both passes
start their traversal from `ownerDocument(avoidElements[0]).body` (`markOthers.ts:217`) — **the owner
document's `body`, never a `ShadowRoot`**. A popup portaled into a `ShadowRoot` does **not** turn that root
into a separate marking root (which would mark only the shadow siblings and diverge from Base UI); instead
the keep targets are **corrected up to their shadow host** so the same document-body traversal still finds
them.

**Shadow DOM correction (decided, verified against `markOthers`).** Before building a keep-set, each keep
target must be **corrected up to its shadow host** if it is not contained in the marking root (`body`) —
Base UI's `correctElements(body, …)` (`markOthers.ts:118`) walks
`unwrapHost(node) = isShadowRoot(node) ? node.host : unwrap(parentNode)` until the target (or its host) is
inside `body`. Without this, a popup rendered **inside** a Shadow DOM would compute a keep-set that excludes
its own host and `aria-hidden` itself. The manager runs this correction on both `ariaKeepElements` and
`markerKeepElements`.

The two sets are **distinct and asymmetric**, mirroring Base UI exactly:

- **`markerKeepElements` is intentionally narrow — `[popup, ...descendantPortalRoots]` only** (Base UI's
  `markerInsideElements = [floating, ...portalNodes]`). It must **not** include the popup's own sibling
  roots, the trigger/reference, focus guards, or primitive extras. Widening it would make the §3
  third-party guard treat the trigger's whole root ancestor as "marked" and break outside-press detection.
- **`ariaKeepElements` is wider** — verified against `FloatingFocusManager` source:
  `popup (floating) + descendantPortalRoots + focus guards + portal outside-refs + previous/next focusable
elements + typeable-combobox ancestor + primitive extras` (Combobox's dismiss refs arrive via
  `getInsideElements`, which Base UI passes to the **aria-hidden** pass, **not** the marker pass). The
  **trigger/reference (`domReference`) is added only for an untrapped typeable combobox**, **not** for
  modal popups in general — in a normal modal the trigger is _outside_ and is correctly aria-hidden.

Primitives supply only their own elements; the manager adds **focus guards** (always) and the
trigger/reference **only in the untrapped-typeable-combobox case** — to `ariaKeepElements` only, never to
`markerKeepElements`. A primitive may override a set only with an explicit, justified reason.

**Cleanup ownership + timing (decided, verified against source).** The marker/aria-hidden counters are
`markOthers`'s **own** document-scoped infrastructure, owned by a shared **owner-`Document` helper** —
**not** ADR 0015's dismissal registry (that would re-mix the boundaries we just split). **Timing is keyed
on `open`, not on unmount:** Base UI gates the whole markOthers effect on `disabled || !floating || !open`
(`FloatingFocusManager.tsx:601`), so **both** passes (marker + aria-hidden) tear down the instant
`open === false`, while the DOM stays mounted for the exit animation. So cleanup must **not** wait for
`RdxPortalPresence` exit — it runs on `open=false`. During the exit only the **DOM roots** and the
**`inert` internal backdrop** (§5) remain; isolation/marker are already gone. (The owner-`Document` counter
still guards against dropping a count that a concurrent sibling popup still references.)

### 4. The manager coordinates **three** low-level focus parts — by composition

Strict parity is **not** achievable as a thin wrapper over `RdxFocusScope` alone. Base UI's
`FloatingFocusManager` works **with** `FloatingPortal` and its `FocusGuard`s as one focus system. So
`RdxFloatingFocusManager` is a coordinator over **three** low-level parts (it **composes** them via
`hostDirectives` / DI — never inherits, which would re-fuse trap + popup policy):

1. **`RdxFocusScope`** — the trap (`trapped` ← the §1 column). **Not assumed adequate as-is** — it needs a
   parity audit and likely internal rework (see Phase 0 and §6).
2. **A portal-focus bridge** — Base UI's `FloatingPortal` is an _active_ focus participant, not a DOM
   mover: it renders inner/outer `FocusGuard`s, makes the portal subtree tabbable **only while open**, adds
   `aria-owns` from the portal root, and **calls focus-out close itself when focus crosses the outer
   guard** (`FloatingPortal.tsx`: `closeOnFocusOut` + `before/afterOutsideRef`). Our `RdxPortal` /
   `RdxPortalPresence` only **move DOM**, and the legacy global `RdxFocusGuards` directive (since removed)
   was weaker. This ADR therefore
   **depends on portal-focus infrastructure work** (§6); it cannot be a `RdxFocusScope` wrapper.
3. **Owner-`Document` focus guards** — see §6.

We do **not** absorb dismissal (ADR 0015) or scroll lock (ADR 0016).

### 4a. Reads the shared floating tree (not its own)

**This ADR reads the shared floating tree; it does not build its own.** Base UI's
`FloatingFocusManager` reads the **same** `FloatingTree` as `useDismiss` — for ancestors, nested portals,
the typeable-combobox ancestor, and focus-out ownership. So `RdxFloatingFocusManager` consumes the
**shared, neutral** `RdxFloatingTree` / `RdxFloatingNode` infrastructure (ADR 0015 §1, "Shared
infrastructure"), attaching its own focus capability to a node — **not** a second focus-only tree, and
**not** the dismissal capability. Specifically it reads, from the shared infra:

- the **traversal** API (`ancestors`, `children({ onlyOpen })` — the focus-return path uses
  `onlyOpen: false`) — same open-filtering / recurse-through-closed semantics as dismissal (ADR 0015 §1);
  it does **not** use the dismissal-only `hasBlockingChild`;
- the **shared trigger registry** (`triggerElements`, ADR 0015 §2) for its inside-element checks — so
  focus and dismissal never compute divergent inside-sets;
- the **typed event channels** (`tree.events`) for cross-mechanism coordination (hover, list-navigation).

Building an independent tree here would desynchronize ancestry between dismissal and focus and
reintroduce the drift this split removes. ADR 0015 attaches the dismissal capability and owns its reads;
this ADR owns the focus/ancestor reads; the neutral tree/registry/events serve both.

### 5. `disableOutsidePointerEvents` removal — conditional on a pointer-interaction parity table

`disableOutsidePointerEvents` (ADR 0015 §6) blocks **pointer interaction** with the background. Removing
it is **this ADR's concern** (not ADR 0016 — scroll lock is unrelated), but it is **not yet a settled
decision**: `aria-hidden` does **not** block pointer, and a user backdrop is **optional**.

**The likely outcome is already architecturally predictable: a shared internal-backdrop primitive — owned
by floating/portal infrastructure, not by this focus manager.** Verified against source, Base UI does
**not** rely on a user backdrop — for modal Dialog/Popover/Menu/Select/Combobox it auto-renders an
**`InternalBackdrop`** (`utils/InternalBackdrop.tsx`) that intercepts background pointer and **cuts a hole
around the trigger/input** via a `clipPath` polygon, marked `data-base-ui-inert`. So the
pointer-interaction parity table will most likely conclude that Radix needs an equivalent
**`RdxInternalBackdrop` primitive**, tied to `RdxPortal` / `RdxPortalPresence` + the pointer policy.

**The `data-base-ui-inert` marker has TWO independent producers (#2, verified).** It is **not** produced
only by `markOthers`. `InternalBackdrop` carries the attribute **statically and permanently itself**
(`InternalBackdrop.tsx:24`), with the explicit comment _"Ensures Floating UI's outside press detection
runs, as it considers it an element that existed when the popup rendered."_ (`:22–23`). So the marker has
(1) a **dynamic** producer — `markOthers`, which marks the **outside** subtree and tears down on `open=false`
(§3) — and (2) a **static self-marker** on the backdrop, which lives with the backdrop independent of the
markOthers lifecycle. Consequences pinned here so neither side breaks the other: **`markOthers` cleanup must
not strip the backdrop's own marker** (it is a pre-existing, non-`markOthers` attribute — the
preserve-pre-existing-attributes rule in §3 already requires this, and it applies here), and ADR 0015's
third-party outside-press guard must treat **both** producers as valid markers (§ below + ADR 0015 §4).
This corrects the boundary table's shorthand "marker production = 0017": **0017 owns the `markOthers`
producer; the backdrop's static self-marker is owned by the internal-backdrop primitive** (floating/portal
infra), and both feed the one attribute ADR 0015 reads.

**Ownership decision: `RdxInternalBackdrop` belongs to the shared floating/portal infrastructure
(ADR 0015 §1) — NOT `RdxFloatingFocusManager`.** A focus manager must **not** render a pointer overlay
itself; that would re-fuse pointer/visual concerns into the focus layer. This ADR only **requires** the
primitive to exist and depends on it; **Phase 0 assigns the owner** (shared floating/portal infra) and
the table may otherwise prove the problem without anyone owning the fix.

**The cutout is a live-layout dependency, not just a portal child (#7, verified).** The `clipPath` is
computed from the **current** `cutout.getBoundingClientRect()` (`InternalBackdrop.tsx:13–15`), so the hole
tracks the trigger/content geometry — meaning the backdrop is coupled to **positioning/layout**, not only
to the portal. The owner must therefore refresh the cutout on the **same update cycle as the positioner**
(`RdxPopperContentWrapper`): on **resize**, **trigger movement**, **scroll**, **container move**, and
content resizing (e.g. menubar). **Phase 0 decides** whether `RdxInternalBackdrop` subscribes to the
Popper/floating layout-update cycle or runs its own `autoUpdate`; the failure mode if ignored is a stale
hole left at the old trigger position.

The removal is a **conditional outcome of the per-primitive pointer-interaction parity table** below,
filled in **Phase 0** (source study + browser checks) for Dialog, Popover, Menu, Context Menu, Menubar,
Select, Combobox, Autocomplete. Columns include the **internal-backdrop lifecycle** (verified: it renders
while **mounted**, becomes **`inert` when `!open`** — preserving the exit animation while killing
interaction):

**Menu must be split by `parent.type`, not one row (#5, verified against `MenuPositioner`).** Base UI's
backdrop predicate is `parent.type !== 'menu' && ((parent.type !== 'menubar' && modal && reason !== triggerHover) || (parent.type === 'menubar' && parent.context.modal))` (`MenuPositioner.tsx:285–287`).
So the table needs a **distinct row per Menu shape** — `effectiveModal = modal && !isSubmenu` is **not**
enough for strict parity:

| Menu shape          | internal backdrop?                              |
| ------------------- | ----------------------------------------------- |
| **submenu**         | **no** (`parent.type === 'menu'`)               |
| **root menu**       | yes if `modal && reason !== triggerHover`       |
| **hover-open root** | **no** (`reason === triggerHover`)              |
| **menubar child**   | yes iff `parent.context.modal` (menubar's flag) |
| **context menu**    | yes if `modal`                                  |

**Filled (source-derived against `mui/base-ui` master; paths relative to `packages/react/src/`).** The
single decisive finding: **Base UI uses no `body { pointer-events }` toggle anywhere.** Modal popups block
the background **only** via a full-viewport `InternalBackdrop` (clipPath cutout around the anchor); non-modal
/ hover popups **never block** the background — outside-press only _dismisses_ (floating-ui `useDismiss`),
it does not intercept. So the Radix body toggle can be dropped for **every** row, conditional on porting
`RdxInternalBackdrop`-with-cutout for the modal cases.

| Primitive               | what intercepts a background press                                                                                                                                                                         | internal backdrop when none provided?                  | trigger/input cutout                                                                                             | lifecycle (mounted vs open)          | interactive predicate (`inert` when `!open`) | state during animated exit | behavior with **no** backdrop                                  | ⇒ drop the body toggle?                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ------------------------------------ | -------------------------------------------- | -------------------------- | -------------------------------------------------------------- | --------------------------------------------------------- |
| Dialog (modal)          | `InternalBackdrop` `position:fixed; inset:0`, rendered in the **portal** when `mounted && modal===true` (`dialog/portal/DialogPortal.tsx:35`)                                                              | yes — always for modal, independent of user `Backdrop` | **none** — full-viewport, no `cutout` passed (`DialogPortal.tsx:36`)                                             | rendered while `mounted` (thru exit) | yes — `inert={inertValue(!open)}` (`:36`)    | mounted but `inert`        | non-modal Dialog → no backdrop; outside-press via `useDismiss` | **yes** — port `InternalBackdrop`                         |
| Popover (click / modal) | `InternalBackdrop` from the **positioner** when `mounted && modal===true && reason!==triggerHover` (`popover/positioner/PopoverPositioner.tsx:157`)                                                        | yes — independent of user `Backdrop`                   | **trigger** — `cutout={triggerElement}` (`:161`) ⟶ clipPath hole (`utils/InternalBackdrop.tsx:12`)               | while `mounted`                      | yes (`:160`)                                 | mounted but `inert`        | non-modal → none; `useDismiss` outside-press                   | **yes** (with trigger cutout)                             |
| Popover (hover-open)    | **nothing** — backdrop excluded (`reason!==triggerHover`, `:157`); user `Backdrop` forced `pointer-events:none` (`popover/backdrop/PopoverBackdrop.tsx:49`); dismissal via `useDismiss`                    | no                                                     | n/a                                                                                                              | n/a                                  | n/a                                          | n/a                        | nothing blocks the background by design                        | **yes / N/A** — hover never blocked                       |
| Select                  | `InternalBackdrop` from the positioner when `mounted && modal` (`select/positioner/SelectPositioner.tsx:245`); `modal` default `true` (`select/root/SelectRoot.tsx:70`)                                    | yes — independent of user `Backdrop`                   | **trigger** — `cutout={triggerElement}` (`:245`)                                                                 | while `mounted`                      | yes (`:245`)                                 | mounted but `inert`        | non-modal → none                                               | **yes** (with trigger cutout)                             |
| Combobox / Autocomplete | `InternalBackdrop` **only if `modal`** — default **`false`** (`combobox/positioner/ComboboxPositioner.tsx:129`; default `combobox/root/AriaCombobox.tsx:115`); else `useDismiss` (`AriaCombobox.tsx:1030`) | only when `modal` set `true`                           | **input/group** — `cutout={inputGroupElement ?? inputElement ?? triggerElement}` (`ComboboxPositioner.tsx:132`)  | while `mounted`                      | yes (`:131`)                                 | mounted but `inert`        | default non-modal: no backdrop, background interactive         | **conditional** — yes when modal; default needs no toggle |
| Menu — root             | `InternalBackdrop` when `parent.type===undefined && modal && reason!==triggerHover` (`menu/positioner/MenuPositioner.tsx:283`); `modal` default `true` (`menu/root/MenuRoot.tsx:567`)                      | yes                                                    | **trigger** — `backdropCutout=triggerElement` (`:294,307`)                                                       | while `mounted`                      | yes (`:306`)                                 | mounted but `inert`        | non-modal root → none                                          | **yes** (with trigger cutout)                             |
| Menu — submenu          | **nothing** — backdrop never rendered (`parent.type==='menu'`, `:285`); outside-press via the tree / `useDismiss`                                                                                          | no                                                     | n/a                                                                                                              | n/a                                  | n/a                                          | n/a                        | submenu never blocks the background                            | **yes** (no backdrop needed)                              |
| Menubar — child         | `InternalBackdrop` when `parent.type==='menubar' && parent.context.modal` (`MenuPositioner.tsx:286`)                                                                                                       | yes (when menubar modal)                               | **menubar content** — `backdropCutout=parent.context.contentElement` (`:292`) so all bar triggers stay hoverable | while `mounted`                      | yes (`:306`)                                 | mounted but `inert`        | non-modal menubar → none                                       | **yes** (with content-element cutout)                     |
| Context Menu            | `InternalBackdrop` when `modal`, ref wired to `parent.context.internalBackdropRef` (`MenuPositioner.tsx:301`)                                                                                              | yes                                                    | **none** — `backdropCutout` stays `null` for context-menu (`:290`); anchored at the cursor                       | while `mounted`                      | yes (`:306`)                                 | mounted but `inert`        | n/a (modal by default)                                         | **yes** (full-viewport, no cutout)                        |

> **Source-derived; browser-verify pending (jsdom cannot resolve clipPath / `getBoundingClientRect` /
> `inert` hit-testing):** that the clipPath cutout actually passes the pointer through to the
> trigger/input while blocking the rest (`InternalBackdrop.tsx:12`); that the menubar content-element
> cutout keeps every bar trigger hoverable for menu-switching (`:292`); that the input-group cutout keeps a
> modal Combobox typeable; that `inert` truly disables the backdrop during the animated exit; and that the
> cutout (computed once from `getBoundingClientRect`) does not go stale as the anchor moves/scrolls. These
> are the `RdxInternalBackdrop` acceptance checks for the Phase 5 Chromium matrix.

**The backdrop primitive is infra, but the _decision to render it_ is per-primitive policy (#7, verified).**
`RdxInternalBackdrop` is shared infrastructure (above), but **who renders it, where, and with what cutout
differs per primitive** and must **not** become "every modal floating node auto-gets a backdrop" (that would
break hover Popover, submenus, and menubar). Verified placements: **Dialog renders it in the portal**;
**Popover / Menu / Select / Combobox render it from the positioner** with their own predicate and cutout
target. So the render decision (predicate + cutout element + host: portal vs positioner) is owned by each
primitive's policy; the primitive only **reuses** the shared `RdxInternalBackdrop` mechanism.

**Acceptance gate:** the body toggle (`disableOutsidePointerEvents` + `DocumentPointerEventsState`) is
removed from `RdxDismissableLayer` **only for primitives whose row proves pointer-interaction parity**
(including a working `RdxInternalBackdrop` where the table requires one); for any row that does not, the
toggle stays (ADR 0015 §6, transitional) and that is recorded. Preview Card (constant `false`) drops the
input regardless, since it never blocked anything.

### 6. Low-level dependencies — `RdxFocusScope` rework, portal-focus bridge, owner-`Document` guards

This ADR depends on bringing three existing core primitives up to parity; their current implementations
are **not** sufficient (verified against our source), and this is recorded so implementation does not
stall on them:

- **`RdxFocusScope` (`focus-scope/src/focus-scope.ts`)** uses the global `document` (not owner-document),
  a **module-global** focus-scopes stack, plain `container.contains()` (no `composedPath` / Shadow DOM),
  and returns focus via `setTimeout` (not Base UI's queued initial/return-focus semantics). It conflicts
  with owner-document isolation, portaled inside-elements, focus guards + kept-mounted popups, and Shadow
  DOM. **Phase 0 must audit it; internal rework is permitted** — "the manager configures the existing
  scope" is too optimistic.
- **Portal-focus bridge (`portal` + `focus-guards`)** — per §4, Base UI's `FloatingPortal` actively owns
  inner/outer guards, portal-subtree tabbability, `aria-owns`, and outer-guard focus-out close. Our
  `RdxPortal` / `RdxPortalPresence` only move DOM. A **portal-focus bridge** must be built (or these
  primitives extended) so the manager gets guard/tabbability/`aria-owns` coordination — strict parity is
  impossible without it.
- **The legacy global `RdxFocusGuards` directive** (the old `focus-guards/` entrypoint — _since removed_,
  see the naming correction up top) had the **same process-global bug class** this trilogy removes
  elsewhere: a module-global `count` and global `document` / `document.body`. The replacement toolkit
  (`focus-scope/src/focus-guards.ts`) therefore creates guards per `ownerDocument` with a browser guard;
  it must stay covered by **two-document/iframe** tests.

### 6a. The portal-focus bridge is a contract, not just a dependency

This is the **main portal-integration ADR**. The bridge is a typed contract the manager consumes (name/
shape may differ; the **semantics** are required) — and it is **optional**: the manager takes
`portalBridge: RdxPortalFocusBridge | null`, because Base UI's `FloatingFocusManager` runs **without**
`FloatingPortal` too (#5, below):

```ts
interface RdxPortalFocusBridge {
  readonly ownRootElements: () => readonly Element[]; // ALL current Element roots of THIS embedded view (§3)
  readonly focusRootElements: () => readonly Element[]; // subset driving tabbability / guards / containment (NOT backdrop)
  readonly contentRootElements: () => readonly Element[]; // subset that is semantic content → aria-owns (excl. backdrop)
  readonly descendantPortalRoots: () => readonly Element[]; // child portals registered inside this popup (§3)
  readonly ownerDocument: () => Document;
  readonly mounted: () => boolean; // present (incl. animated exit / preventUnmountOnClose)
  readonly open: () => boolean; // interactive
}
```

**Non-portaled / inline popup — the bridge is optional (#5, verified).** `FloatingFocusManager` does not
require `FloatingPortal`: guards render iff `shouldRenderGuards = !disabled && (modal ? !isUntrappedTypeableCombobox : true) && (isInsidePortal || modal)` (`FloatingFocusManager.tsx:934`). So
with **no** portal: a **modal** manager **still renders its inside guards and traps** (the `modal` term
satisfies the condition), while a **non-modal** manager renders **no** guards and has **no** portal-specific
tabbability / outer focus-out guard. The manager must therefore work with `portalBridge === null`: it never
requires portal registration, and an inline modal Dialog still traps. Acceptance covers an inline
(non-portaled) modal popup (traps, guards) and an inline non-modal popup (no guards, no portal tabbability).

**Multi-root portal — never assume a single wrapper/`portalNode`.** `RdxPortalPresence` relocates **all**
root nodes of its template with **no wrapper** (ADR 0010), so `ownRootElements()` must be computed from **every
current `Element` root** of the embedded view, **ignoring text/comment nodes**, and **re-derived on
mount/unmount and on container change**. A focus manager that assumed one root would silently drop guards
for the focusable roots. **Both `focusRootElements` and `aria-owns` are narrower than `ownRootElements`:**
guards/tabbability run on `focusRootElements` and `aria-owns` on `contentRootElements`, so a backdrop —
an `ownRootElement` that is **DOM-footprint bookkeeping only**, not focus, `aria-owns`, or a keep-set
member — is neither guarded, owned, nor kept (the marker/aria passes mark it). Each `aria-owns` target must
carry a stable `injectId` id (Phase 0 #3 pins
ownership of those ids and container-move behavior).
`ownRootElements()` is **not** the same as `descendantPortalRoots()` (§3): the former is this popup's own
DOM, the latter is the set of nested child portals, supplied by the scoped registry below.

**Scoped portal registry — TWO independent hierarchies, not one (formalized, verified against source).**
Base UI has **two separate ancestries**, and conflating them is the failure mode here:

1. the **floating tree** (`FloatingTree`) — **logical popup ownership**, drives dismissal/focus (ADR 0015);
2. the **portal context** (`PortalContext`) — **DOM nesting / tab order / keep-sets**. A child portal's
   parent is `parentPortalNode = portalContext?.portalNode` (`FloatingPortal.tsx:77`), and a portal
   physically nests inside its **resolved container**: `container ?? parentPortalNode ?? document.body`
   (`:110–113`) — so an **explicit custom container overrides** the portal-context nesting. Descendant
   discovery for the keep-sets is `portalNode.querySelectorAll('[data-base-ui-portal]')` — a walk of the
   **portal** subtree, **not** the floating tree.

These do **not** coincide: a contextless portal inside a popup may have **no** floating node; a portal owned
by a floating descendant may be **redirected to a custom container** (so it is no longer physically nested);
one floating node may own **several** portal instances; and a popup may hold **non-floating** portal content.
So the registry stores **both links** and keys descendant discovery off the **portal** hierarchy:

```ts
// One portal instance's entry — produced by RdxPortal OR RdxPortalPresence (see below).
interface RdxPortalRegistration {
  // RESOLVED portal parent (see algorithm below) — NOT simply the nearest context when a custom container is set:
  readonly portalParent: RdxPortalRegistration | null;
  readonly floatingNode: RdxFloatingNode | null; // owning LOGICAL node (ADR 0015) — dismissal/focus, independent
  readonly ownRootElements: () => readonly Element[]; // ALL relocated Element roots (host for RdxPortal)
  readonly focusRootElements: () => readonly Element[]; // subset participating in focus containment / tabbability / guards
  readonly contentRootElements: () => readonly Element[]; // semantic subset → aria-owns (excl. backdrop; see below)
  readonly mounted: () => boolean; // present (incl. animated exit); always true for an attribute RdxPortal
  readonly open: () => boolean | undefined; // interactive; `undefined` for an always-mounted RdxPortal
}
```

**Explicit custom container severs portal ancestry (#1, verified).** Base UI resolves a portal's container
as `container ?? parentPortalNode ?? document.body` (`FloatingPortal.tsx:110–113`) — an explicit
`container` **overrides** `parentPortalNode`, so the portal is **no longer physically nested** in the
enclosing portal's subtree and `querySelectorAll('[data-base-ui-portal]')` would **not** find it. So
`portalParent` must be **resolved**, not just "the nearest portal context":

```ts
portalParent = explicitContainerProvided
  ? resolveRegisteredContainerParent(container) // the registration owning `container`, else null
  : nearestPortalContext; // only when nesting is implicit (container falls back to parentPortalNode)
```

If an explicit `container` is given and it does **not** belong to a registered portal, `portalParent` is
**`null`** — the portal is a keep-set root of its own, not a descendant of the enclosing popup. Otherwise a
parent would wrongly treat a custom-container-relocated child as DOM-inside it, the opposite of Base UI.

**Three root roles, not one (#3).** `ownRootElements` (ALL relocated roots) is **not** the set that drives
focus. Base UI's guards bound **one** wrapper holding the popup content; a backdrop is **not** a focusable
boundary. So split: **`focusRootElements`** drives tabbability / inner-outer guards / focus containment;
**`contentRootElements`** drives `aria-owns`; the **non-focus roots** (backdrop / internal backdrop) sit in
`ownRootElements` purely as **DOM-footprint bookkeeping** (§3) and must be **excluded from focus,
`aria-owns`, _and_ this popup's own `ariaKeepElements`/`markerKeepElements`** — they are precisely the
elements the marker/aria passes should mark. Feeding the backdrop into guards would corrupt focus
containment; feeding it into the keep-sets would leave it unmarked, both divergences from Base UI.

```ts
interface RdxPortalRegistry {
  register(entry: RdxPortalRegistration): RdxRegistrationHandle; // handle.destroy() on embedded-view destroy
  // descendant portals of a given entry, walked by PORTAL ancestry (portalParent), kept while mounted():
  descendantPortalRoots(of: RdxPortalRegistration): readonly Element[];
}
```

- **`portalParent` is the _resolved_ portal parent (algorithm above): the nearest portal context only when
  nesting is implicit, the container's registration when a custom container is set, else `null`.
  `floatingNode` is taken from the floating context, independently. The absence of one never changes the
  other.**
- a parent reads `descendantPortalRoots(entry)` = the `ownRootElements()` of every registered portal whose
  `portalParent` chain leads back to it — **floating ancestry is not consulted** for keep-sets;
- **registration persists through the mounted exit animation** (kept while `mounted()`), so a closing
  child's roots stay excluded from the parent's keep-sets while it animates out;
- registration tracks `mounted()` **and** `open()` so each reader picks the right predicate (the §6a
  lifecycle split), rather than a single switch;
- **cleanup happens when the embedded view is destroyed** (`handle.destroy()`), not on `open=false`.

**Both `RdxPortal` and `RdxPortalPresence` register (#5).** Base UI's portal nesting is **independent of
presence** — always-mounted regions nest the same way. So the registration contract is implemented by
**both**: `RdxPortalPresence` (own roots = the relocated template roots; `mounted()`/`open()` from the
presence machine) **and** the attribute `RdxPortal` (own roots = the relocated **host element**;
`mounted()` permanently `true`; `open()` `undefined`). A nested attribute portal that did **not** register
would be invisible to an ancestor focus manager's keep-sets — so it must.

**An always-mounted attribute `RdxPortal` has no `open` — readers must not coerce `undefined` to `true`
(#6).** Keep-set / `markOthers` / guard readers key off **`mounted()`** (always `true` here), so the
toast/always-mounted region correctly participates in a parent's keep-sets. But **interactive** readers
(dismissal eligibility, focus trap, initial-focus) treat `open() === undefined` as **"no interactive
capability"**, never as `true` — an attribute portal is a DOM-relocation, it does **not** by itself create
a dismissable/focus boundary. So an always-mounted toast portal can never become an active focus boundary
merely by being registered.

**The registry feeds keep-sets / guards / `aria-owns` only — NOT outside-press containment (#2,
verified).** Base UI's `useDismiss` computes outside-press "inside" from the **floating element + reference**,
the **floating-tree children** (`getNodeChildren`, `useDismiss.ts:173,345`), the **trigger registry**
(`:388`), and the **markers** (`:393–413`) — it does **not** consult `PortalContext` descendants. So portal
registry membership must **not** automatically count as dismissal-inside: a contextless portal kept for
`markOthers` may still be **outside** for dismissal. For dismissal, portal content is inside **only** if it
(a) belongs to a floating descendant (floating tree), or (b) is registered as a trigger / branch /
primitive inside-element (ADR 0015 §2/§4) — never by portal-ancestry alone. The registry **does not define
logical ancestry** — that remains the DI floating tree (ADR 0015 §1). The split is the whole point:
**`portalParent` answers "what is DOM-inside me for isolation", `floatingNode` answers "who owns dismissal" —
and the registry never derives one from the other or from raw DOM position.**

**Five distinct roles — never derive one from another.** Structural portal usually relocates the
**positioner**, while the dismiss/focus directives sit on an inner **popup**; but in `Select` the portal
root **is** the popup. So these five roles **sometimes coincide and sometimes don't**, and an
implementation must keep them as separate references rather than inferring one from another:

1. **portal own root** (`ownRootElements`, what got relocated),
2. **positioner** (`RdxPopperContentWrapper` — geometry only),
3. **floatingElement** (Base UI's `floating` — the **tree/node + dismissal** surface, ADR 0015),
4. **dismissable node element** (ADR 0015 capability host — usually the same as `floatingElement`),
5. **floatingFocusElement** (the resolved focus host = `RdxFloatingFocusManagerPolicy.popup`; **may be a
   child** of `floatingElement` when the latter is a positioning wrapper — §3 resolution algorithm).

Treating the portal root as the floating element — or assuming `floatingFocusElement === floatingElement` —
is the failure mode this list guards against.

**Tab order — reproduce logical order via guards, not body order.** Base UI inserts a nested portal's
wrapper **inside its parent portal**, preserving nested order; our portals each `append` to the end of
`document.body` by default, so DOM tab order does **not** reflect nesting. DI ownership fixes _dismissal_
ancestry but not _DOM_ tab order, so the portal-focus bridge must reproduce the logical order through its
inner/outer **focus guards** (`before/afterInside`, `before/afterOutside`) — it must **not** rely on body
order. Phase 5 covers: Tab from a parent popup into a portaled child, Shift+Tab back, two sibling nested
portals, and a **closed-but-still-mounted** child being **excluded** from the tab order.

**Lifecycle split — per concern, verified line-by-line against `FloatingFocusManager` (decided).** This is
**not** a single "everything follows `mounted`" or "everything follows `open`" rule — Base UI gates each
effect independently (`disabled` is wired as `disabled={!mounted}`, `DialogPopup.tsx:123`). The split is
exact:

**Active through the animated exit (follow `mounted`, i.e. `!disabled` — stay on while `open=false`):**

- **portal roots** exist (relocated nodes; animated exit / `preventUnmountOnClose`, ADR 0015 §1);
- **focus guards render** (`shouldRenderGuards = !disabled && …`, `FloatingFocusManager.tsx:934`);
- **modal Tab-loop guard** (the no-tabbable-content Tab trap, `:329` — `disabled || !modal`);
- **close-on-focus-out** handler (`:410` — `disabled || !closeOnFocusOut`);
- **return-focus tracking + restore-on-unmount/close** (`:735` — `disabled`);
- **portal focus-manager-state sync + tabIndex sync** (`:900`, `:920` — `disabled`).

**Torn down at `open=false` even though still mounted (follow `open`):**

- **`markOthers` — marker _and_ `aria-hidden` isolation** (`:600` — `disabled || !floating || !open`);
- **pointer-down-outside tracking** (`:352` — `disabled || !open`);
- **initial-focus on open** (`:655` — `!open || disabled`).

**Owned by other ADRs, also keyed on `open`:** dismissal (ADR 0015), scroll-lock (ADR 0016).

- the **internal backdrop** stays **mounted for the exit animation** but becomes **`inert` when
  `open=false`** (§5).

So the precise correction to the earlier draft: the **focus trap structure and return-focus follow
`mounted`** (they survive the exit), while **marker / aria-hidden / pointer-outside-tracking / initial-focus
follow `open`** (they release the instant `open=false`). A mounted-but-closed popup therefore **still traps
Tab and still owns return-focus**, but **no longer marks/`aria-hides` the rest of the document**. The exact
`preventUnmountOnClose` behavior (whether it ever holds a popup mounted **and** open) is pinned in Phase 0.

**Dynamic container change must not move ownership.** `setContainer()` physically relocates live nodes, but
a container change is **not** a re-parent: the **floating-tree parent and the descendant-portal registry are
not recomputed from DOM** (they stay DI-derived). The portal-focus bridge, however, must react to the move —
it **re-seats the focus guards**, **updates owner-`Document` listeners (or rejects a cross-`Document` move,
per ADR 0015 §1)**, **preserves the currently focused element** across the relocation, and **re-runs the
ShadowRoot correction** for the keep-sets. Acceptance: changing the container within the same `Document`
while a nested popup is open leaves dismissal **and** focus ownership unchanged (§Phase 5).

## Implementation Plan

> Marker/aria-hidden cleanup uses a shared **owner-`Document` helper** (§3), **not** ADR 0015's dismissal
> registry.

### Phase 0: Parity characterization (mandatory — gates later phases)

Fill the tables/audit below. **Two gate tiers** (they are sequenced differently, so do not conflate them):

- **Tier A — source-derived decisions.** Every item's `Resolution` is decided from `~/git/base-ui` source +
  an audit of our code. **These gate Phase 1**: no implementation starts until Tier A is complete (it now
  is). Phase 1 proceeds on the Tier-A decision and its documented **fallback**.
- **Tier B — browser/AT verification** (the `‡` / "browser-pending" items: #3 `aria-owns`, #9 capture-race,
  #10 WebKit blur). A real browser/AT/Safari is not available at characterization time, so these are
  **pre-Acceptance gates verified in the Phase 5 matrix**, **not** Phase 1/2 blockers. Implementation builds
  the Tier-A choice; the documented fallback is applied **only if** Phase 5 verification fails. The Tier-B
  gate sentences below therefore read "**before Acceptance**" (decision + contingency recorded now; browser/AT
  _confirmation_ in the Phase 5 matrix gates Acceptance) — they are **not** Phase 1/2 blockers.

**Status (all 12 items resolved — each has a `Resolution` below, source-derived against `~/git/base-ui` +
an audit of our code).** Classification:

- **Source-resolved / satisfied by the foundation** — #1, #2 (filled tables), #4 (positioner exit = parity,
  no change), #6 (dismissal-inside = tree/registry, not portal), #8 (`children({onlyOpen:false})` exists),
  #12 (`createFloatingRootContext` + node-optional capability exist).
- **Decided, needs net-new infra (Phase 1/4)** — #0 (rework `RdxFocusScope`; build the portal-focus bridge
  / `RdxFocusGuards`), #5 (`resolveRegisteredContainerParent` + portal registry), #7 (pin the focus-host
  marker), #11 (migrate the two Combobox layouts).
- **Source-derived, decision/behavior browser-or-AT-pending (pre-Acceptance gate, verified in Phase 5)** —
  #3 (single `aria-owns` anchor vs multi-IDREF — AT), #9 (capture-timing race — Playwright; fallback =
  explicit capture marker), #10 (WebKit blur-before-unmount — Safari matrix).

Audit facts behind these: `RdxFocusScope` uses global `document` / module-global stack / `contains()` /
`setTimeout`; `RdxFocusGuards`, the portal-focus bridge, `resolveRegisteredContainerParent`,
`RdxInternalBackdrop`, `markOthers`, and the `contentRootElements`/`ownRootElements`/`descendantPortalRoots`
roles are **ADR-only (not yet implemented)**; the foundation already ships the floating tree, per-root-context
trigger registry, `children({onlyOpen})`, and `createFloatingRootContext`.

0.  **Low-level primitive parity audit (§6).** Audit `RdxFocusScope`, `RdxPortal` / `RdxPortalPresence`,
    and `RdxFocusGuards` against Base UI's `FloatingFocusManager` + `FloatingPortal` + `FocusGuard`. Record
    per primitive: owner-`Document` vs global `document`, module-global state, `contains()` vs
    `composedPath`/Shadow DOM, `setTimeout` vs queued focus, portal guard/tabbability/`aria-owns`, and the
    needed rework (focus-scope rework, the portal-focus bridge, owner-document guards). **Gate:** the
    coordination contract and rework scope are decided before Phase 1.

    **Resolution (source-derived; audited our code + Base UI).** Base UI's `FloatingPortal` **is an active
    focus participant** — it renders visually-hidden `tabindex=0` `FocusGuard` spans (marked
    `data-base-ui-focus-guard`, `utils/FocusGuard.tsx:33`) **only when non-modal + open**
    (`FloatingPortal.tsx:189`), toggles inside-tabbability via capture-phase `focusin`/`focusout`
    (`:195–223`), and emits the single `aria-owns` span (`:266`). `FloatingFocusManager` uses the
    **owner document** (`ownerDocument(floating)`, `FFM:338…893`), **queued** focus (`queueMicrotask` +
    `enqueueFocus`→`requestAnimationFrame`), shadow-aware `getTarget`/`contains`, and a module-global
    `previouslyFocusedElements` WeakRef list. **Our audit:** `RdxFocusScope` uses **global `document`**
    (`focus-scope.ts:179`), a **module-global stack** (`stack.ts:14`), plain `container.contains()` (no
    `composedPath`/shadow), and `setTimeout` return-focus (`:233`); **`RdxFocusGuards` does not exist**;
    `RdxPortal`/`RdxPortalPresence` are **pure DOM movers** (no guards, no `aria-owns`, no focus
    participation). **Decisions / rework scope:** (a) **rework `RdxFocusScope`** to owner-`Document`,
    shadow/`composedPath`-aware containment, and queued (rAF/`afterRenderEffect`) focus — the module-global
    stack is acceptable but its return-focus must be owner-document-scoped; (b) **build a new portal-focus
    bridge** (`RdxFocusGuards` analog: leading/trailing guard spans + capture-phase tabbability toggle +
    the `aria-owns` anchor) tied to `RdxPortal`/`RdxPortalPresence` — it does **not** exist today; (c) the
    manager **composes** these three (trap + portal-focus bridge + owner-document) rather than extending
    `RdxFocusScope`. Tab-order/focus behavior is **browser-verify pending** (Phase 5).

1.  **Pointer-interaction parity table** (§5) — per primitive: what intercepts a background press, internal
    vs user backdrop, trigger/input cutout, backdrop **lifecycle (mounted vs open) / inert-when-`!open` /
    animated-exit**, no-backdrop behavior. **It may conclude — and is expected to — that a shared
    `RdxInternalBackdrop` primitive is required, with an assigned owner.** **Gate:**
    `disableOutsidePointerEvents` is removed only for rows that prove parity (incl. a working
    `RdxInternalBackdrop` where needed; §5 acceptance gate).
2.  **Focus-out parity table** — per primitive **and modal/non-modal**, the **resulting observable focus
    transition**, not the `closeOnFocusOut` input. It must also cover the `restoreFocus` edge cases Base UI
    handles separately (critical for Presence / animated unmount and dynamic Menu/Combobox items):

    **Filled (source-derived against `mui/base-ui` master).** Legend: **FFM** =
    `floating-ui-react/components/FloatingFocusManager.tsx`; the close decision is the `!modal` branch at
    `FFM:531–547` (requires a set `relatedTarget`, a move to an _unrelated_ node, and `!isPointerDownRef`),
    focus-out is **not** a `useDismiss` concern. ‡ = restore/timing cell that is source-correct but
    **browser-verify pending** (needs real layout/focus, see below).

    **Two distinct tree walks — do not conflate (drives the Phase 3 traversal choice).** Focus-out
    **containment** ("did focus move to an _unrelated_ node?", `movedToUnrelatedNode`) walks
    `getNodeChildren` with the **default `onlyOpen=true`** + `getNodeAncestors` (`FFM:454–478`), so focus
    moving into an **open** child popup is "related" and the parent stays open. The separate `onlyOpen=false`
    walk (`FFM:842`) is **only** the focus-return / unmount path (it must also count a closed-but-mounted
    descendant as inside, ADR 0015 §1). So the "focus → child popup" column cites **`FFM:466`** (containment),
    **not** `FFM:842`. (`triggerElements` here is `store.context.triggerElements`, `FFM:439` — per-root, not
    the shared tree, confirming the per-root-context trigger registry.)

    | Primitive / mode                               | focus → trigger/reference                                                                                                                                                                                                    | focus → child popup                                             | focus → outside                                                                        | pointer-induced focus move | focused element **removed**                                  | popup **kept-mounted while closed**                                                               | close during **queued initial-focus** frame | closes?                                                  |
    | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | -------------------------------------------------------------------------------------- | -------------------------- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ------------------------------------------- | -------------------------------------------------------- |
    | Dialog (modal)                                 | trapped — guards block it (`modal=true`, `FFM:935`)                                                                                                                                                                          | stays — containment walk `onlyOpen=true` (`FFM:466`)            | suppressed (`!modal` false, `FFM:532`)                                                 | suppressed (`FFM:535`)     | `restoreFocus="popup"` re-focuses popup ‡ (`FFM:499`)        | manager **enabled** (`disabled={!mounted}`); trap + return-focus persist; close moot              | `restoreFocusFrame.request` ‡ (`FFM:504`)   | **No**                                                   |
    | Dialog (non-modal / `disablePointerDismissal`) | `closeOnFocusOut=!disablePointerDismissal`; if disabled, listener never attaches (`FFM:411`)                                                                                                                                 | stays (`FFM:466`)                                               | plain non-modal → closes (`FFM:531`); `disablePointerDismissal` → no close (`FFM:411`) | suppressed (`FFM:535`)     | `restoreFocus="popup"` ‡                                     | manager enabled; return-focus persists; close moot                                                | `restoreFocusFrame` ‡                       | **only** if `closeOnFocusOut` & focus left tree          |
    | Popover (click)                                | modal → trapped; non-modal → trigger counts inside (`FFM:454`)                                                                                                                                                               | stays (`FFM:466`)                                               | modal suppressed (`FFM:532`); non-modal closes (`FFM:531`)                             | suppressed (`FFM:535`)     | `restoreFocus="popup"` ‡ (`PopoverPopup:138`)                | manager enabled (`disabled={!mounted‖hover}`); trap (if modal) + return-focus persist; close moot | `restoreFocusFrame` ‡                       | non-modal+left-tree **Yes**; modal **No**                |
    | Popover (hover-open)                           | manager fully `disabled` (`reason===triggerHover`) — no focus-out path                                                                                                                                                       | n/a (manager off)                                               | no focus-manager close (hover/`useDismiss` drives close)                               | n/a                        | no restore (manager off)                                     | n/a                                                                                               | n/a                                         | **No** (via FFM; hover-driven)                           |
    | Menu root                                      | trigger counts inside (`previousFocusableElement=activeTrigger`, `FFM:462`)                                                                                                                                                  | stays — open submenu via containment walk (`FFM:466`)           | closes (`!modal`, `FFM:531`)                                                           | suppressed (`FFM:535`)     | `restoreFocus=true` → prev/last tabbable/popup ‡ (`FFM:511`) | manager enabled; return-focus persists; close moot                                                | re-focus popup ‡ (`FFM:518`)                | **Yes** to unrelated                                     |
    | Menu submenu                                   | parent menu is an ancestor → focus→parent is inside (`FFM:471`)                                                                                                                                                              | stays (`FFM:466`)                                               | closes (`FFM:531`)                                                                     | suppressed                 | `restoreFocus=true` ‡                                        | manager enabled; return-focus persists; close moot                                                | re-focus popup ‡                            | **Yes** to unrelated; **No** to ancestor                 |
    | Context Menu                                   | trapped (`modal=true`, `MenuPopup:139`)                                                                                                                                                                                      | stays (`FFM:466`)                                               | suppressed (modal, `FFM:532`)                                                          | suppressed                 | `restoreFocus=true` ‡                                        | manager enabled; trap + return-focus persist; close moot                                          | re-focus popup ‡                            | **No** (modal)                                           |
    | Menubar child                                  | trigger registered inside → focus→trigger inside (`FFM:462`)                                                                                                                                                                 | stays (`FFM:466`)                                               | closes (`FFM:531`)                                                                     | suppressed                 | `restoreFocus=true` ‡                                        | manager enabled; return-focus persists; close moot                                                | re-focus popup ‡                            | **Yes** to unrelated                                     |
    | **Select**                                     | `modal=false`, `closeOnFocusOut` default **true** (`FFM:260`); trigger is `domReference`, inside (`FFM:454`)                                                                                                                 | n/a                                                             | **closes** — non-modal + unrelated + `relatedTarget` set (`FFM:531`)                   | suppressed (`FFM:535`)     | `restoreFocus=true` ‡ (`SelectPopup:525`)                    | manager enabled; return-focus persists; close moot                                                | re-focus popup ‡                            | **Yes** — Base-UI-vs-Radix divergence (below)            |
    | Combobox input-inside                          | `inputInsidePopup=true` → `focusManagerModal=modal` (default **`false`**) → **non-modal, untrapped**; typeable ⇒ `isUntrappedTypeableCombobox` (`ComboboxPopup:117`, `FFM:284`); input is `domReference`, inside (`FFM:454`) | stays (`FFM:466`)                                               | **closes** — untrapped typeable forces close to unrelated (`FFM:543`)                  | suppressed (`FFM:535`)     | `restoreFocus` default `false` → none                        | manager enabled; return-focus persists; close moot                                                | n/a                                         | **Yes** to unrelated                                     |
    | Combobox input-outside                         | `inputInsidePopup=false` → `focusManagerModal=true` **even when `modal=false`** (`ComboboxPopup:117`); role `presentation`, `resolvedFinalFocus=false` (`:114`) → **modal, trapped**                                         | stays (`FFM:466` + dismiss buttons inside, `ComboboxPopup:127`) | suppressed — modal (`FFM:532`)                                                         | suppressed                 | `restoreFocus=false` → none (focus stays in external input)  | manager enabled; trap persists; close moot                                                        | n/a                                         | **No** (modal) — closes via outside-press, not focus-out |
    | Autocomplete                                   | = Combobox per its `inputInsidePopup` (config-dependent ‡): input-inside ⇒ non-modal/untrapped; input-outside ⇒ modal/trapped                                                                                                | stays (`FFM:466`)                                               | input-inside ⇒ **closes** (`FFM:543`); input-outside ⇒ suppressed (`FFM:532`)          | suppressed                 | `restoreFocus=false` → none                                  | manager enabled; close moot                                                                       | n/a                                         | input-inside **Yes**; input-outside **No** ‡             |

    **Resolution — Select focus-out divergence (SHIPPED: Radix behavior kept; parity flip de-scoped).**
    Base UI Select **closes** on focus-out (`modal=false`, `closeOnFocusOut` defaults `true`, `FFM:260` →
    the `!modal` close branch `FFM:531`). **Radix Select ships `closeOnFocusOut: () => false`**
    (`select-popup.ts:161`): the listbox owns DOM focus and items are navigated **virtually** via
    `aria-activedescendant`, so a focus-out is not a selection event and must not close the listbox. The
    Phase-0 "adopt Base UI parity" decision is therefore **not shipped**; flipping it is a **follow-up**
    pending real-AT confirmation (see "Follow-up (de-scoped)"). (Focus returning to the trigger, staying in
    the popup, a pointer-induced move, or a null `relatedTarget` would not close either — `FFM:454/535`.)

    **Browser-verify pending (‡ cells):** every `restoreFocus` / `restoreFocusFrame` final-landing outcome
    depends on real layout (`isElementVisible`, `activeElement===body`, `FFM:488`) and animation-frame
    timing; the WebKit blur-before-unmount (`FFM:889`) is Safari-only; "trigger counts inside" for
    non-modal Popover / Menu / Menubar relies on runtime trigger-registration + `previousFocusableElement`
    wiring; and **Autocomplete's layout** (`inputInsidePopup`) is set by the root config, not the popup, so
    which row it follows (and thus whether it closes on focus-out) must be confirmed per usage. Source-derived
    above; confirmed in the Phase 5 Chromium/WebKit matrix.

    **Gate:** each primitive's focus policy must match its row; the known Base-UI-Select-closes-on-focus-out
    vs Radix-prevents divergence is recorded with its resolution (above).

3.  **`aria-owns` / content-roots audit (§6a, #4) — multi-IDREF is an Angular _adaptation_, not literal
    parity.** Base UI emits a **single** `<span aria-owns={portalNode.id} />` pointing at the **one wrapper**
    that owns the whole portal subtree (`FloatingPortal.tsx:267`). We have **no wrapper**, so listing
    several `contentRootElements` IDREFs is a _reasonable adaptation_ — but **not proven equivalent**.
    Phase 0 must validate in a real browser/AT, not assume: (a) do multiple IDREFs reproduce the intended
    reading/tab order; (b) are descendants that live under a **non-content** root (e.g. inside the
    positioner) lost; (c) is an **invisible semantic portal anchor** (one element wrapping the content roots,
    mirroring Base UI's single wrapper) better than enumerating roots. Also record **who mints/owns the
    stable IDs** (IDREF targets need SSR-stable `injectId` ids) and the `aria-owns` behavior on a
    **container move**. A backdrop is a DOM root but is **never** `aria-owns`'d. **Gate:**
    `contentRootElements` is defined separately from `ownRootElements`, and the IDREF-vs-anchor decision is
    made from browser/AT evidence (Tier B — recorded now, AT-confirmed before Acceptance in the Phase 5
    matrix); the backdrop is proven absent from any `aria-owns` set.

    **Resolution (source-derived; AT decision browser-pending).** Confirmed: Base UI emits a **single**
    `<span aria-owns={portalNode.id}>` (`FloatingPortal.tsx:266`) pointing at **one** wrapper
    `<div data-base-ui-portal id={useId}>` (`:131`), and only in the **non-modal-open** state. We have **no
    wrapper** today (`RdxPortalPresence` relocates root nodes with none). **Decision (preferred, source-
    derived): adopt the single invisible semantic anchor** (option c) — mint **one** stable-id anchor
    (`injectId`, SSR-stable) that owns the content roots, mirroring Base UI's single wrapper, **rather than**
    enumerating multiple `contentRootElements` IDREFs (unproven for reading/tab order, and loses descendants
    under non-content roots). `contentRootElements` is defined **separately** from `ownRootElements`
    (footprint), and a **backdrop is never in any `aria-owns` set**. **Browser/AT-verify pending:** the
    single-anchor-vs-multi-IDREF reading/tab-order equivalence and container-move behavior must be confirmed
    against a real screen reader **before Acceptance** (Tier B, Phase 5 AT matrix); if multi-IDREF proves
    necessary, that is the fallback.

4.  **Positioner lifecycle during animated exit (§6a, #6 — follow-up to ADR 0012).** Confirm Base UI's
    positioning lifecycle on close (`useAnchorPositioning` runs `autoUpdate` while `mounted`, gated
    `open: mounted` — `useAnchorPositioning.ts:441,507`) and decide our parity: **keep `autoUpdate` running
    until unmount** (current `RdxPopperContentWrapper` behavior = parity, no `active` input) vs freeze on
    `open=false`. If kept, characterize whether a late `flip`/`shift` can visibly jump the popup mid-exit and
    whether any primitive needs to **pin the placement/transform for the exit** (a Popper capability, **not**
    a dismissal/focus concern). **Gate:** the positioner's exit-time behavior is decided and, if "keep
    running", a test asserts the exit animation is not broken by a placement change.

    **Resolution (source-derived; DECIDED).** Confirmed: Base UI keys positioning on **`mounted`, never
    `open`** — `whileElementsMounted: autoUpdate` with `open: undefined` (default) and, for `keepMounted`, a
    manual `autoUpdate` effect gated `keepMounted && mounted && reference && floating`
    (`useAnchorPositioning.ts:441,506–511`) — so `flip`/`shift` continue through the exit. **Decision: keep
    `autoUpdate` running until unmount** = parity, **no change** — our `RdxPopperContentWrapper.autoUpdate`
    already lives for the directive's whole lifetime (ADR 0012), no `active` input, no freeze-on-`open=false`.
    A "pin placement/transform for the exit" is an explicit **Popper** capability (out of scope here, not a
    dismissal/focus concern) and is **not** added unless a primitive needs it. **Browser-verify pending:** a
    visual-regression test that a late `flip`/`shift` does not visibly break the exit animation (layout-
    dependent → Phase 5 Playwright).

5.  **Portal-ancestry vs custom-container audit (§6a, #1).** Characterize, per portaled primitive, the
    resolved `portalParent`: implicit nesting (falls back to the enclosing portal context) vs an explicit
    custom `container`. Verify against Base UI's `container ?? parentPortalNode ?? body` that a
    custom-container child is **not** physically inside the parent portal subtree, and confirm our
    `resolveRegisteredContainerParent(container)` returns the container's registration (or `null`), so the
    parent's keep-sets exclude it. **Gate:** the resolved-parent algorithm is implemented and a child with
    an explicit body-level container is **not** a keep-set descendant of its logical parent.

    **Resolution (source-derived; needs new infra).** Confirmed Base UI:
    `resolvedContainer = container ?? parentPortalNode ?? document.body` (`FloatingPortal.tsx:110–113`) — an
    explicit `container` is the portal target directly, so a custom-container child is **physically inside
    that container, not the parent portal subtree**. **Our audit:** `resolveRegisteredContainerParent` **does
    not exist**; the portal only has the stateless `resolvePortalContainer` (no registry tracking container
    parents). **Decision:** mirror `container ?? parentPortal ?? body`, and **build** a portal registry +
    `resolveRegisteredContainerParent(container)` that returns the container's registered owner node (or
    `null`) so a parent's keep-sets exclude an explicit-body-container child. This is **net-new portal infra**
    (Phase 1/4), not present today. Source-derived; the keep-set exclusion is asserted in a Phase 5 test.

6.  **Dismissal-inside vs portal-inside audit (§6a, #2).** Confirm `useDismiss` computes outside-press
    "inside" from floating element + reference + **floating-tree children** + **trigger registry** +
    **markers** (`useDismiss.ts:173,345,388,393`), **not** `PortalContext` descendants. **Gate:** the
    dismissal engine (ADR 0015) treats portal-registry membership as **non-authoritative** for outside-press
    — a contextless portal kept for `markOthers` is dismissal-inside **only** via floating descendant or
    trigger/branch/inside-element registration.

    **Resolution (source-derived; satisfied by the foundation).** Confirmed: `useDismiss` computes
    outside-press "inside" from floating + reference (`composedPath`, `useDismiss.ts:181`), **floating-tree
    children** (`getNodeChildren`, `:344`), the **trigger registry** (`store.context.triggerElements`,
    `:382`), and **inert markers** (`:373`) — there is **no `PortalContext`** reference in `useDismiss`.
    **Decision:** the ADR 0015 engine treats portal-registry membership as **non-authoritative** for
    outside-press. This already matches our foundation: containment reads `RdxFloatingTree.children()` +
    the per-root-context `RdxTriggerRegistry`, never portal membership. A contextless portal kept only for
    `markOthers` is dismissal-inside **only** via a floating descendant (tree child) or
    trigger/branch/inside-element registration. Source-derived; gate met by the foundation's design.

7.  **Focus-host resolution audit (§3, #1).** Pin the focusable marker (`FOCUSABLE_ATTRIBUTE` analog) and
    the `getFloatingFocusElement(floating)` algorithm per primitive: where `floatingElement` ===
    `floatingFocusElement` (popup carries handlers) and where they **diverge** (positioner-is-floating,
    Select item-aligned, wrapper compositions). **Gate:** the manager resolves the focus host explicitly
    (trap / `initialFocus` / `returnFocus` / `tabIndex` operate on `floatingFocusElement`; tree/dismissal on
    `floatingElement`); a divergent case (focus host is a child of the floating element) is covered by a test.

    **Resolution (source-derived).** Confirmed: `getFloatingFocusElement(floating)` returns the floating
    element when it `hasAttribute(FOCUSABLE_ATTRIBUTE)`, else its `querySelector([FOCUSABLE_ATTRIBUTE])`
    match, else the floating element itself (`utils/element.ts:82`); `FOCUSABLE_ATTRIBUTE` is
    `data-base-ui-focusable` (`utils/constants.ts:1`). **Decision:** pin a Radix focusable marker (e.g.
    `data-rdx-focus-host`) and the identical resolution; the manager resolves the host **explicitly** — trap,
    `initialFocus`, `returnFocus`, and `tabIndex` operate on **`floatingFocusElement`**, while tree/dismissal operate on
    **`floatingElement`** (distinct roles, §6a five-role list). **Our divergent cases (audited):** Select's
    popup **is** the floating element and the focus host (traps via `RdxFocusScope`, `select-popup.ts:101`),
    with the positioner a separate geometry ancestor; **item-aligned** Select has no wrapper; Combobox does
    **not** trap (host stays the input). A divergent case (focus host nested below the floating element) gets
    a Phase-5 test. Source-derived; the marker name is our choice.

8.  **Focus-return traversal filter (#4).** Confirm the focus-inside-tree check on unmount/close walks
    descendants with `onlyOpen=false` (`FloatingFocusManager.tsx:842`), so focus inside a closed-but-mounted
    descendant still counts as inside the tree. **Gate:** the return-focus path calls the shared traversal
    with `onlyOpen: false` (ADR 0015 §1), never the dismissal default `onlyOpen: true`; tested with a
    keep-mounted closed child holding focus.

    **Resolution (source-derived; satisfied by the foundation).** Confirmed: the return-focus walk is
    `getNodeChildren(tree, id, false)` at `FFM:842` (vs the default `onlyOpen=true` containment walk at
    `FFM:466`). **Already implemented:** `RdxFloatingTree.children(node, { onlyOpen: false })` exists and is
    documented for exactly this focus-return path (the dismissal default stays `onlyOpen: true`). The
    Phase-3 return-focus path calls it with `onlyOpen: false`; a unit test covers a keep-mounted closed
    child holding focus still counting as inside the tree. Gate met by the foundation.

9.  **`insideReactTree`-analog capture audit (#5).** Base UI keeps an `insideReactTree` capture marker
    (`useDismiss.ts:167,234,367`) separate from DOM/floating tree, guarding document-capture timing and
    logical-tree interactions. Our Angular bubbling after DOM relocation does **not** follow the declaration
    tree. **Gate:** prove (with tests) that the shared floating tree + owner-`Document` host listeners
    **replace** this mechanism — pointer inside a portaled child while a document-capture listener is armed,
    child handler `preventDefault`s, parent must **not** dismiss, including when dispatch moves/removes the
    target. If Phase 5 proves they do not fully cover it, add the explicit capture-marker analog as a
    contingency (Tier B — before Acceptance, not a Phase 1 blocker).

    **Resolution (source-derived; capture-timing browser-pending).** Confirmed: Base UI's
    `insideReactTree` is a **boolean on `dataRef.current`** set `true` by **capture-phase** handlers
    (`onPointerDownCapture`/`onMouseDownCapture`/… on the floating element, `useDismiss.ts:729–740`),
    auto-cleared on a `0ms` timeout (`:233`), and consulted by the document-level outside-press listener
    (`if (insideReactTree) { clear(); return; }`, `:367`) — it suppresses one outside-press that bubbled
    through the floating React subtree even across portals. **Decision:** for the **common** case the shared
    floating tree (logical DI children via `RdxFloatingTree.children()`) + per-root-context trigger registry +
    owner-`Document` host listeners **replace** it — an outside-press whose target is inside a portaled
    **logical** child is "inside" via the tree walk regardless of DOM relocation. **Browser-pending (gated):**
    the specific race it guards — a document-capture listener firing in the **same gesture** where a child
    handler `preventDefault`s **and** the target is moved/removed mid-dispatch — is **not** proven by tree
    membership alone and must be validated with a Playwright test in Phase 5; **if** it fails, an explicit
    capture-marker analog is added as a contingency **before Acceptance** (Tier B, Phase 5). Recorded as the
    gate condition.

10. **Safari/WebKit blur-before-unmount (browser matrix).** Base UI force-`blur()`s a focused input
    inside a closing popup on WebKit before unmount to avoid a random scroll-to-bottom
    (`FloatingFocusManager.tsx:885–899`, gated `platform.engine.webkit && !open && floating`). **Gate:** the
    WebKit browser matrix asserts closing a popup with a focused inner input does **not** scroll the page and
    that return-focus stays correct.

    **Resolution (source-derived; browser-pending — WebKit only).** Confirmed: gate
    `if (!platform.engine.webkit || open || !floating) return;` then blur the active element iff it is a
    **typeable** element `contains`ed by `floating` (`FFM:889–900`). **Decision: adopt** — on WebKit only,
    when `!open() && floatingElement` and `document.activeElement` is a typeable element inside the floating
    element, the manager calls `.blur()` before unmount (platform detection via our browser guard). This is
    **inherently WebKit/Safari-only**, so it is **browser-verify pending** — asserted in the Phase 5
    WebKit matrix (closing a popup with a focused inner input does not scroll the page; return-focus stays
    correct). Source-derived.

11. **Combobox input-inside vs input-outside — migrate the two layouts separately (#6, verified).** Base UI
    sets `focusManagerModal = !inputInsidePopup || modal` (`ComboboxPopup.tsx:117`), so an **input-outside**
    Combobox uses **modal** focus-manager behavior **even when `modal === false`**, with `returnFocus = false`
    (`resolvedFinalFocus = inputInsidePopup ? undefined : false`, `:114`) because focus already stays in the
    external input, the role is `dialog` vs `presentation` (`:81`), and the internal dismiss buttons render
    iff `focusManagerModal` (`:134`). The current `combobox-popup.ts` comment — _"does not trap focus — focus
    stays in the input throughout"_ — is therefore **not** full parity for the input-outside layout. **Gate:**
    the migration characterizes **both** layouts independently — `focusManagerModal`, `returnFocus`,
    `role`, the start/end dismiss buttons, and `getInsideElements` — and reconciles the popup's
    "does-not-trap" claim with Base UI's modal-for-input-outside behavior.

    **Resolution (source-derived).** Confirmed in `ComboboxPopup.tsx`: the focus-manager modality is
    `!inputInsidePopup || modal` (`:117`); the resolved final focus is `undefined` for input-inside and
    `false` for input-outside (`:114`); the role is `dialog` for input-inside, `presentation` otherwise
    (`:81`); inside-elements are the start/end dismiss refs (`:127`); and the trailing dismiss button
    renders only when the focus manager is modal (`:134`). **Our audit:** `combobox-popup.ts` does **not**
    trap and carries the comment _"focus stays in the input throughout"_ — correct for input-**inside**
    (non-modal/untrapped) but **wrong for input-outside**. **Decision (matches the corrected focus-out
    table rows):** migrate the two layouts independently — **input-inside** is non-modal/untrapped
    (`role=dialog`, default return focus); **input-outside** is modal/trapped even when `modal` is
    false (`role=presentation`, return focus `false` so focus stays in the external input), and renders the
    start/end dismiss buttons. The Radix "does-not-trap" comment is corrected in the Phase 4 migration.
    Source-derived; reconciled with item #2.

12. **Navigation Menu may run dismissal without a full floating node (#8, verified).** Base UI's Navigation
    Menu uses `useDismiss` with a **fallback empty floating context**, enabling interactions only when a
    positioner/value exists (`NavigationMenuList.tsx`). **Gate:** the shared dismissal API (ADR 0015) must
    support a **contextless / node-optional** mode for migration — either the root registers a floating node
    **only when a popup exists**, or the capability tolerates a temporarily-absent node — so Navigation Menu
    is not forced to register a full node in every state.

    **Resolution (source-derived; satisfied by the foundation).** Confirmed: Base UI's NavMenu runs
    `useDismiss` with a **fallback empty floating context** (`getEmptyRootContext()` — a `FloatingRootStore`
    with **no** tree node), enabling interactions only when a positioner/value exists. **Already
    implemented:** the foundation provides `createFloatingRootContext()` (the `getEmptyRootContext` analog)
    and the **node-optional capability model** — `RdxDismissableCapability` references a **root context
    mandatorily** and a **node optionally** (ADR 0015 §1). So NavMenu registers a tree node **only when a
    popup exists** and otherwise runs dismissal off a standalone root context with `node === null`. Gate met
    by the foundation; the wiring lands in the Phase 4 migration.

### Phase 1: Low-level focus foundation, then the `RdxFloatingFocusManager` skeleton

This phase has **two ordered steps** — the foundation lands **before** the skeleton, and both before any
primitive migration (Phase 4). It is the home for the Phase 0 #0 / §6 rework, which today **does not exist**.

**1a — low-level foundation (build / rework first):**

- **Rework `RdxFocusScope`** (Phase 0 #0): owner-`Document` (not global `document`), shadow/`composedPath`-aware
  containment (not bare `contains()`), and queued focus (rAF / `afterRenderEffect`, not `setTimeout`). The
  **active-scope stack moves to `WeakMap<Document, FocusScopeStack>`** — it pauses/resumes scopes, so it **is**
  cross-document state (opening a scope in document B must not pause document A's scope) and cannot stay
  process-global. Only a **passive** previously-focused-element history (a WeakRef list, no pause/resume
  coordination) may remain module-global — that, not the active stack, is the true Base UI
  `previouslyFocusedElements` analogue.
- **Build the portal-focus bridge + `RdxFocusGuards`** (Phase 0 #0 / §6 — net-new): leading/trailing
  visually-hidden `tabindex=0` guard spans + capture-phase inside-tabbability toggle + the single `aria-owns`
  anchor, tied to `RdxPortal` / `RdxPortalPresence`.
- Owner-`Document` focus guards (§6).

**1b — manager skeleton:**

- Implement the independent policy set (§1, §2) by **composing** the three low-level parts (reworked
  `RdxFocusScope` + portal-focus bridge + owner-document guards); wire focus lifecycle + `enabled`.

### Phase 2: aria-hidden + marker passes

- Implement the two `markOthers` effects (§3) with per-element ref-counting via the owner-`Document`
  helper; the marker is produced **where the manager is active** (not for hover-disabled popups).

### Phase 3: close-on-focus-out

- Implement focus-out close to match the Phase 0 focus-out parity table (incl. Dialog
  `!disablePointerDismissal` and the Select divergence resolution).

### Phase 4: Migrate primitives + remove the body toggle

- Dialog, Popover, Menu, Context Menu, Menubar, Select, Combobox, Autocomplete adopt
  `RdxFloatingFocusManager`; remove ad-hoc per-primitive focus/`trapped`/aria-hidden wiring. (Tooltip,
  Preview Card, Navigation Menu are **out of scope** — verified no Base UI `FloatingFocusManager`, §1.)
- Where the §5 table requires it, the **floating/portal infrastructure** (not this focus manager) builds
  the **`RdxInternalBackdrop`** primitive (pointer-intercepting, trigger/input `clipPath` cutout,
  `data-*-inert`, mounted-but-`inert`-when-`!open`) tied to `RdxPortal` / `RdxPortalPresence`; modal
  Dialog/Popover/Menu/Select/Combobox wire it in. The focus manager only depends on it.
- Remove `disableOutsidePointerEvents` + `DocumentPointerEventsState` from `RdxDismissableLayer` **only
  for primitives the §5 table proves parity for** (incl. a working `RdxInternalBackdrop`). Preview Card
  drops the constant-`false` input regardless.

### Phase 5: Verification

- Chromium per-axis tests: trap only where the table marks trapping; aria-hidden only where computed;
  marker present **for each popup/mode whose manager is active** (and absent for hover-disabled);
  third-party injected node guard (with ADR 0015); focus-out close matches the parity table; initial /
  return / restore focus per the table.
- **Multi-root Dialog**: a Dialog whose portal template emits multiple roots (backdrop + popup) — guards
  run on the **focus** roots, `aria-owns` on the **content** roots, and the popup's own keep-sets contain
  **only** `[popup, ...descendantPortalRoots]`. The **backdrop is in `ownRootElements` (footprint) but in
  none of guards / `aria-owns` / keep-sets** — the marker/aria passes must mark it (§6a, Phase 0 #3).
- **Nested-portal keep-sets**: an open parent popup with a nested portaled child (`Select`/`Menu`) does
  **not** mark or `aria-hidden` the child — `descendantPortalRoots` keeps it inside both passes (§3/§6a).
- **Closing child during parent's keep pass (#6)**: child **closed but still mounted** (mid exit
  animation), parent **stays open** → the parent's re-run marker/`aria-hidden` pass must **not** hide the
  closing child until its exit completes and it unmounts (it is still a registered descendant while
  `mounted()`); the child's own marker/isolation is already released on its `open=false`.
- **Registered but ineligible**: the closed-but-mounted child is registered (not mis-marked) yet excluded
  from its own interaction (no dismissal/marker of its own) (§3/§6a).
- **Tab order via guards**: Tab from a parent popup into a portaled child and Shift+Tab back follow logical
  order; two sibling nested portals tab in declared order; a closed-but-mounted child is **not** in the tab
  order — all independent of `document.body` append order (§6a).
- **Dynamic portal container change within one document**: moving the popup to a different container
  re-derives `ownRootElements()`, re-seats guards, preserves the focused element, and keeps trap/guards/marker
  correct — **without** changing dismissal or focus ownership (§6a).
- **Custom-container child is not a keep-set descendant (#1)**: a child portal given an explicit body-level
  `container` is **excluded** from its logical parent's keep-sets (resolved `portalParent === null`), and
  conversely an implicitly-nested child **is** included (§6a).
- **Backdrop is not a focus boundary (#3)**: with `focusRootElements` excluding the backdrop, Tab/guard
  containment ignores it; the backdrop appears in `ownRootElements` (footprint) but never in
  `focusRootElements` / guards, `aria-owns`, or the popup's own `ariaKeepElements`/`markerKeepElements`.
- **Inline (non-portaled) popup (#5)**: an inline **modal** Dialog (`portalBridge === null`) still traps and
  renders inside guards; an inline **non-modal** popover renders **no** guards and needs no portal
  registration — the manager runs without a bridge.
- **Always-mounted attribute portal (#6)**: a registered always-mounted `RdxPortal` (toast region,
  `open === undefined`) participates in an ancestor's keep-sets via `mounted` but is **never** treated as an
  active dismissal/focus boundary (no coercion of `undefined` to `true`).
- **Portal membership is not dismissal-inside (#2)**: clicking a contextless portal kept for `markOthers`,
  that is neither a floating descendant nor a registered trigger/branch/inside-element, **still counts as
  outside-press** for dismissal (ADR 0015).
- SSR: no browser globals; no markers emitted on the server.

## Consequences

### Positive

- One owner of the **independent** policy set ⇒ trap, aria-hidden, marker, focus-targets cannot drift
  against each other (removes the bug class from reviews) — provided the manager keeps them as separate
  columns, not derived from one boolean.
- Marker is produced wherever the manager is active ⇒ ADR 0015 third-party guard ships cleanly;
  producer/reader split mirrors Base UI.
- `closeOnFocusOut` and the pointer-toggle removal live with focus/a11y, not dismissal or scroll lock.

### Negative

- A new focus-management layer (bigger than wiring `RdxFocusScope` ad hoc); migration across many
  primitives.
- The manager mounts on every popup that has one; hover-open must disable it (no trap/aria-hidden/marker).

### Risks

- Drift if the manager collapses the independent policies back into one modality, or if any primitive
  computes a policy locally — lint/review must enforce single ownership of the **set**.
- Marker cleanup races on animated unmount — ref-counting via the owner-`Document` helper must be exact
  (and must not leak into ADR 0015's registry).

## Alternatives Considered

- **Keep focus/aria-hidden/marker split across `RdxFocusScope` + `RdxMarkOthers` + per-primitive config
  (the ADR 0016 first cut).** Rejected — it recomputes modality in several places and produced the exact
  drift bugs this ADR removes.
- **Absorb dismissal into the focus manager.** Rejected — Base UI keeps `useDismiss` separate; ADR 0015
  owns dismissal and only reads the marker.
- **Absorb this into ADR 0016.** Rejected — that would make the "scroll-lock" ADR silently own a focus
  engine; the boundary is cleaner as three ADRs.

## Follow-up (de-scoped 2026-07-12)

The core above is **Accepted** and in production (Dialog, Popover, Menu, Select, and Context Menu + Menubar
via `menu-popup`). The following are explicitly **out of this ADR's Accepted scope** and tracked in
**ADR 0023** (_Complete the floating focus manager rollout_) as workstreams **WS1–WS6**, listed below in the
same order. Each maps to the Acceptance Criteria it leaves partially open:

- **Migrate Combobox + Autocomplete onto `RdxFloatingFocusManager`.** Today they wire only
  `setupInternalBackdrop` and run no focus manager, so the §1 marker / aria-hidden rows for the
  `input-inside` / `input-outside` modes are unmet. — Criteria #1, #9.
- **Wire an `RdxInternalBackdrop` for modal Popover** from the positioner with a trigger cutout (§5 row);
  Popover wires none today. — Criterion #7.
- **Build the full §6a portal-focus bridge + scoped portal registry** — two independent hierarchies
  (`portalParent` / `floatingNode`), the three root roles (`ownRootElements` / `focusRootElements` /
  `contentRootElements`), `descendantPortalRoots`, and guard-driven portal **tab order**. Only a partial
  bridge exists today. — Criterion #5, §6a.
- **Write the Phase-5 verification matrix** — multi-root Dialog guards, nested-portal keep-sets, tab-order
  via guards, custom-container child, backdrop-not-focus-boundary, inline (non-portaled) modal, SSR. — Phase 5.
- **Select focus-out parity** — decide whether to flip Radix Select from the shipped
  `closeOnFocusOut: false` (listbox owns DOM focus + `aria-activedescendant`) to Base UI's
  close-on-focus-out, pending real-AT confirmation. — Criterion #4.
- **`aria-modal` AT-review**, the `markOthers` **`inert` internal variant** (no Base UI consumer passes it),
  and the **WebKit / screen-reader (Tier-B) matrices**. — Criteria #2/#3/#6 AT gates.

## Acceptance Criteria

> **Scope note (2026-07-12):** the criteria below are met for the **Accepted core** (Dialog / Popover /
> Menu / Select + Context Menu / Menubar). The parts left open by the de-scoped follow-up above —
> Combobox/Autocomplete adoption (#1, #9), Popover internal backdrop (#7), the full §6a portal
> bridge/registry and guard-driven tab order (#5), the Phase-5 matrix, the Select focus-out flip (#4), and
> the AT gates (#2/#3/#6) — are **not** required for this Accepted status and are tracked as follow-up.

1. `RdxFloatingFocusManager` is the **sole executor** of the independent policy set (enabled,
   modal/trapped, initial/return/restore focus, close-on-focus-out, aria-hidden, marker, inside-elements),
   kept as **separate** columns (§1), none derived from one `modal` boolean. Primitives may **compute
   input values** (e.g. `hasClosePart`, `isContextMenu`, `inputInsidePopup`) and pass them in, but must
   **not apply any of the effects themselves** (no ad-hoc `trapped`/aria-hidden/marker wiring).
2. `aria-hidden` is applied exactly where `modal ‖ typeable` is true — verified that Select and Menu root
   get **none** despite local `modal`.
3. The marker is produced for **each popup/mode whose manager is active** (per §1 `enabled`) and read by
   ADR 0015's outside-press guard — **not** for hover-disabled Popover, nor for Tooltip / Preview Card
   (which have no manager at all). The **`markerKeepElements` set is narrow
   (`[popup, ...descendantPortalRoots]`)** — it never includes the popup's sibling roots, trigger/reference,
   or guards (§3); `descendantPortalRoots` (Base UI's `portalNodes`) are the **nested child portals**, kept
   distinct from the popup's own `ownRootElements`; the keep-sets are typed `Element`, not `HTMLElement`. An open
   parent popup with a nested portaled `Select`/`Menu` does **not** mark or `aria-hidden` that child.
4. The Phase 0 **focus-out parity table** (resulting focus transition per primitive/mode — to
   trigger/reference, child popup, outside, pointer-induced move — not the raw `closeOnFocusOut` input) is
   filled and each primitive matches its row, with the Select divergence resolved.
5. The manager **composes three** low-level parts (§4): `RdxFocusScope` (audited + reworked per Phase 0,
   §6 — not assumed adequate), a **portal-focus bridge** (a typed contract — `ownRootElements` /
   `descendantPortalRoots` / `ownerDocument` / `mounted` / `open` — providing inner/outer guards,
   portal-subtree tabbability, `aria-owns`, outer-guard focus-out close; `RdxPortal` does not provide
   this), and **owner-`Document` focus guards**. The bridge handles **multi-root** portals (all `Element`
   roots, ignoring text/comment, re-derived on mount/unmount/container change), exposes
   `contentRootElements` (the `aria-owns` subset — backdrop roots excluded), and implements the
   **per-concern lifecycle split** (§6a, verified line-by-line): trap structure + return-focus +
   close-on-focus-out follow `mounted`; marker + aria-hidden + pointer-outside-tracking + initial-focus
   follow `open`; backdrop mounted-but-`inert`-when-closed — **not** a single mounted/open switch. A typed
   **scoped portal registry** models **two independent hierarchies** (verified against `FloatingPortal`):
   `portalParent` (nearest **portal** context → DOM nesting / keep-sets) and `floatingNode` (the **floating**
   tree → dismissal/focus), each resolved independently, neither derived from the other or from DOM position.
   `descendantPortalRoots` is walked by **portal ancestry**, **not** the floating tree, and `portalParent`
   is the **resolved** parent — an explicit custom `container` severs it (the container's registration or
   `null`), matching Base UI's `container ?? parentPortalNode ?? body`. Both **`RdxPortal` and
   `RdxPortalPresence`** implement the registration (attribute portal: own roots = host element,
   `mounted=true`, `open=undefined`); always-mounted nested portals are visible to an ancestor's keep-sets
   via `mounted` but, with `open === undefined`, are **never** coerced into an active dismissal/focus
   boundary. Registry membership feeds keep-sets / guards / `aria-owns` **only — not outside-press
   containment**: dismissal-inside is decided by the floating tree + trigger/branch registry (ADR 0015),
   never by portal-ancestry alone. The three root roles are distinct: `ownRootElements` (DOM-footprint
   bookkeeping only — **never folded into this popup's own keep-sets**, whose marker set is exactly
   `[popup, ...descendantPortalRoots]`) ⊇ `focusRootElements` (guards/tabbability, **excludes backdrop**)
   and `contentRootElements` (`aria-owns`, excludes backdrop); the backdrop is in `ownRootElements` but in
   none of guards / `aria-owns` / keep-sets, so it is correctly marked/`aria-hidden`. The bridge is **optional** (`portalBridge: … | null`) — an inline modal
   popup traps without a portal. Each entry carries `portalParent`, `floatingNode`, `ownRootElements`,
   `focusRootElements`, `contentRootElements`, `mounted`, `open`; registration persists while `mounted`,
   each reader picks `mounted` or `open` per the split, and cleanup is on embedded-view destroy. The **five roles** (portal own root / positioner / floating popup /
   dismissable node / focus-manager popup) are kept as separate references — never one derived from
   another (§6a). **Tab order** is reproduced via the guards (Tab in / Shift+Tab back / sibling portals /
   closed-but-mounted excluded), not `document.body` order. A **dynamic container change** within one
   `Document` re-seats guards and preserves focus **without** moving dismissal/focus ownership.
   `RdxFocusScope` is composed, not inherited; none is assumed parity-ready without the Phase 0 §6 audit.
6. `inert` is deferred (no Base UI consumer); not required for Accepted.
7. A per-primitive **pointer-interaction parity table** (§5) proves what intercepts background presses
   (user / internal backdrop / nothing), incl. backdrop **lifecycle (mounted vs open / inert-when-`!open`
   / animated-exit)**, before any `disableOutsidePointerEvents` removal. Where it requires one, a working
   **`RdxInternalBackdrop`** (cutout, `data-*-inert`, mounted-but-inert-when-closed) exists, **owned by
   floating/portal infrastructure — not this focus manager**; the body toggle is removed **only** where
   parity is proven (independent of ADR 0016).
8. Marker/aria-hidden cleanup uses a shared owner-`Document` helper, **not** ADR 0015's dismissal
   registry, and the document state **preserves pre-existing** `aria-hidden`/`inert`, reference-counts
   overlapping owners, excludes `aria-live`, skips `<script>`, and **corrects Shadow DOM keep targets to
   their host** before building the keep-sets (§3).
9. The §1 table is fully verified against Base UI source (focus targets, `closeOnFocusOut`,
   `insideElements`); the `initialFocus(openInteractionType)` / `returnFocus(closeInteractionType)`
   **callback interaction arguments** are typed and honored, including the **`null` (programmatic open) vs
   `''` (unknown)** distinction (programmatic ⇒ previously-focused element; unknown ⇒ reference, §2); the
   **portal tab-order inputs** (`externalTree`, `previousFocusableElement`, `nextFocusableElement`,
   `beforeContentFocusGuardRef`) are part of the policy interface (Menu/Menubar, §2); Tooltip / Preview
   Card / Navigation Menu are confirmed to have **no** `FloatingFocusManager` and are out of scope; the
   Base-UI-Select-closes-on-focus-out divergence is recorded in the focus-out parity table.
10. `RdxFloatingFocusManager` reads the **shared** floating infrastructure (ADR 0015 §1) — nodes,
    traversal, the shared **trigger registry** (§2), and the typed **event channels** — not a focus-only
    tree or a duplicate trigger list.
11. Focus scope, focus guards, and portal-focus coordination are **owner-`Document`-scoped**: no
    module-global **`document` / `document.body`** references (listeners, return-focus fallbacks, and
    tabbable queries all key off the owner document), verified with two-document/iframe tests (§6). The
    **active-scope stack** (which pauses/resumes scopes) is **per-`Document`** — `WeakMap<Document,
FocusScopeStack>`, **not** process-global — because pausing document A's scope when a scope opens in
    document B is exactly the cross-document corruption this forbids. Only a **passive** previously-focused
    history (a WeakRef list, no pause/resume coordination) may stay module-global; that is the real Base UI
    `previouslyFocusedElements` analogue, **not** the active stack. The hard isolation requirement is the
    same one this trilogy applies to pointer-events and scroll lock: per-`Document`, not process-global.
12. The **per-effect lifecycle split** is honored exactly (verified line-by-line, §3/§6a): **focus-trap
    structure, close-on-focus-out, and return-focus follow `mounted`** (persist while mounted-but-closed,
    return-focus fires on that lifecycle, not the raw `open` flip), while **marker, `aria-hidden`,
    pointer-outside-tracking, and initial-focus follow `open`** (release the instant `open=false`, even
    though the DOM is still mounted for the exit). `preventUnmountOnClose` extends only the `mounted`
    window. Pinned in Phase 0 against the `mounted`/`open`/`preventUnmountOnClose` tri-state (ADR 0015 §1).
13. SSR emits no markers and accesses no browser globals.

## Base UI References

- `FloatingFocusManager`
  `packages/react/src/floating-ui-react/components/FloatingFocusManager.tsx` (verified): two `markOthers`
  calls — `{ ariaHidden: modal ‖ isUntrappedTypeableCombobox, mark: false }` and marker-only (open,
  modal-independent); `inert` never passed.
- Per-primitive focus-modality (verified): Dialog `dialog/popup/DialogPopup.tsx`
  (`modal={modal !== false}`, `closeOnFocusOut={!disablePointerDismissal}`); Popover
  `popover/popup/PopoverPopup.tsx` (`modal !== false && hasClosePart`; disabled on `triggerHover`); Menu
  `menu/popup/MenuPopup.tsx` (`modal={isContextMenu}`); Select `select/popup/SelectPopup.tsx`
  (`modal={false}`); Combobox `combobox/popup/ComboboxPopup.tsx` (`!inputInsidePopup ‖ modal`);
  Autocomplete `autocomplete/root/AutocompleteRoot.tsx` (`AriaCombobox`, `selectionMode='none'`).
- Focus-target props (verified, FloatingFocusManager in each `*Popup.tsx`): `closeOnFocusOut` set **only**
  on Dialog (`!disablePointerDismissal`); absent elsewhere ⇒ default `true`. `initialFocus`:
  Dialog/Popover/Combobox `resolvedInitialFocus`, Menu `parent.type !== 'menu'`, Select default.
  `returnFocus`: Dialog/Popover/Select `finalFocus`, Menu `finalFocus ?? returnFocus`, Combobox
  `resolvedFinalFocus`. `restoreFocus`: `"popup"` (Dialog/Popover), `true` (Menu/Select), absent
  (Combobox). `getInsideElements`: Combobox `[startDismissRef, endDismissRef]`.
- **No `FloatingFocusManager` (verified)** — `tooltip/popup/TooltipPopup.tsx`,
  `preview-card/popup/PreviewCardPopup.tsx`, `navigation-menu/popup/NavigationMenuPopup.tsx` render a
  plain element with no focus manager ⇒ out of 0017 scope.
