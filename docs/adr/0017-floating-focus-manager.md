# ADR 0017: Floating focus manager (`RdxFloatingFocusManager`)

- Status: Proposed
- Date: 2026-06-14
- Decision owners: Radix NG maintainers
- Related: ADR 0015 (dismissal engine — **reads** the marker this ADR produces), ADR 0016 (scroll-lock
  parity — sibling concern, owns no focus/a11y), ADR 0005 (owned floating stack),
  `packages/primitives/focus-scope` (`RdxFocusScope`, the low-level primitive this wraps)

> Splits the focus / a11y-isolation / marker concerns out of ADR 0016 so one owner holds the independent
> focus-policy set. Architectural decisions are settled below; Phase 0 fills two parity-characterization
> tables before implementation.

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
`closeOnFocusOut` default `true` (it **closes** on focus-out), but our Radix Select `preventDefault()`s
focus-out (does not close). That is a real Radix-vs-Base-UI divergence the parity table must record.

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
   `RdxPortalPresence` only **move DOM**, and the global `RdxFocusGuards` is weaker. This ADR therefore
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

- the **traversal** API (`ancestors`, `children({ onlyOpen })`, `deepestOpen`) — same open-filtering /
  recurse-through-closed semantics as dismissal (ADR 0015 §1);
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

| Primitive                                                                       | what intercepts a background press | internal backdrop when none provided? | trigger/input cutout | lifecycle (mounted vs open) | interactive predicate (`inert` when `!open`) | state during animated exit | behavior with **no** backdrop | ⇒ drop the body toggle? |
| ------------------------------------------------------------------------------- | ---------------------------------- | ------------------------------------- | -------------------- | --------------------------- | -------------------------------------------- | -------------------------- | ----------------------------- | ----------------------- |
| Dialog / Popover (click) / Select / Combobox / Autocomplete                     |                                    |                                       |                      |                             |                                              |                            |                               |                         |
| Menu (submenu / root / hover-root / menubar-child / context) — **one row each** |                                    |                                       |                      |                             |                                              |                            |                               |                         |
| _(Phase 0 fills each row from Base UI source + Chromium)_                       |                                    |                                       |                      |                             |                                              |                            |                               |                         |

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
- **`RdxFocusGuards` (`focus-guards/src/focus-guards.ts`)** has the **same process-global bug class** this
  trilogy removes elsewhere: a module-global `count` and global `document` / `document.body`. If the
  manager uses or replaces guards, they must be moved into **owner-`Document` scope** with a browser guard
  and covered by **two-document/iframe** tests.

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

Fill the source-derived + Chromium-verified tables/audit below. **No implementation starts until they are
complete.**

0. **Low-level primitive parity audit (§6).** Audit `RdxFocusScope`, `RdxPortal` / `RdxPortalPresence`,
   and `RdxFocusGuards` against Base UI's `FloatingFocusManager` + `FloatingPortal` + `FocusGuard`. Record
   per primitive: owner-`Document` vs global `document`, module-global state, `contains()` vs
   `composedPath`/Shadow DOM, `setTimeout` vs queued focus, portal guard/tabbability/`aria-owns`, and the
   needed rework (focus-scope rework, the portal-focus bridge, owner-document guards). **Gate:** the
   coordination contract and rework scope are decided before Phase 1.
1. **Pointer-interaction parity table** (§5) — per primitive: what intercepts a background press, internal
   vs user backdrop, trigger/input cutout, backdrop **lifecycle (mounted vs open) / inert-when-`!open` /
   animated-exit**, no-backdrop behavior. **It may conclude — and is expected to — that a shared
   `RdxInternalBackdrop` primitive is required, with an assigned owner.** **Gate:**
   `disableOutsidePointerEvents` is removed only for rows that prove parity (incl. a working
   `RdxInternalBackdrop` where needed; §5 acceptance gate).
2. **Focus-out parity table** — per primitive **and modal/non-modal**, the **resulting observable focus
   transition**, not the `closeOnFocusOut` input. It must also cover the `restoreFocus` edge cases Base UI
   handles separately (critical for Presence / animated unmount and dynamic Menu/Combobox items):

   | Primitive / mode                                      | focus → trigger/reference | focus → child popup | focus → outside | pointer-induced focus move | focused element **removed** | popup **kept-mounted while closed** | close during **queued initial-focus** frame | closes? |
   | ----------------------------------------------------- | ------------------------- | ------------------- | --------------- | -------------------------- | --------------------------- | ----------------------------------- | ------------------------------------------- | ------- |
   | _(Phase 0 fills each from Base UI source + Chromium)_ |                           |                     |                 |                            |                             |                                     |                                             |         |

   **Gate:** each primitive's focus policy must match its row; the known Base-UI-Select-closes-on-focus-out
   vs Radix-prevents divergence is recorded with its resolution.

3. **`aria-owns` / content-roots audit (§6a, #4) — multi-IDREF is an Angular _adaptation_, not literal
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
   made from browser/AT evidence, before Phase 2; the backdrop is proven absent from any `aria-owns` set.
4. **Positioner lifecycle during animated exit (§6a, #6 — follow-up to ADR 0012).** Confirm Base UI's
   positioning lifecycle on close (`useAnchorPositioning` runs `autoUpdate` while `mounted`, gated
   `open: mounted` — `useAnchorPositioning.ts:441,507`) and decide our parity: **keep `autoUpdate` running
   until unmount** (current `RdxPopperContentWrapper` behavior = parity, no `active` input) vs freeze on
   `open=false`. If kept, characterize whether a late `flip`/`shift` can visibly jump the popup mid-exit and
   whether any primitive needs to **pin the placement/transform for the exit** (a Popper capability, **not**
   a dismissal/focus concern). **Gate:** the positioner's exit-time behavior is decided and, if "keep
   running", a test asserts the exit animation is not broken by a placement change.
5. **Portal-ancestry vs custom-container audit (§6a, #1).** Characterize, per portaled primitive, the
   resolved `portalParent`: implicit nesting (falls back to the enclosing portal context) vs an explicit
   custom `container`. Verify against Base UI's `container ?? parentPortalNode ?? body` that a
   custom-container child is **not** physically inside the parent portal subtree, and confirm our
   `resolveRegisteredContainerParent(container)` returns the container's registration (or `null`), so the
   parent's keep-sets exclude it. **Gate:** the resolved-parent algorithm is implemented and a child with
   an explicit body-level container is **not** a keep-set descendant of its logical parent.
6. **Dismissal-inside vs portal-inside audit (§6a, #2).** Confirm `useDismiss` computes outside-press
   "inside" from floating element + reference + **floating-tree children** + **trigger registry** +
   **markers** (`useDismiss.ts:173,345,388,393`), **not** `PortalContext` descendants. **Gate:** the
   dismissal engine (ADR 0015) treats portal-registry membership as **non-authoritative** for outside-press
   — a contextless portal kept for `markOthers` is dismissal-inside **only** via floating descendant or
   trigger/branch/inside-element registration.
7. **Focus-host resolution audit (§3, #1).** Pin the focusable marker (`FOCUSABLE_ATTRIBUTE` analog) and
   the `getFloatingFocusElement(floating)` algorithm per primitive: where `floatingElement` ===
   `floatingFocusElement` (popup carries handlers) and where they **diverge** (positioner-is-floating,
   Select item-aligned, wrapper compositions). **Gate:** the manager resolves the focus host explicitly
   (trap / `initialFocus` / `returnFocus` / `tabIndex` operate on `floatingFocusElement`; tree/dismissal on
   `floatingElement`); a divergent case (focus host is a child of the floating element) is covered by a test.
8. **Focus-return traversal filter (#4).** Confirm the focus-inside-tree check on unmount/close walks
   descendants with `onlyOpen=false` (`FloatingFocusManager.tsx:842`), so focus inside a closed-but-mounted
   descendant still counts as inside the tree. **Gate:** the return-focus path calls the shared traversal
   with `onlyOpen: false` (ADR 0015 §1), never the dismissal default `onlyOpen: true`; tested with a
   keep-mounted closed child holding focus.
9. **`insideReactTree`-analog capture audit (#5).** Base UI keeps an `insideReactTree` capture marker
   (`useDismiss.ts:167,234,367`) separate from DOM/floating tree, guarding document-capture timing and
   logical-tree interactions. Our Angular bubbling after DOM relocation does **not** follow the declaration
   tree. **Gate:** prove (with tests) that the shared floating tree + owner-`Document` host listeners
   **replace** this mechanism — pointer inside a portaled child while a document-capture listener is armed,
   child handler `preventDefault`s, parent must **not** dismiss, including when dispatch moves/removes the
   target. If they do not fully cover it, define the explicit capture-marker analog before Phase 1.
10. **Safari/WebKit blur-before-unmount (browser matrix).** Base UI force-`blur()`s a focused input
    inside a closing popup on WebKit before unmount to avoid a random scroll-to-bottom
    (`FloatingFocusManager.tsx:885–899`, gated `platform.engine.webkit && !open && floating`). **Gate:** the
    WebKit browser matrix asserts closing a popup with a focused inner input does **not** scroll the page and
    that return-focus stays correct.
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
12. **Navigation Menu may run dismissal without a full floating node (#8, verified).** Base UI's Navigation
    Menu uses `useDismiss` with a **fallback empty floating context**, enabling interactions only when a
    positioner/value exists (`NavigationMenuList.tsx`). **Gate:** the shared dismissal API (ADR 0015) must
    support a **contextless / node-optional** mode for migration — either the root registers a floating node
    **only when a popup exists**, or the capability tolerates a temporarily-absent node — so Navigation Menu
    is not forced to register a full node in every state.

### Phase 1: `RdxFloatingFocusManager` skeleton

- Implement the independent policy set (§1, §2) composing `RdxFocusScope`; wire focus lifecycle + enabled.

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

## Acceptance Criteria

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
11. Focus scope, focus guards, and portal-focus coordination are **owner-`Document`-scoped** (no
    module-global `count`/`document`/stack), verified with two-document/iframe tests (§6) — the same
    isolation this trilogy applies to pointer-events and scroll lock.
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
