# ADR 0015: Base UI-aligned dismissal engine

- Status: Proposed
- Date: 2026-06-14
- Decision owners: Radix NG maintainers
- Related: ADR 0005 (owned floating stack), ADR 0010 (structural portal presence), ADR 0011 (WAAPI
  presence exit detection), ADR 0017 (floating focus manager: produces the `aria-hidden` isolation and
  the marker this ADR's §4 guard reads), ADR 0016 (scroll-lock parity); both follow-ups own the concerns
  this ADR scopes out (§9). `packages/primitives/dismissable-layer`, all floating primitive consumers
  listed below

## Context

`RdxDismissableLayer` is the shared outside-dismiss mechanism for dialogs, menus, popovers, and other
floating primitives. It currently follows the older Radix DismissableLayer model:

- every mounted layer registers in a DI-scoped `layersRoot` signal, ordered by directive construction;
- document listeners detect Escape, pointer-down-outside, and focus-outside;
- `rdxDismissableLayerBranch` marks detached DOM as logically inside;
- layers may disable pointer interaction outside themselves by setting `pointer-events: none` on
  `document.body`.

The default `RdxDismissableLayersContextToken` provider normally makes the layer collection
application-root-scoped, but consumers can override that DI scope. The only process-global state is the
module-level `originalBodyPointerEvents` variable.

Base UI is the project's primary behavioral reference, but Base UI does not expose a public
DismissableLayer component. Its equivalent behavior lives in the internal `useDismiss` hook and the
Floating UI tree. The relevant behavior includes:

- explicit parent/child relationships between floating elements;
- configurable Escape and outside-press propagation through that tree;
- active trigger elements being treated as inside;
- different intentional/sloppy outside-press strategies;
- guards for touch scrolling, drag-out, pointer cancellation, scrollbars, non-primary buttons, IME
  composition, and third-party injected elements.

The current Angular implementation has several correctness gaps:

1. `focusOutside` can dismiss a parent while a child layer is active.
2. The registration-order `layersRoot` stack is used for topmost Escape handling and pointer-events
   layering, but construction order is not a reliable representation of logical parent/child ownership
   under portals and lazy mounting.
3. The `focusOutside` path separately infers nested-layer ownership from the DOM order of
   `[data-dismissable-layer]` elements. Portal placement and independent overlay containers can make DOM
   order differ from logical ownership.
4. Outside press is reduced to mouse `pointerdown` and a delayed touch `click`; it does not distinguish
   intentional presses from drag/scroll gestures.
5. Escape dismisses during IME composition.
6. The saved `body.style.pointerEvents` value is process-global rather than scoped to an owner
   `Document`, which is incorrect for iframes and multiple-document test environments.
7. Unit coverage does not exercise nested portals, branches, gesture cancellation, scrollbars, IME, or
   multiple documents.

These gaps are infrastructure risks: a fix in one consumer can mask the problem for that primitive
while leaving another consumer incorrect.

### Consumer inventory

The engine is not limited to Dialog, Menu, and Popover. The migration affects every direct consumer:

| Consumer        | Current dependency                                                                 |
| --------------- | ---------------------------------------------------------------------------------- |
| Dialog          | layer, modal outside-pointer blocking, all dismissal outputs                       |
| Popover         | layer, modal outside-pointer blocking, all dismissal outputs                       |
| Menu            | layer, branches, direct global context mutation, all dismissal outputs             |
| Select          | layer, modal outside-pointer blocking, Escape/pointer outputs, prevented focus-out |
| Combobox        | layer, modal outside-pointer blocking, branches on input/trigger/chips/clear       |
| Autocomplete    | layer, modal outside-pointer blocking, branches on input/clear                     |
| Preview Card    | layer and dismissal                                                                |
| Tooltip         | layer, Escape/pointer outputs, prevented focus-out                                 |
| Navigation Menu | layer, direct global branch mutation, all dismissal outputs                        |
| Context Menu    | indirect through Menu                                                              |
| Menubar         | indirect through Menu and trigger branches                                         |
| Editable        | **no layer** — injects raw `RdxFocusOutside` + `RdxPointerDownOutside` directly    |

Stories and standalone users of `@radix-ng/primitives/dismissable-layer` are also consumers.

**Editable is a special case.** `editable-root.ts` does not use `RdxDismissableLayer` at all; it
composes the raw `RdxFocusOutside` and `RdxPointerDownOutside` helper directives as `hostDirectives` and
injects them. §7 removes both directives from the public barrel, so Editable cannot simply keep
importing them. Because it has no popup layer, it migrates onto the package-internal
`useOutsidePress` / `useFocusOutside` utilities the engine itself is built from (§7), not onto a layer
node — see §7 "Non-layer consumers".

## Decision

Replace the current registration-order stack plus DOM-order focus inference with an Angular-native
dismissal engine that models logical floating ownership explicitly and aligns its observable behavior
with Base UI.

We will not port Base UI's React `useDismiss` or Floating Tree implementation directly. The engine will
use Angular signals, dependency injection, native DOM listeners, and the existing directive composition
model.

### 1. Introduce an explicit, shared floating tree

Each mounted floating element registers a **neutral** node in a **shared floating tree**. The node is
**not** dismissal-specific — dismissal (this ADR), the focus manager (ADR 0017), and future mechanisms
(navigation menu, nested list-navigation) read the **same** node/context, exactly as Base UI's
`FloatingNode` is neutral and `useDismiss` / `FloatingFocusManager` / etc. all read it.

```ts
// Shared floating infrastructure (a core/floating package) — see "Shared infrastructure" below.
interface RdxFloatingTree {
  /* node store; register/unregister, query children/ancestors (traversal below) */
  // Typed event channel — Base UI's `FloatingTreeStore.events`, used for hover-close, virtual
  // focus, menu open/close coordination, and list navigation. Neutral, not dismissal-specific.
  events: RdxFloatingEvents;
  triggers: RdxTriggerRegistry; // shared trigger registry (§2) — read by dismissal AND focus
}

interface RdxFloatingNode {
  id: string;
  tree: RdxFloatingTree; // which store this node belongs to (Base UI `externalTree`)
  parent: RdxFloatingNode | null; // resolved logical parent (resolution rules below)
  element: HTMLElement | null;
  ownerDocument: Document;
  // NOTE: no `open` / `active` field — open-ness is a per-capability property (below).
}
```

**The node is mounted-state; "open/active" is a per-capability property — they are not the same.** Base
UI keeps `open` on a node's `context` (capability), not the node, so a popup can be **mounted but closed**
(keep-mounted / animated exit) or a node can be a contextless intermediate. Each capability exposes its
own `open`/`active`:

```ts
// 0015-owned capability attached to an RdxFloatingNode.
interface RdxDismissableCapability {
  node: RdxFloatingNode | null; // node-OPTIONAL: may be absent in a contextless/transient state (#8, NavMenu)
  open: () => boolean; // active-ness lives on the capability, not the node
  layer: RdxDismissableLayer;
  branches: Set<Element>;
  policy: RdxDismissableLayerPolicy;
}
```

**The capability is node-optional (verified against Navigation Menu).** Base UI's Navigation Menu runs
`useDismiss` with a **fallback empty floating context**, enabling interactions only when a positioner/value
exists (`NavigationMenuList.tsx`). So the dismissal API must support a **contextless mode**: either the root
registers a floating node **only when a popup exists**, or the capability tolerates `node === null`
temporarily — a primitive must **not** be forced to register a full node in every state (ADR 0017 Phase 0
#12).

**Shared `mounted` / `open` / `preventUnmountOnClose` lifecycle — cross-cutting across all three ADRs
(verified `DialogStore` / `popupStoreUtils`).** Base UI's close event-details carry a
**`preventUnmountOnClose()`** that a consumer calls in the open-change handler to keep the popup **mounted
after close** (not just during an exit animation). This is a **tri-state** — `open`, `closed+mounted`,
`unmounted` — and it changes behavior owned by **all three** ADRs:

- the tree capability's `open` vs the node's mounted-state (this §1);
- how long the focus manager + **marker** stay alive, and **when return-focus fires** (ADR 0017);
- the **internal-backdrop** lifecycle (ADR 0017 §5 — already "mounted but `inert` when `!open`");
- the **scroll-lock predicate** keys off `open`, not mounted (ADR 0016).

**It is a per-close one-shot, NOT a persistent `keepMounted` boolean (#3, verified).** Base UI attaches
`preventUnmountOnClose` to the **specific close event's details**: `attachPreventUnmountOnClose(eventDetails)`
seeds a local `let preventUnmountOnClose = false` that the callback flips to `true` **for that close only**
(`popupStoreUtils.ts:147–151`, `DialogStore.ts:86`). A later reopen clears it, and the **next** ordinary
close starts with no hold and may unmount normally. So it must **not** be modeled as a standing
`preventUnmountOnClose: signal<boolean>` on the portal (that would pin the popup mounted forever after the
first prevented close — a mounted-popup leak). The contract is **close-transaction semantics**: a close
request creates event details → the handler may hold **only that** close → reopen resets the hold → the
next close begins un-held. Phase 0 pins how this maps onto `RdxPortalPresence`.

**Decision:** model this in the **shared lifecycle contract** as `mounted()` + `open()` on the capability
(every consumer reads `open()` for behavior, `mounted()` for presence). Whether Radix exposes a public
`preventUnmountOnClose()` or maps it onto `RdxPortalPresence` (keep-mounted) is a Phase-0 decision; if the
public API is **not** ported, that is an **explicit deviation** requiring a test proving the equivalent
Angular Presence behavior. The mounted-but-closed contract is **per-effect** (matching the verified Base UI
lifecycle, ADR 0017 §6a — _not_ "everything off"): **no dismissal** (capability inactive on `open=false`),
**marker / `aria-hidden` released**, **backdrop `inert`**, **scroll unlocked** — but the **focus trap and
return-focus persist until unmount** (Base UI's `FloatingFocusManager` is `disabled={!mounted}`, so the
trap survives the exit; ADR 0017 §3/§6a). It must not be left implicit — it changes observable timing in
three ADRs.

**Hover-open (`openReason === triggerHover`) is a shared policy input with DIFFERENT per-ADR effects —
NOT a single `enabled=false` (cross-ADR invariant, verified against `PopoverPositioner`/`PopoverPopup`).**
Base UI keeps a hover-opened Popover/Menu **dismissable** while turning off the modal machinery. So the
hover reason is one input fanned out to **opposite** effects, and no ADR may collapse it into a blanket
disable:

- **dismissal stays ACTIVE** (ADR 0015) — `useDismiss` is unaffected by hover;
- **focus manager / marker / `aria-hidden` are OFF** (ADR 0017 — `disabled={!mounted || openReason === triggerHover}`, `PopoverPopup.tsx:135`);
- **internal backdrop is NOT rendered** (ADR 0017 §5 — `modal === true && openReason !== triggerHover`, `PopoverPositioner.tsx:157`);
- **scroll lock is OFF** (ADR 0016 — `openReason !== triggerHover`).

Each ADR consumes the same `openReason`/hover input but applies its own effect; treating it as `enabled=false`
everywhere would wrongly kill dismissal on hover popovers.

**Dismissal capability goes inactive _immediately_ on `open=false` — not at unmount.** A mounted-but-closed
popup stays registered as a neutral floating node, but its **dismissal capability becomes inactive the
moment `open()` is `false`**: during an animated exit it must **not** handle Escape or outside-press, and
must **not** block ancestor dismissal. Acceptance is **not** satisfied by "we stop on destroy" — the
document listeners must be effectively off while still mounted. Chromium test (Phase 5): open a parent +
portaled child; close the child with a long exit animation; **before** unmount press Escape / click
outside; the **parent** must handle it, **not** the closing child.

**Traversal contract (shared, verified against Base UI `getNodeChildren`).** Child/ancestor queries take a
filter but **must not abort recursion at a closed node**: a closed intermediate node is excluded from the
_result_ yet the walk **still descends into its children** (so a keep-mounted/closed parent never hides an
open grandchild). Mirroring Base UI's `getNodeChildren(nodes, id, onlyOpenChildren)`:

```ts
// filters the *result* by open-capability; recursion continues regardless.
children(node, { onlyOpen?: boolean }): RdxFloatingNode[];
ancestors(node): RdxFloatingNode[];
deepestOpen(node): RdxFloatingNode | null; // topmost-within-tree = deepest open descendant (§1)
```

**Focus-return uses `onlyOpen: false` — it must include closed-but-mounted descendants (#4, verified).**
The `onlyOpen` filter is **not** one global default. Dismissal "topmost"/children queries use
`onlyOpen: true`, but the focus manager's **focus-inside-tree** check on unmount/close walks
`getNodeChildren(tree, nodeId, false)` (`FloatingFocusManager.tsx:842`) — `onlyOpen=false`, so focus living
inside a **mounted-but-closed** descendant still counts as "inside the floating tree" and can govern whether
return-focus runs. The shared traversal must therefore expose **both** filters and the ADR 0017 focus-return
path must request `onlyOpen: false`, **never** reuse the dismissal default `children({ onlyOpen: true })`.

`node.parent` is resolved from an injected nearest-floating context, not from DOM position. Portaled
children therefore remain children of their logical owner.

Angular DI follows the logical component/injector tree rather than the final DOM location. When
`RdxPortal` or `RdxPortalPresence` relocates a layer's host nodes into `document.body`, the embedded
view keeps the injector ancestry of its declaration site, so the nearest-layer context still resolves
to the logical owner. This provides the ownership relation that DOM order and construction order cannot
reliably provide — it is the Angular analogue of Base UI's `FloatingTree` (`id` / `parentId`).

**Two separate concerns — tree selection vs. parent assignment.** Base UI splits these and so must we.
Tree selection (which store the node joins) is the genuine `externalTree` analogue and never sets the
parent. Parent assignment is separate: in Base UI `parentId` always comes from the nearest
`FloatingNodeContext` and there is no public override — so an explicit-parent override is an **Angular
extension** for detached injector-subtree composition (a nested popup from a sibling subtree, a
virtual-element context menu, a programmatically attached layer).

**Three-state parent override (semantics pinned).** A nullable optional field is ambiguous in Angular
(an `input`/`signal` collapses `undefined` and `null`), so the override is a **discriminated** value, and
the resolved `node.parent` is derived from it:

```ts
type RdxFloatingParentOverride =
  | { kind: 'inherit' } // default: resolve from nearest DI floating context
  | { kind: 'root' } // independent root: ignore DI ancestry, node.parent = null
  | { kind: 'node'; parent: RdxFloatingNode }; // explicit parent
```

- `inherit` (the default when no override is supplied) → nearest DI parent;
- `node` → use the given node;
- `root` → independent root, **`node.parent = null`**, DI ancestry ignored.

The point is that "no override" (`inherit`) and "explicit independent root" (`root`) are **distinct** —
they must not both reduce to `parent == null`.

This override applies to **floating nodes only**. A detached _trigger_ is a different mechanism: it has
no node and no parent — it registers as an inside-element with the layer it controls through the scoped
registrar of §2, so pressing or focusing it does not dismiss its popup. Do not register a trigger as a
node parent; the two paths must stay distinct in the implementation.

**Tree/document invariants (dev-mode diagnostics).** Detached-composition mistakes must surface as
**early diagnostics**, not as wrong dismissal/focus ownership later. The registration API must reject (or
`rdxDevError`):

- a `parent` that belongs to a **different `tree`**;
- a `parent` in a **different `ownerDocument`**;
- an **ancestry cycle** (the new parent chain reaching back to the node);
- registering one node in **more than one tree** at a time.

**Owner-`Document` relocation rule (single normative decision).** Moving a portal's nodes **within the
same `Document`** is allowed (that is the normal portal case, and DI ancestry is unaffected).
**Cross-`Document` relocation is forbidden** — there is no supported unregister/re-register escape hatch.
A container change whose target lives in a different `Document` is **rejected by dev diagnostics _before_
the nodes are moved** (the move does not happen), consistent with the cross-document `parent` invariant
above. (A primitive that genuinely needs a second document must create a separate floating node/tree there,
not relocate an existing open one.)

**Boundary — the positioner is not automatically a floating node.** A `RdxPopperContentWrapper` /
positioner is a **geometry** concern (ADR 0012). It may be a **portal root** (a portal's `ownRoots` in ADR
0017 §3), but that does **not** make it the floating node or the owner of dismissal: the **floating node is
the popup / focus-managed surface**. Positioners must not register a dismissal capability by virtue of being
a portal root. These are **distinct roles** — portal own root, positioner, floating popup, dismissable node,
and focus-manager popup sometimes coincide (e.g. `Select`'s portal root **is** the popup) but must never be
derived one from another (the full five-role list lives in ADR 0017 §6a).

**Popper lifecycle during animated exit (decided, verified against source).** Positioning is **not** tied to
`open` — it keeps running while the popup is **mounted**, including the close/exit animation. Base UI does
the same: for kept-mounted popups `useAnchorPositioning` passes `open: mounted` and runs `autoUpdate` while
`mounted` (`useAnchorPositioning.ts:441,507`), so resize/scroll tracking and `flip`/`shift` continue during
exit. Our `RdxPopperContentWrapper.autoUpdate` already lives for the directive's whole lifetime — that is
**parity, kept as-is**: no `active` input and no freeze-on-`open=false`. If a future primitive needs a frozen
exit, that becomes a separate Popper capability, not a dismissal concern.

**The portal registry is DOM-inside-checks only — it does not define ancestry.** The scoped portal registry
(ADR 0017 §6a) exists so a parent can read its descendant portals' DOM roots for keep-sets / outside-press
containment. It does **not** establish logical floating ancestry: `RdxFloatingNode.parent` (DI-derived)
remains the **sole** source of dismissal ownership, independent of where nodes are appended in the DOM.

`RdxFloatingNode.parent` (logical ancestry) drives all dismissal ownership. Within a logical
tree, "topmost" is the deepest active descendant, resolved from the tree (ancestry + blocking-child) —
never from DOM or construction order.

**Independent roots are not coordinated by the engine — strict Base UI parity.** Base UI's `useDismiss`
does not coordinate independent floating trees against each other: each open independent root handles
its own Escape and outside-press. We deliberately match that and add **no** document-scoped activation
order across unrelated roots. The engine resolves "topmost" only **within** a tree; ordering between
independent roots is the concern of the owning primitive or the application, not the dismissal engine.

This is an intentional change from the current `RdxDismissableLayer`, whose shared `layersRoot` makes
Escape close only the last-registered layer across **all** roots. Dropping that shared order means: with
two _independent_ open roots, each responds to Escape on its own. Nested/owned popups are unaffected —
their ancestry still closes one level at a time. A primitive (or app) that wants "only the topmost
overlay closes" across independent roots must coordinate that itself (e.g. a shared open-stack at the
primitive layer), exactly as Base UI leaves it to the consumer.

The engine must answer these questions without querying all `[data-dismissable-layer]` elements:

- Is this layer the topmost active layer **within its tree**? (logical ancestry, not cross-root order)
- Does this layer have an active blocking descendant?
- Is an event inside this layer, one of its branches, its trigger, or an active descendant?
- Should Escape or outside press propagate to an ancestor?

`data-dismissable-layer` remains available as a debugging/styling attribute, but it is not an ownership
mechanism.

**Shared infrastructure — fix four pillars at once.** In Base UI the **same** neutral `FloatingTree` /
`FloatingNode` underpins `useDismiss`, `FloatingFocusManager`, hover, list-navigation, and menu
coordination. To avoid ADR 0017 (and later hover/list-navigation) building a **second, incompatible**
tree, the shared `core`/floating package must define **all four** of these from the start — not just a
node store:

1. **Neutral nodes** — `RdxFloatingTree` / `RdxFloatingNode` (no dismissal name, no baked-in
   `layer: RdxDismissableLayer`).
2. **Typed capabilities** bound to a node — dismissal (`RdxDismissableCapability`, this ADR), focus (ADR
   0017), and future hover/list-navigation each attach their own; each owns its `open`/`active`.
3. **A shared trigger registry** on the tree/root (Base UI `context.triggerElements`, §2) — read by
   **both** dismissal and the focus manager, so they never keep divergent inside-element lists.
4. **Typed event channels** — Base UI's `FloatingTreeStore.events` (hover-close, virtual focus, menu
   open/close coordination, list navigation). Pin a neutral typed emitter on the tree now, rather than
   bolting one on later (which would change the fundamental tree API).

0015 owns the dismissal capability + the trigger registry's dismissal reads; 0017 reads the same nodes,
trigger registry, traversal, and events for focus/ancestor queries. The node/tree type and registration
API are designed for all consumers from the start.

### 2. Keep branches, but scope them to their owning layer

`rdxDismissableLayerBranch` remains the public Angular mechanism for detached elements that are
logically inside a layer.

Branches will register against the nearest owning layer instead of one global branch array. Consumers
that register branches programmatically must do so through a layer-scoped registration API.

Active popup triggers continue to count as logically inside, formalizing the behavior currently
implemented by manually pushing Menu and Navigation Menu triggers into the global branch array. A press
or focus on an associated trigger must not dismiss its popup before the trigger interaction runs.

**Triggers live in one shared registry, not a per-ADR list.** Base UI keeps `triggerElements` (a
`PopupTriggerMap`) on the floating **root context** and, at outside-press **and** focus-out, accepts a
target if `triggerElements.hasElement(target)` **or** `hasMatchingElement(t => contains(t, target))` —
i.e. it supports **multiple and detached triggers**, matching by ancestor. Our trigger registry is
therefore a **shared capability on the floating node/root** (pillar 3 of "Shared infrastructure"), with
`hasElement` / `hasMatchingElement`, read by **both** this ADR (dismissal containment) and ADR 0017 (the
focus manager's inside-element checks). It is **not** a private branch list duplicated per ADR — that
would let 0015 and 0017 drift into different inside-element sets. A trigger still has no layer node and no
parent (it is inside-content, §1); only its membership store is shared.

### 3. Match Base UI dismissal ownership and propagation

The engine owns Escape and outside press. Focus-out leaves the engine: for primitives with a focus
manager it is owned by ADR 0017, for the three without one it stays a per-primitive concern (see below) —
matching Base UI, where focus-out is never a `useDismiss` concern:

```ts
interface RdxDismissableLayerPolicy {
  escapeKey: boolean;
  outsidePress: boolean;
  escapeKeyBubbles: boolean;
  outsidePressBubbles: boolean;
}
```

Focus-out behavior moves out of `RdxDismissableLayer` during this migration. The target per primitive is
**what Base UI does**, not "what Radix does today":

- **Focus-out close is not a `useDismiss` concern in Base UI** — it is
  `FloatingFocusManager.closeOnFocusOut`. 0015 stops driving focus-out from the layer; ownership of the
  replacement **splits by whether the primitive has a focus manager**:
  - **Primitives with a Base UI `FloatingFocusManager`** (Dialog, Popover, Menu, Context Menu, Menubar,
    Select, Combobox, Autocomplete) → focus-out is owned by **ADR 0017** (`RdxFloatingFocusManager`),
    which holds the per-primitive focus-out parity table (conditions + target focus transition; depends
    on `modal`, reference/floating elements, focus guards, typeable-combobox mode, nested-tree position,
    `disablePointerDismissal`).
  - **Primitives with no focus manager** — Tooltip, Preview Card, Navigation Menu (verified: no Base UI
    `FloatingFocusManager`, ADR 0017 §1) → focus-out is **whatever their own `useDismiss` + hover/focus
    interactions do in Base UI — _not_ a generic layer focus-out, and _not_ preserved-as-is.** Base UI
    closes these through their interaction hooks (Tooltip: `useDismiss` + hover/focus; Preview Card:
    `useDismiss` + hover; Navigation Menu: `useDismiss` + its own navigation/focus logic with per-trigger
    `REASONS.focusOut`), **never** through a shared `FloatingFocusManager.closeOnFocusOut`. So this is a
    **normative breaking change, not a preservation task**: the migration must **delete** the Radix
    behaviors that diverge and re-implement each primitive's close to match Base UI exactly. Confirmed
    divergences to **remove**, not keep:
    - **Preview Card** currently closes on **any** `focusOutside` and reports reason `'none'` → replace with
      Base UI's hover-interaction close (no blanket focus-out, correct reason);
    - **Navigation Menu** currently closes via the **shared layer** `focusOutside` → replace with its own
      `useDismiss` + navigation/focus logic emitting `REASONS.focusOut` per trigger/link;
    - **Tooltip** currently **manually prevents** the shared `focusOutside` → that workaround disappears
      with the shared listener; Tooltip closes via its own `useDismiss` + hover/focus.
      A primitive may consume the package-internal `useFocusOutside` utility (§7) **only where Base UI's own
      hook actually installs a focus-out path** — not to reproduce a removed Radix behavior.
- The current Radix behavior is recorded only as the **as-is baseline** to locate breaking changes — it is
  **never** the target. A **per-primitive strict-parity table** (Phase 0) is mandatory for these three:
  each row is _Base UI's actual close mechanism and reason_, and any Radix-only focus-out path absent from
  Base UI is **deleted**. The table wins; the breaking change is documented.
- Existing primitive popup `focusOutside` outputs may remain as compatibility APIs, but are emitted by
  the primitive's focus policy rather than the dismissal engine.
- Standalone `RdxDismissableLayer` no longer provides focus-out dismissal.

**Cancellation semantics of the retained `focusOutside` output.** Today consumers cancel a focus-out
close by calling `preventDefault()` on the emitted `FocusEvent` — but `focusin` is **non-cancelable**,
so that call is already a silent no-op and `defaultPrevented` never flips. When focus policy moves into
the primitive we must not preserve that broken contract by accident. Each owning primitive picks one,
explicitly:

- **Notification-only (default):** the retained `focusOutside` output becomes informational and no
  longer cancels the close. This is the smallest change and matches the de-facto current behavior for
  the non-cancelable path.
- **Cancelable replacement:** if a primitive genuinely needs to veto focus-out close, it exposes a
  primitive-owned event-details object with a working `preventDefault()` (a breaking output-shape
  change for that primitive), not a raw `FocusEvent`.

Whichever is chosen must be documented per primitive; the retained output must not keep _looking_
cancelable while silently ignoring `preventDefault()`.

Defaults preserve intended current public behavior, except where this ADR explicitly fixes observable
bugs:

- Within a tree, Escape dismisses only the topmost blocking layer. Independent roots are not
  coordinated by the engine (§1) — each handles its own Escape.
- Pointer interaction inside a child layer does not dismiss its ancestors. This holds today only for
  modal children (via pointer-events layering); the tree makes it hold for non-modal children too,
  fixing the latent bug captured by the Phase 0 known-bug target.
- Branch interaction counts as inside.

Primitive-specific policy is **owned by the root / interaction context, not the popup/layer (decided,
verified).** In Base UI `useDismiss` is invoked by the **root-level interaction owner**, which is the only
place with enough context: Dialog knows nested-dialog counts / backdrop refs / `isTopmost`
(`useDialogRoot.ts`); Menu knows `parent.type`, the context-menu open event, and `closeParentOnEsc`;
Combobox knows clear/chips/input-group/trigger; Navigation Menu knows its trigger list. The popup/layer has
none of this. So the normative rule is: **the root/interaction context _computes_ the
`RdxOutsidePressPolicy` / `outsidePressGuard` / Escape policy; the dismissal capability only _executes_
it.** Migrating existing popup code must **move this logic up to the root**, not re-assemble business logic
inside the layer (the failure mode this guards against).

**Dialog `disablePointerDismissal` is one public input governing two axes — keep it fused (decided,
verified against `DialogPopup` / `useDialogRoot`).** It is **not** pointer-only despite the name. Base UI
wires the same input to **both** `closeOnFocusOut={!disablePointerDismissal}` (`DialogPopup.tsx:124`) **and**
outside-press (`outsidePress`: `isTopmost && !disablePointerDismissal`, `useDialogRoot.ts:103`); our
`dialog-popup.ts` already gates both. Even with breaking changes allowed, this stays a **single public
behavioral contract** — it must **not** be split into separate pointer/focus flags for "API cleanliness",
since that would change Base UI's user-observable behavior. The §3 parity table records that this one input
governs two axes. Menu **already** ships
`closeParentOnEsc`
(`menu-root.ts`, consumed by `menu-popup.ts`, covered by `menu.spec.ts`): a submenu currently re-emits
Escape to its parent through ad-hoc context wiring. This ADR must **migrate that existing behavior**
onto `escapeKeyBubbles` (set `escapeKeyBubbles = closeParentOnEsc && isSubmenu`), not leave it as a
future policy path. The observable submenu-Escape behavior and its test must be preserved.

**Dialog/Drawer nested ownership is a primitive-level policy on top of generic `hasBlockingChild`
(verified against `useDialogRoot`).** Base UI Dialog does **not** rely only on the engine's blocking-child
walk. It keeps its own `ownNestedOpenDialogs` / `ownNestedOpenDrawers` counts via a shared **dialog
context** (counting Dialog **and** Drawer, `isDrawer ? 1 : 0`), derives `isTopmost = ownNestedOpenDialogs
=== 0`, and uses it for **both** `escapeKey: isTopmost` and outside-press (`isTopmost &&
!disablePointerDismissal`) — so a parent Dialog stops responding to Escape/outside-press while a nested
Dialog is open. The counts are synced on close/unmount and also feed **nested styling state**
(`nestedOpenDialogCount` / `nestedOpenDrawerCount`). This stays a **Dialog/Drawer primitive policy** layered
over the engine's tree blocking-child, not engine logic. Tests are required for: **nested Dialog, nested
Drawer, nested Alert Dialog, and unmount of an open child** (counts must resync).

### 4. Implement Base UI-compatible outside-press detection

Outside-press parity is mandatory (Phase 3), not optional polish. The hardened implementation must:

- ignore non-primary mouse-button presses;
- ignore presses on scrollbars;
- suppress dismissal when a press starts inside and ends outside;
- handle `pointercancel`;
- preserve the delayed-listener guard that prevents the opening event from immediately dismissing a
  newly mounted layer;
- preserve touch click-delay safety;
- treat logical descendants injected after render as inside. The containment check is
  tree/branch/trigger based, so a portaled-after-render overlay that is a registered logical descendant
  must still be treated as inside — the engine must resolve containment from the logical tree, not only
  from `contains()` on the layer element;
- **decide "inside" from the floating tree + trigger/branch registry, _never_ from portal-registry
  membership (verified against `useDismiss`).** Base UI computes outside-press "inside" from the floating
  element + reference, the **floating-tree children** (`getNodeChildren`, `useDismiss.ts:173,345`), the
  **trigger registry** (`:388`), and the **markers** (`:393–413`) — it does **not** consult `PortalContext`
  descendants. ADR 0017's portal registry exists for `markOthers`/guards/`aria-owns` only; a contextless
  portal kept in a parent's keep-set is **outside** for dismissal unless it is a floating descendant or a
  registered trigger/branch/inside-element. Reusing the portal registry as a dismissal-inside source would
  **widen** Base UI behavior and must not happen.

**`outsidePressEvent` — full per-pointer + lazy contract, not one global mode (verified against
`useDismiss`).** A single intentional/sloppy switch is **not** parity. Base UI's type is:

```ts
type RdxPressType = 'intentional' | 'sloppy';
// The per-pointer + lazy STRATEGY (Base UI's `outsidePressEvent` prop). Distinct from the native
// `RdxOutsidePressEvent` DOM-event union defined in §7 — do not conflate the two names.
type RdxOutsidePressStrategy =
  | RdxPressType
  | { mouse: RdxPressType; touch: RdxPressType }
  | (() => RdxPressType | { mouse: RdxPressType; touch: RdxPressType }); // lazy, re-read per press
```

`intentional` fires on `pointerup`/`click` (mouse) and needs minimal `touchmove` (touch); `sloppy` fires
on `pointerdown` (mouse) and `touchend`-within-1s / scroll-away (touch). The value is **resolved lazily
per press** and **per pointer type**. The default is `'sloppy'`. A **per-primitive table** (filled in
Phase 3, verified against each root) pins the value — already confirmed:

| Primitive       | `outsidePressEvent` (verified)                                                                       |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| Dialog          | **dynamic getter** — `'intentional'` when a backdrop (internal/user) exists, else `{ mouse, touch }` |
| Popover         | `{ mouse, touch }`                                                                                   |
| Combobox        | `{ mouse: 'sloppy', touch: 'intentional' }`                                                          |
| Navigation Menu | `'intentional'`                                                                                      |
| _(others)_      | Phase 3 fills from each root                                                                         |

**Per-primitive `outsidePressGuard(event)` policy (not generic containment only).** Beyond tree/branch
containment, Base UI primitives run their **own** `outsidePress(event)` callback: Dialog checks topmost,
`disablePointerDismissal`, its own backdrop, and nested-dialog counts; Combobox excludes the trigger,
clear, chips container, and input group. These are **primitive policy computed by the root/interaction
context** (above), not engine logic and not popup logic. The engine must therefore accept a per-primitive
`outsidePressGuard(event): boolean` **supplied by the root**, and **migrate each primitive's existing guard
conditions up to the root** via a Phase 4 table — otherwise unification silently drops existing/Base UI
guards, or (worse) re-collects them inside the layer where the needed context is absent.

**Outside-press enablement must support runtime suspension, not a static boolean (verified:
`outsidePressEnabledRef` + `DrawerSwipeArea`).** Base UI keeps a **mutable** `outsidePressEnabledRef` that
**Drawer** flips off for the **whole swipe lifecycle** (`= false` on swipe start) and re-enables on the
**next macrotask** after release — because Safari can dispatch an outside-press for the same swipe-open
gesture after the pointer is released. A static `outsidePress: boolean` would force Drawer to mutate
engine internals or re-implement that Safari timing workaround. So the engine exposes a **scoped
suspension handle** plus a **lazy/signal `enabled`** (re-read per press):

```ts
interface RdxOutsidePressPolicy {
  strategy: RdxOutsidePressStrategy; // the per-pointer + lazy contract above (Base UI `outsidePressEvent`)
  enabled: () => boolean; // re-read per press — signal-based
  guard?: (event: RdxOutsidePressEvent) => boolean; // receives the NATIVE event (§7 union), not the strategy
  // Drawer holds this across a swipe; releasing re-enables on the NEXT MACROTASK (Safari workaround).
  suspend(): RdxSuspensionHandle; // handle.release() restores after a macrotask
}
```

**Third-party injected-subtree guard — reads a marker produced by ADR 0017.** Base UI ignores
outside-press on _unregistered_ third-party DOM injected after a popup opens (a cookie banner, a toast
portal from another library) by walking the press target's root ancestor and bailing unless it sits
inside a marked tree (`[data-base-ui-inert]`). Crucially, that marker is **produced by Base UI's
`FloatingFocusManager` / `markOthers`**; `useDismiss` only _reads_ it. We have no producer yet — it is
**ADR 0017** (`RdxFloatingFocusManager`) that produces the marker, **for each popup/mode whose focus
manager is active** (per 0017's policy table — not universally; hover popovers and Tooltip/Preview Card
produce none). This guard is the **read** side and ships once 0017 produces the marker (producer/reader
split, mirroring Base UI). It is **not** in scope here and must not be claimed as parity in 0015. Until
0017 lands, 0015 only guarantees that **registered logical descendants** (popup, branches, trigger, tree
descendants) are treated as
inside.

### 5. Handle Escape composition safely

The Escape listener must track `compositionstart` and `compositionend`. Escape during active IME
composition must not dismiss a layer. Safari's composition-end ordering requires clearing the
composition state in a following task.

### 6. Scope global effects per `Document`

Document listeners and layer roots must be scoped by owner document.

The existing `disableOutsidePointerEvents` body-toggle stays in 0015 **transitionally and is not Base UI
parity** — it blocks **pointer interaction** with the background (Base UI gets that from `markOthers`
isolation + the backdrop, not `body.style.pointerEvents`). Its replacement is **ADR 0017** alone
(interactivity/a11y isolation); scroll lock (ADR 0016) is a separate, unrelated mechanism and **not** a
dependency of this removal. While it remains, its ownership state will be document-scoped via a
`WeakMap<Document, State>` rather than the current module-level string, so iframes/multiple documents do
not interfere:

```ts
interface DocumentPointerEventsState {
  owners: Set<RdxDismissableCapability>;
  originalValue: string;
}
```

The first owner disables body pointer events; the final owner restores the exact original inline value.
Layers in one iframe or document must not affect another.

All browser APIs must remain owner-document-based and platform-safe. On the server, the engine must not
access a missing global `document`, create registry entries, or attach listeners. Existing SSR no-op
behavior must be preserved and covered by `apps/radix-ssr-testing`.

**Prerequisite — `core/useScrollLock` must be document-scoped first.** Document isolation for the
dismissal engine is undermined by a sibling that the engine does not own: modal scroll locking.
`packages/primitives/core/src/dom/use-scroll-lock.ts` keeps `original` and `scrollLockCount` as
**module-level** variables, so two documents/iframes share one lock owner and one saved original — the
exact process-global bug this ADR removes from pointer-events, still present for `overflow`. Modal
Dialog, Menu, Popover, Select, Combobox, and Autocomplete all route through it. `useScrollLock` must be
converted to a `WeakMap<Document, ScrollLockState>` with a browser guard, as a prerequisite of or
alongside this engine — this is a **correctness fix (per-`Document` isolation), explicitly not Base UI
scroll-lock parity.** A full behavioral port (html-vs-body selection, scroll-position save/restore,
scrollbar-gutter compensation, resize handling, WebKit pinch-zoom, reference/owner element) is **ADR
0016**, not 0015. 0015 only requires that document isolation and SSR safety are correct.

### 7. Make the breaking API cleanup in the same migration

The project is currently able to accept breaking changes. We will use the engine migration to remove
contracts that expose implementation details or make correct ownership impossible.

Keep:

- `rdxDismissableLayer`;
- `rdxDismissableLayerBranch`;
- `disableOutsidePointerEvents` — **transitionally**. It is not Base UI parity (Base UI blocks background
  pointer via `markOthers` isolation + backdrop, §6); its removal depends on **ADR 0017 only**, §9.

Remove from the public barrel:

- `RdxDismissableLayersContextToken`;
- `RdxDismissableLayerConfigToken`;
- direct mutation of global `layersRoot`, `layersWithOutsidePointerEventsDisabled`, and `branches`;
- standalone public `RdxFocusOutside`, `RdxPointerDownOutside`, and `RdxEscapeKeyDown` directives.

**Non-layer consumers (Editable).** The new outside-press engine is layer-centric (it keys off the
`RdxDismissableCapability` on a floating node), but Editable has no popup/backdrop/branches and must not
be forced to fabricate a fake layer. Removing the raw helper directives from the public barrel therefore needs a
defined replacement for it. Decision: the outside-press and focus-out detection logic is extracted into
**package-internal** functions (`useOutsidePress` / `useFocusOutside`, injection-context utilities) that
both the layer engine and Editable consume. The directives are removed from the **public** surface;
their detection logic is not deleted, it becomes an internal utility. Editable composes those utilities
directly (no layer node, no `dismissRequest`), keeping its current click-outside / focus-out commit
behavior. The alternative — giving Editable a minimal layer node — is rejected because it would make the
engine model a non-floating control and pull pointer-events/registry semantics it does not want.

Replace the Escape/outside-press directive-level outputs with one cancelable dismissal request carrying
a stable reason. Focus-out leaves the engine and becomes primitive-owned:

```ts
interface RdxDismissRequestBase {
  preventDefault(): void;
  readonly defaultPrevented: boolean;
}

// Outside press is detected across mouse/pointer/touch (intentional + sloppy modes), matching Base UI,
// so the native event is not always a PointerEvent. This is the NATIVE DOM-event union — distinct from
// the §4 `RdxOutsidePressStrategy` (the intentional/sloppy resolution policy).
export type RdxOutsidePressEvent = MouseEvent | PointerEvent | TouchEvent;

export type RdxDismissRequest =
  | (RdxDismissRequestBase & { reason: 'escape-key'; event: KeyboardEvent })
  | (RdxDismissRequestBase & { reason: 'outside-press'; event: RdxOutsidePressEvent });
```

`event` carries the real originating native event. Because intentional/sloppy detection (§4) keys off
`click` / `mousedown` / `pointerdown` / `touchend` / `touchmove` depending on pointer type, typing it as
a bare `PointerEvent` would either drop the source event or force a synthesized fake one;
`RdxOutsidePressEvent` keeps the true event.

The layer emits only the reasons it detects: `escape-key` and `outside-press`. Base UI's `useDismiss`
has a `referencePress` option whose close emits the `trigger-press` reason, but in this codebase
pressing an open trigger to close is already owned by the root/trigger, not the dismissable layer —
Dialog and Popover emit their own `'trigger-press'` open-change reason (`dialog-root.ts`,
`popover-root.ts`). Keeping that out of the union avoids two competing owners for the same gesture; the
trigger still registers as **inside** the layer (§2) so its press never triggers `outside-press`.

If a primitive ever wants the engine itself to own trigger-toggle (to be the single owner of the
gesture), that requires **adding a `'trigger-press'` member to `RdxDismissRequest` at that time** — it
is not representable today and is deliberately not pre-reserved. The matrix row "root owns trigger press
unless delegated" refers to that future, type-extending opt-in, not a capability of the current union.

**Cancellation contract.** `preventDefault()` / `defaultPrevented` belong to the **request object**, not
to the native event. This is a deliberate fix, not just a rename:

- `request.preventDefault()` sets the request's own flag; the engine reads **only**
  `request.defaultPrevented` to decide whether to proceed with dismissal. It never inspects
  `event.defaultPrevented`.
- `request.defaultPrevented` is **not** seeded from the native event. It starts `false` for every
  request regardless of the native event's state.
- The native `event` rides along as data only (target, coordinates, key). The engine does not call
  `event.preventDefault()` on the consumer's behalf, and consumers must stop relying on it.

The request-owned cancellation flag avoids depending on whether a native Escape or pointer event is
cancelable and keeps dismissal cancellation independent from unrelated native-event consumers.

**Propagation is split by reason — not one uniform `allowPropagation()` (verified against `useDismiss`).**
Base UI treats the two reasons differently, and so must we:

- **Escape** — Base UI calls native `event.preventDefault()` **and** `event.stopPropagation()` (the
  latter gated by `escapeKeyBubbles && !isPropagationAllowed`). So an Escape request supports **cancel +
  optional native propagation** (`allowPropagation()` → let the native key event continue to an ancestor).
- **Outside-press** — Base UI only creates cancelable change-details and closes; it does **not** call
  `preventDefault()` / `stopPropagation()` on the native pointer event and does **not** use
  `allowPropagation()`. So an outside-press request **cancels the close only**; the native pointer event
  keeps propagating regardless. Do not expose native-propagation control here.
- **`escapeKeyBubbles` / `outsidePressBubbles`** are a **tree ownership policy** (Base UI's
  `hasBlockingChild`), i.e. "does this reason close ancestors", **not** native DOM propagation. Keep the
  two concepts separate.

```html
<div (dismissRequest)="handleDismiss($event)" rdxDismissableLayer></div>
```

The layer emits one request per dismissal attempt. If it is not prevented, it then emits `dismiss` for
simple consumers. `dismiss` remains as a transitional convenience output and will be removed in the
next breaking dismissal-API ADR after every repository consumer uses `dismissRequest`.

This ADR defines the directive-level contract only. Existing primitives adapt `dismissRequest`
internally while preserving their current public popup/open-change APIs during the engine migration.
A follow-up ADR will decide whether and how all floating primitives expose a unified Base UI-style
`onOpenChange(open, eventDetails)` contract. That consumer-facing redesign must not block the ownership
and event-correctness fixes in this ADR.

The intended two-layer model is:

- `RdxDismissableLayer` emits `dismissRequest` for low-level composition.
- Floating primitives translate that request into their own public open-state contract.

Current `interactOutside` subscribers migrate to the layer's `outside-press` request plus the
primitive-owned focus policy.

Branches and triggers register through an injected, layer-scoped registrar API. That registrar is
internal to the package and is not exported from the public barrel.

### 8. Base UI parity

Verified against Base UI master (`floating-ui-react/hooks/useDismiss.ts`, `menu/root/MenuRoot.tsx`).
The **dismissal** axes align with Base UI, including leaving independent roots uncoordinated. The three
concerns Base UI keeps separate from `useDismiss` — `aria-hidden` isolation + the marker (**ADR 0017**),
and scroll lock (**ADR 0016**) — are **not** dismissal parity and are deferred (see "Out of scope"
below). The remaining differences are platform adaptations.

| Mechanism                                   | Base UI                                                                                                       | This engine                                                                          | Parity                           |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------- |
| Ownership model                             | `FloatingTree` (`id` / `parentId`), DOM order unused                                                          | DI-resolved logical tree (§1), shared with ADR 0017                                  | Aligned                          |
| Tree/store selection                        | `externalTree` selects a `FloatingTreeStore` (does **not** set parent)                                        | `node.tree` selects the tree/store (§1)                                              | Aligned                          |
| Explicit parent assignment                  | none — `parentId` always from nearest `FloatingNodeContext`                                                   | `node.parent` override for detached injector-subtree composition (§1)                | **Angular extension**            |
| Independent roots                           | each open root handles its own Escape/outside-press; no cross-tree coordination                               | same — engine does not coordinate independent roots (§1)                             | Aligned                          |
| Nested propagation / blocking child         | `bubbles: { escapeKey, outsidePress }` + `hasBlockingChild()`                                                 | `escapeKeyBubbles` / `outsidePressBubbles` + block (§3)                              | Aligned                          |
| `closeParentOnEsc`                          | `bubbles.escapeKey = closeParentOnEsc && parent.type === 'menu'`                                              | **existing** Menu input migrated onto `escapeKeyBubbles` (§3)                        | Aligned (migration)              |
| IME composition                             | `compositionstart`/`end` + WebKit 5ms / 0ms reset                                                             | track composition, clear in following task (§5)                                      | Aligned                          |
| Trigger treated as inside                   | capture marker + `triggerElements` registry                                                                   | scoped registrar, trigger registers as inside (§2)                                   | Aligned                          |
| Scrollbar / non-primary / drag-out / cancel | per-pointer guards, `pressStartedInside`, scrollbar offset check                                              | Phase 3 guards (§4)                                                                  | Aligned (phased)                 |
| `outsidePressEvent` (per-pointer + lazy)    | `PressType \| { mouse, touch } \| (() => …)`, resolved per press                                              | full contract + per-primitive table (§4)                                             | Aligned                          |
| Per-primitive outside-press guard           | each root's own `outsidePress(event)` (Dialog backdrop/topmost/nested; Combobox excludes trigger/clear/chips) | per-primitive `outsidePressGuard(event)` + migration table (§4)                      | Aligned                          |
| Reason union                                | `escape-key` / `outside-press` / `trigger-press`                                                              | layer emits Escape/outside; root owns trigger press unless delegated (§7)            | Equivalent ownership             |
| Cancellation API                            | `cancel()` / `isCanceled` on change-details                                                                   | cancelable `dismissRequest` (§7)                                                     | Aligned behavior                 |
| Native propagation control                  | `allowPropagation()` + native `preventDefault`/`stopPropagation` — **Escape only**                            | Escape: cancel + optional native propagation; outside-press: cancel close only (§7)  | Aligned (Escape-only)            |
| Bubbling = tree ownership policy            | `escapeKeyBubbles` / `outsidePressBubbles` via `hasBlockingChild` (not native)                                | `escapeKeyBubbles` / `outsidePressBubbles` ownership policy (§3)                     | Aligned                          |
| Focus-outside dismissal                     | not a `useDismiss` concern (per-primitive / focus manager)                                                    | leaves the engine: ADR 0017 for FFM primitives, per-primitive for the 3 without (§3) | Aligned                          |
| Third-party injected elements               | `[data-base-ui-inert]` produced by `FloatingFocusManager`; `useDismiss` reads it                              | guard reads marker (§4); **producer is ADR 0017**                                    | → ADR 0017 (produce) / read here |
| Modal isolation / aria-hidden               | `markOthers` `aria-hidden` on siblings                                                                        | `disableOutsidePointerEvents` body-toggle, transitional (§6)                         | → ADR 0017                       |
| Scroll lock                                 | html/body, scroll-position, gutter, resize, pinch-zoom, owner element                                         | document-scoped correctness only; full behavioral port deferred (§6)                 | → ADR 0016                       |

For the dismissal axes the remaining differences are platform adaptations: Angular DI and explicit
registration handles replace React context/stores, and Angular output/request naming differs from Base
UI event-details naming. The three `→ ADR 0017 / 0016` rows are genuine behavioral gaps, scoped out
below.

### 9. Out of scope — follow-up ADRs 0017 (focus manager) & 0016 (scroll lock)

Base UI keeps three concerns **separate** from `useDismiss`; conflating them into the dismissal layer is
the largest remaining non-platform deviation. 0015 deliberately does **not** fix them, to stay a coherent
dismissal engine. They split across two follow-up ADRs:

- **ADR 0017 — `RdxFloatingFocusManager`** owns focus lifecycle, focus trap, `close-on-focus-out`, the
  computed per-primitive focus-modality, **`aria-hidden` isolation, and the marker** (`markOthers`
  equivalent). The marker is **produced by 0017** and **read by this ADR's §4 outside-press guard** —
  producer/reader split, exactly as Base UI's `FloatingFocusManager` produces and `useDismiss` reads. So
  the third-party guard ships once 0017 produces the marker, not in 0015.
- **ADR 0016 — Scroll-lock parity** owns the behavioral `useScrollLock` port and the per-primitive
  scroll-lock **activation policy** (`useAnchoredPopupScrollLock`), building on the document-scoped
  `WeakMap` correctness fix this ADR requires (§6, Phase -1).
- **Removing `disableOutsidePointerEvents`** depends on **ADR 0017 only**: it blocks pointer interaction
  with the background, which 0017 replaces (isolation + backdrop). It is **not** scroll lock, so ADR 0016
  is unrelated to its removal.

Until then, 0015 keeps the existing body-toggle and document-scoped scroll lock as documented,
non-parity transitional behavior.

## Implementation Plan

### Phase -1: Document-scope `core/useScrollLock` (prerequisite)

- Convert `packages/primitives/core/src/dom/use-scroll-lock.ts` from module-level `original` /
  `scrollLockCount` to `WeakMap<Document, ScrollLockState>` with a browser guard. **All** mutable state
  (the saved original, the count — and, once ADR 0016 lands the behavioral port, snapshots/timers/frames/
  restore) lives on the per-`Document` state, never at module scope (ADR 0016 §1).
- Verify scroll locking is isolated per document and SSR-safe for **every** `useScrollLock` caller:
  Dialog, Menu, Popover, Select, Combobox, and Autocomplete.
- This may land as its own small change before Phase 1; the dismissal engine's per-`Document` isolation
  is incomplete without it.
- Scope: **per-`Document` correctness only.** Base UI scroll-lock behavioral parity (scroll-position,
  gutter, resize, pinch-zoom, owner element) is ADR 0016 (§6/§9), not this phase.

### Phase 0: Characterization tests

Split the tests by whether they describe behavior that currently passes or a known bug. Do not assert a
single blanket "nested child does not dismiss the parent" — that holds today only for some variants.

**Characterization (must pass against current code, must keep passing):**

- topmost Escape dismissal;
- branch pointer and focus interaction;
- associated trigger interaction does not dismiss its popup;
- nested **modal** child: pointer interaction does not dismiss the parent (protected today by
  pointer-events layering);
- stacked `disableOutsidePointerEvents` restoration.

**Known-bug targets — the suite must stay green, so these are NOT committed as failing tests:**

- portaled child, **focus** moves into it → parent must not dismiss (fails today via DOM-order
  `isLayerExist`, gap #1/#3);
- nested **non-modal** portaled child not registered as a branch, **pointer** inside it → parent must
  not dismiss (the same latent ownership bug for pointer once pointer-events layering does not apply).

CI cannot store red tests, so "expected-fail" is not a committable state for Vitest or Playwright. Pick
one mechanism per case:

- **Preferred — author the test in Phase 2 together with the fix**, so it lands green in the same change
  that corrects propagation. This is the default for both cases above.
- If a case must be written earlier as documentation, commit it as `it.skip` / `test.skip` with an
  inline issue link describing the expected post-fix behavior, and un-skip it in the Phase 2 commit. A
  skipped test is acceptable in CI; a failing one is not.

Do not commit `it.fails` / soft-fail markers as a substitute — the intent is a green suite at every
commit, with the corrected behavior asserted the moment the fix lands.

Nested portal, scrollbar, and real pointer-gesture cases belong in Playwright behavior tests because
jsdom does not provide trustworthy layout or pointer behavior.

### Phase 1: Explicit tree and document registry

- Add the layer-node/context and document-scoped registry.
- Replace DOM-order `isLayerExist`.
- Derive ancestry and within-tree "topmost" from the logical tree. Add **no** cross-root activation
  order — independent roots stay independent (Base UI parity).
- Add the explicit parent-override registration handle for detached composition.
- Scope branches to their owner.
- Replace the global body pointer-events variable with the document registry.
- Preserve owner-document and SSR-safe listener behavior.

### Phase 2: Event policy, propagation, and focus ownership

- Add Escape/outside policy with static defaults and per-event propagation control.
- Block parent dismissal while a non-bubbling child is active.
- Migrate Menu's existing `closeParentOnEsc` (submenu re-emit) onto `escapeKeyBubbles`; keep
  `menu.spec.ts` green and the observable submenu-Escape behavior unchanged.
- Move focus-out detection and closing into each owning primitive; remove focus-out from the shared
  dismissal engine while preserving primitive behavior and compatibility outputs.

### Phase 3: Press and IME hardening

- Add primary-button and scrollbar guards.
- Add press-start-inside, drag-out, and `pointercancel` handling.
- Harden touch scrolling/long-press behavior.
- Implement configurable intentional/sloppy modes.
- Ignore Escape during composition.
- (The third-party injected-subtree guard is **not** in this phase — it reads a marker **produced by ADR
  0017**, §4/§9.)

### Phase 4: Directive API cleanup and internal consumer migration

- Introduce the discriminated `dismissRequest`.
- Remove raw helper directives and implementation-detail tokens from the public barrel.
- Migrate Dialog, Popover, Menu, Select, Combobox, Autocomplete, Preview Card, Tooltip, Navigation
  Menu, Menubar, and Context Menu internally without redesigning their public open-change APIs.
- Extract outside-press / focus-out detection into package-internal `useOutsidePress` / `useFocusOutside`
  utilities (§7), then migrate **Editable** off the removed host directives onto those utilities — no
  layer node, no `dismissRequest`.
- Remove focus-out from `RdxDismissableLayer`. For the three **non-FFM** primitives (Tooltip, Preview
  Card, Navigation Menu) re-wire close-on-focus-out locally via `useFocusOutside` so their current
  behavior is not lost (§3); FFM primitives get focus-out from ADR 0017.
- Preserve any retained primitive-level `focusOutside` compatibility outputs from primitive-owned focus
  policy, and pick each primitive's cancellation semantics per §3 (notification-only or cancelable
  replacement) — do not keep a `FocusEvent` output that silently ignores `preventDefault()`.
- Retain transitional `dismiss` until the follow-up dismissal-API ADR removes it.

### Phase 5: Consumer and browser verification

- Add behavior tests for every floating primitive that depends on the engine, plus Editable (a
  non-floating consumer of the removed helper directives).
- Verify no page errors during open, nested interaction, and close.
- Verify dialogs with backdrops dismiss only from their owning backdrop.
- Verify multiple documents/iframes do not share pointer-events ownership.
- **Inactive-during-exit:** open a parent + portaled child; close the child with a long exit animation;
  before unmount press Escape / click outside — the **parent** handles it, **not** the closing child (the
  child's dismissal capability is inactive while mounted-but-closed, §1).
- Verify SSR rendering of every affected primitive remains free of browser-global access.

## Consequences

### Positive

- Portal placement no longer changes dismissal ownership.
- Nested layers close in a predictable order.
- Focus moving into a child popup no longer dismisses its parent.
- Pointer and Escape behavior moves closer to Base UI across all floating primitives.
- Pointer-events restoration becomes correct for iframes and test documents.
- Shared behavior is fixed once instead of patched independently across all listed consumers.

### Negative

- The dismissal layer becomes a stateful infrastructure engine rather than three small document
  listeners.
- Explicit layer-node parent ownership must survive portals and detached layers; detached triggers must
  stay scoped inside-elements, not layer parents (§1, §2).
- Gesture behavior requires browser-level tests and is harder to verify in jsdom.
- This is an intentional breaking change for standalone dismissable-layer users and primitive popup
  composition APIs, but not a redesign of every primitive's public open-change contract.
- Strict Base UI parity removes engine-level coordination between independent roots: two unrelated open
  overlays now each handle Escape/outside-press on their own, a behavior change from today's shared
  `layersRoot`. Cross-root coordination, if wanted, moves to the primitive/app layer.
- Consumers that mutate `RdxDismissableLayersContextToken.branches` directly must migrate to
  `rdxDismissableLayerBranch` or an owning primitive's trigger registration.
- `interactOutside` subscribers must switch to the layer's outside-press request plus primitive-owned
  focus policy.

### Risks

- Incorrect parent registration — or a missing explicit override for detached composition — could
  prevent legitimate ancestor dismissal or break the tree.
- Strict parity drops the current shared cross-root order: with two _independent_ open roots, each now
  dismisses on its own Escape instead of only the last-registered one. Any primitive/app that relied on
  the old "only the topmost layer closes" across unrelated roots must coordinate it itself.
- Splitting isolation/marker (ADR 0017) and scroll-lock parity (ADR 0016) out means 0015 ships with a
  known, documented Base UI gap (body-toggle instead of `markOthers`, no third-party guard,
  correctness-only scroll lock). 0017 + 0016 must actually follow, or that gap becomes permanent; track
  it as committed work, not an aspiration.
- Changing outside-press timing can create visible behavior changes for consumers.
- Body pointer-events, scroll lock, and dismissal ownership must remain consistent during animated
  unmounts and must restore correctly per `Document`.
- A feature-for-feature Base UI port would add unnecessary React/Floating UI coupling; implementation
  reviews must enforce the Angular-native boundary.

## Alternatives Considered

### Keep the current implementation and patch individual consumers

Rejected. Registration-order layering, DOM-order focus ownership, and process-global pointer-events
state are shared infrastructure problems. Consumer-specific guards would be incomplete and would
drift.

### Port Base UI `useDismiss` and Floating Tree directly

Rejected. The implementation is tightly coupled to React events, refs, stores, and hooks. Behavioral
parity is the goal; source parity is not.

### Adopt Angular CDK Overlay dismissal

Rejected. ADR 0005 established the owned floating stack, and the project has removed Angular CDK as a
runtime dependency. Reintroducing it would move anatomy and behavior away from the Base UI-aligned
primitive model.

### Use only DOM containment and `composedPath()`

Rejected as the ownership model. These are useful event-inside checks, but they cannot represent a
portaled child's logical parent or configurable propagation through nested floating elements.

## Acceptance Criteria

This ADR can move to Accepted when:

1. Logical ancestry and within-tree "topmost" never depend on `[data-dismissable-layer]` DOM order or
   directive construction order. The engine adds no cross-root activation order — independent roots each
   handle their own Escape/outside-press, matching Base UI.
2. A layer node can declare an explicit logical parent, so a detached/cross-injector-subtree popup
   resolves to the correct owner; detached triggers resolve as scoped inside-elements (§2), not layer
   parents.
3. The shared floating infrastructure (§1) ships all **four** pillars from the start — neutral nodes,
   typed per-capability state (with `open`/`active` on the capability, not the node), a **shared trigger
   registry** (`hasElement`/`hasMatchingElement`), and **typed event channels** — read by both this ADR
   and ADR 0017. Tree traversal **filters** by open-capability but **does not abort recursion** at a
   closed node (a closed parent never hides an open descendant). Tree/document invariants are enforced as
   dev diagnostics (§1).
4. Parent layers remain open while interacting with active child layers or scoped branches.
5. Escape closes the correct layer and does not dismiss during IME composition.
6. Outside press implements the **full `RdxOutsidePressStrategy` contract** (`PressType | { mouse, touch } |
lazy fn`, resolved per-pointer per-press), with the per-primitive `outsidePressEvent` table and a
   per-primitive `outsidePressGuard(event)` policy (the guard receives the native `RdxOutsidePressEvent`);
   ignores non-primary buttons, scrollbars, drag-out, and
   canceled gestures; and treats registered logical descendants as inside. Outside-press **enablement is
   runtime-suspendable via a scoped `suspend()` handle** (signal-based) so Drawer can disable it for a
   whole swipe and re-enable on the **next macrotask** (Safari workaround, §4). (The _unregistered_
   third-party-subtree guard is deferred — it reads the marker **produced by ADR 0017**, §4/§9 — not a
   gate here.)
7. Dialog/Drawer nested ownership (`isTopmost` over `ownNestedOpenDialogs`/`ownNestedOpenDrawers`)
   suppresses parent Escape **and** outside-press while a nested Dialog is open, resyncs on close/unmount,
   and feeds nested styling state — verified in Chromium with nested Dialog, nested Drawer, nested Alert
   Dialog, and unmount-of-open-child (§3).
8. The body pointer-events toggle and `core/useScrollLock` are isolated per `Document` for every caller
   (Dialog, Menu, Popover, Select, Combobox, Autocomplete). Their Base UI behavioral parity and the
   removal of `disableOutsidePointerEvents` (→ ADR 0017, independent of scroll-lock ADR 0016) are not a
   gate here.
9. Dialog, Popover, Menu, Select, Combobox, Autocomplete, Preview Card, Tooltip, Navigation Menu,
   Menubar, Context Menu, and Editable behavior tests pass in real Chromium, including Menu submenu
   Escape with `closeParentOnEsc`. Dialog outside-press is pinned to the Base UI algorithm, covering all
   three cases in Chromium (not a generic "press outside the popup" check):
   - modal Dialog **with** a backdrop — dismisses only on a press on its **own** backdrop;
   - modal Dialog **without** a backdrop — dismisses on any valid outside-press target;
   - multiple independent Dialogs with backdrops — another Dialog's backdrop does **not** dismiss this
     one.
10. Standalone `RdxDismissableLayer` performs no focus-out dismissal. Focus-out ownership splits: FFM
    primitives → **ADR 0017** (which owns the parity table — its acceptance gate, not 0015's); the three
    non-FFM primitives (Tooltip, Preview Card, Navigation Menu) **re-wire their own focus-out via
    `useFocusOutside`** so their current behavior is preserved (§3, Phase 4). Every retained `focusOutside`
    output has documented cancellation semantics (§3) instead of a no-op `preventDefault()`.
11. Editable no longer depends on the removed `RdxFocusOutside` / `RdxPointerDownOutside` directives and
    retains its current click-outside / focus-out commit behavior.
12. `RdxDismissableLayersContextToken`, raw helper directives, and global branch mutation are no longer
    public APIs.
13. Every repository consumer translates the directive-level `dismissRequest` internally without
    requiring a simultaneous redesign of its public open-change API.
14. `apps/radix-ssr-testing` proves affected primitives do not access browser globals or attach document
    listeners during server rendering.
15. The shared `mounted` / `open` / `preventUnmountOnClose` lifecycle (§1) is modeled: every consumer
    reads `open()` for behavior and `mounted()` for presence. Either `preventUnmountOnClose` is ported, or
    its omission is an **explicit deviation** with a test proving the equivalent Angular Presence behavior.
    The mounted-but-closed contract is **per-effect** (ADR 0017 §6a): no dismissal, marker / `aria-hidden`
    released, backdrop `inert`, scroll unlocked — **but focus trap and return-focus persist until unmount**
    (not "everything off"; `FloatingFocusManager` is `disabled={!mounted}`).

Consumer-facing open-change parity across all floating primitives is explicitly outside this ADR's
acceptance criteria and belongs to a follow-up ADR.

## Base UI References

- [`useDismiss`](https://github.com/mui/base-ui/blob/master/packages/react/src/floating-ui-react/hooks/useDismiss.ts)
- [`DialogInteractions`](https://github.com/mui/base-ui/blob/master/packages/react/src/dialog/root/useDialogRoot.ts)
- [`MenuRoot`](https://github.com/mui/base-ui/blob/master/packages/react/src/menu/root/MenuRoot.tsx)
