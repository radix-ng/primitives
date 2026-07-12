# ADR 0010: Structural `*rdxXxxPortal` (portal + presence merged) — anatomy flattening to Base UI parity

- Status: Accepted
- Date: 2026-06-12 (implemented 2026-06-13)
- Decision owners: Radix NG maintainers
- Related: ADR 0003 (popover Base UI-like anatomy — superseded by this ADR), `packages/primitives/portal/src/portal.ts`,
  `packages/primitives/presence/src/presence.directive.ts`, every `<name>-portal.ts` /
  `<name>-portal-presence.ts` pair under `packages/primitives/*/src/`

> **Implementation status (2026-06-13): all phases shipped** — presence-machine extraction,
> `RdxPortalPresence`, popover pilot, full roll-out (drawer / alert-dialog / recipes), select §6
> restructure. Intentionally left out: menubar's always-rendered `data-[closed]:hidden` pattern (works
> as-is) and the WAAPI presence upgrade (now ADR 0011).

## Context

### The problem: two extra anatomy layers vs Base UI

Base UI (primary reference) mounts a popup with `Portal → Positioner → Popup`: 3 tags in user
markup, 2 DOM elements (Portal renders nothing). Our current anatomy needs **two extra layers**
for the same thing, e.g. popover:

```html
<ng-template rdxPopoverPortalPresence>
  <!-- extra tag #1: conditional mount + exit animation -->
  <div rdxPopoverPortal>
    <!-- extra DOM #2: teleport needs a host element -->
    <div rdxPopoverPositioner>
      <div rdxPopoverPopup>…</div>
    </div>
  </div>
</ng-template>
```

The two layers exist for different reasons:

1. **Presence needs `ng-template`** — an attribute directive cannot conditionally render its own
   host, so mount/unmount-with-exit-animation lives on a structural directive
   (`RdxPresenceDirective`). This is a real Angular constraint — but the template boundary can be
   made invisible via `*` microsyntax.
2. **Portal needs a host element** — `RdxPortal` (attribute directive) relocates _its own host_
   into the container. So every portal is a wrapper `<div>` in `document.body` that consumers never
   asked for. This constraint is self-imposed: a _structural_ portal can create the embedded view
   and move the view's root nodes directly, with **zero** wrapper element.

Select is worse: the portal `div` sits _outside_ the presence template
(`select-portal.ts` / `select-portal-presence.ts`), so an empty `<div>` is parked in `body`
permanently, even while closed.

### Inventory of today's portal/presence pairs

Every popup primitive repeats the same two boilerplate directives (a `div[rdxXxxPortal]`
composing `RdxPortal`, and an `ng-template[rdxXxxPortalPresence]` composing `RdxPresenceDirective`
with `present` from the root context):

| Primitive        | Portal part                                                        | Presence part                                                          | `present` signal           |
| ---------------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------- |
| popover          | `popover-portal.ts`                                                | `popover-portal-presence.ts`                                           | `isOpen`                   |
| dialog           | `dialog-portal.ts`                                                 | `dialog-portal-presence.ts`                                            | (root context open signal) |
| tooltip          | `tooltip-portal.ts`                                                | `tooltip-portal-presence.ts`                                           | `isOpen`                   |
| preview-card     | `preview-card-portal.ts`                                           | `preview-card-portal-presence.ts`                                      | `isOpen`                   |
| select           | `select-portal.ts`                                                 | `select-portal-presence.ts`                                            | `open`                     |
| combobox         | `combobox-portal.ts`                                               | `combobox-portal-presence.ts`                                          | `open`                     |
| autocomplete     | `autocomplete-portal.ts`                                           | `autocomplete-portal-presence.ts`                                      | `open`                     |
| navigation-menu  | `navigation-menu-portal.ts`                                        | `navigation-menu-portal-presence.ts`                                   | `isOpen`                   |
| menu             | `menu-portal.ts` (declared, unused in stories)                     | — (consumers use `@if (root.open())`)                                  | `open`                     |
| toast            | `toast-portal.ts`                                                  | — (viewport is always mounted)                                         | n/a                        |
| **drawer**       | `drawer-portal.ts` → composes `RdxDialogPortal` via hostDirectives | `drawer-portal-presence.ts` → composes `RdxDialogPortalPresence`       | inherited from dialog      |
| **alert-dialog** | `alert-dialog-portal.ts` → composes `RdxDialogPortal`              | `alert-dialog-portal-presence.ts` → composes `RdxDialogPortalPresence` | inherited from dialog      |

Drawer and alert-dialog do not wire their own `present` signal — they re-export dialog's parts
under their own selectors via `hostDirectives`. The recipes `confirmation-dialog.ts` and
`notification-dropdown.ts` (in `packages/primitives/recipes/`) use the old anatomy in their
templates.

The remaining non-portal presence (`tabs-panel-presence`) is inline — no teleport — and is **not**
part of this change. Checkbox indicator presence was replaced by the indicator's `keepMounted` input
during Base UI checkbox alignment. Collapsible panel presence was removed during Base UI collapsible
alignment because the panel now owns its default unmount / `keepMounted` / `hiddenUntilFound`
lifecycle.

Known incidental bugs in select discovered during this analysis (fixed by Phase 5):

- `role="listbox"` is declared twice: `select-popup.ts` host and `select-positioner-content.ts` host.
- `select-positioner.ts` re-exports CSS custom properties under `--radix-tooltip-content-*`
  (copy-paste from tooltip).
- `select-popup.ts` focuses `nativeElement.firstElementChild` — fragile coupling to the inner layer.

## Decision

### 1. New structural primitive: `RdxPortalPresence` (in the `portal` entry)

A structural directive that merges what `RdxPresenceDirective` + `RdxPortal` do today:

- create the embedded view when `present()` flips `true` (synchronously, so enter animations start
  on that frame — same as presence today);
- physically relocate **all** of the view's `rootNodes` into the resolved container
  (default `document.body`) — same container-resolution rules as `RdxPortal`
  (`ElementRef | HTMLElement | string` CSS selector, fall back to body);
- on `present()` → `false`, run the existing presence state machine with **one deliberate
  extension**: watch **all `HTMLElement` root nodes** of the view, not just the first. After the
  next render, read each root's computed `animationName`; suspend the unmount while _any_ root
  runs a fresh exit animation, and destroy the view only when all running exit animations have
  finished (`animationend`/`animationcancel` per root). For a single-root template this degenerates
  exactly to today's behavior. The extension exists for dialog-shaped templates where backdrop and
  popup are sibling roots, each with its own exit keyframes (see §4);
- on destroy, destroy the view (Angular removes the nodes from wherever they live — no anchor
  comment juggling needed, unlike `RdxPortal` which must restore its host element).

SSR: on the server, render the view in place when `present()` is `true` and never relocate
(`isPlatformBrowser` guard — same split that `RdxPortal` and `RdxPresenceDirective` already use).
After hydration the relocation effect moves the nodes to the container. This is the existing
behavior, just merged; `apps/radix-ssr-testing` specs must stay green.

Implementation prerequisite — **extract the presence state machine** from
`RdxPresenceDirective` into an exported helper in the `presence` entry (e.g.
`presence/src/presence-machine.ts`: the `MACHINE` table, animation-listener wiring, and the
`evaluateExit` logic, parameterized by `mountView`/`destroyView`/`getNode` callbacks).
`RdxPresenceDirective` keeps its public behavior byte-for-byte (its existing spec
`presence/__test__/presence.directive.spec.ts` must pass unmodified); `RdxPortalPresence` reuses
the same machine. Entry dependency `portal → presence` is new but acyclic.

`RdxPortalPresence` reads `present` from the existing `RDX_PRESENCE_CONTEXT` token
(`provideRdxPresenceContext`), so per-primitive wiring stays identical to today's presence parts.

Inputs on `RdxPortalPresence`:

- `container: RdxPortalContainer` — same type/semantics as `RdxPortal.container`, plus a
  `setContainer()` method (parity with `RdxPortal`).

### 2. Per primitive: `rdxXxxPortal` becomes the structural part; `rdxXxxPortalPresence` is deleted

Each primitive replaces its pair with a single directive:

```ts
@Directive({
  selector: 'ng-template[rdxSelectPortal]',
  exportAs: 'rdxSelectPortal',
  hostDirectives: [{ directive: RdxPortalPresence, inputs: ['container'] }],
  providers: [provideRdxPresenceContext(() => ({ present: injectSelectRootContext().open }))]
})
export class RdxSelectPortal {}
```

Usage — two equivalent forms:

```html
<!-- common case: * microsyntax, zero extra tags -->
<div *rdxSelectPortal sideOffset="4" align="start" rdxSelectPositioner>
  <div rdxSelectPopup>…</div>
</div>

<!-- explicit form: custom container, or multiple root nodes (dialog) -->
<ng-template rdxSelectPortal [container]="myContainer">
  <div rdxSelectPositioner>…</div>
</ng-template>
```

Microsyntax note: in the `*` form, extra inputs would have to be bound as
`*rdxSelectPortal="container: el"` (which maps to a `rdxSelectPortalContainer`-named input).
Do **not** add per-primitive aliased container inputs in the first iteration — document the
explicit `ng-template` form for the custom-container case instead. (If demand appears, a
per-primitive `rdxXxxPortalContainer` input forwarding to `RdxPortalPresence.setContainer()` can
be added later without breaking anything.)

Target anatomy (select), tag-for-tag at Base UI depth:

```html
<ng-container rdxSelectRoot>
  <button rdxSelectTrigger>
    <span #v="rdxSelectValue" rdxSelectValue placeholder="Pick one…">{{ v.slotText() }}</span>
  </button>

  <div *rdxSelectPortal sideOffset="4" align="start" rdxSelectPositioner>
    <div rdxSelectPopup>
      <div rdxSelectScrollUpButton></div>
      <div rdxSelectList>
        <div rdxSelectGroup>
          <div rdxSelectGroupLabel>Group label</div>
          <div value="apple" rdxSelectItem>
            <span rdxSelectItemIndicator></span>
            <span rdxSelectItemText>Apple</span>
          </div>
        </div>
      </div>
      <div rdxSelectScrollDownButton></div>
    </div>
  </div>
</ng-container>
```

Dialog keeps the explicit form because its template has two root nodes (backdrop + popup, which
become siblings directly in `body` — exactly what Base UI's Portal produces):

```html
<ng-template rdxDialogPortal>
  <div rdxDialogBackdrop></div>
  <div rdxDialogPopup>…</div>
</ng-template>
```

### 3. Loud migration guard

The new selector is `ng-template[rdxXxxPortal]`. Old markup `<div rdxXxxPortal>` would otherwise
_silently_ stop portaling. Ship a guard directive per primitive (or one generic guard registered
with each primitive's selector list):

```ts
@Directive({ selector: '[rdxSelectPortal]:not(ng-template)' })
export class RdxSelectPortalMisuseGuard {
  constructor() {
    if (isDevMode()) {
      throw new Error(
        '[rdxSelectPortal] is now a structural directive. ' +
          'Use `*rdxSelectPortal` on the positioner element or `<ng-template rdxSelectPortal>`. ' +
          'rdxSelectPortalPresence has been removed. See https://radix-ng.com/components/select.md'
      );
    }
  }
}
```

The `rdxXxxPortalPresence` directives are deleted outright — stale imports fail at compile time,
which is loud enough.

### 4. Animation semantics — the exit-animation carrier moves

This is the highest-risk part of the migration and must be handled explicitly per primitive.

**Today.** The presence machine watches the first `HTMLElement` inside the presence template. For
every primitive except select that element is the **portal `div`** — and the project convention
depends on it: `packages/primitives/storybook/styles.ts` documents that "`portalAnimated` goes on
the `rdxDialogPortal` element", and `portalAnimated` constants exist for dialog, drawer, popover,
and navigation-menu. `RdxDialogPortal` even binds `data-state`/`data-open`/`data-closed` on the
portal div so those Tailwind variants can key on it. For select (portal outside presence) the
watched element is the popup.

**After.** The portal element no longer exists. The watched node(s) are the template's root(s):
the positioner in the `*` form, or backdrop + popup for dialog. Consequences, each of which is a
required migration step:

- **Exit keyframes move** from the portal div to the template root(s). `storybook/styles.ts`:
  replace the `portalAnimated` constants with positioner-level (popover, navigation-menu) or
  backdrop/popup-level (dialog, drawer) animation classes, and update every story using them.
- **Data attributes must exist on the new carrier.** Before deleting a portal part, verify the
  part(s) consumers will animate expose the same state attributes the old portal div had
  (`data-state`/`data-open`/`data-closed`). Popover's positioner already binds
  `data-open`/`data-closed`; dialog's backdrop and popup bind their own. Any gap found per
  primitive is fixed in that primitive's migration PR.
- **Dialog/drawer multi-root**: backdrop and popup typically have _different_ exit animations.
  This is why §1 extends the machine to watch all roots — unmount waits for the longest-running
  exit animation among them, matching what the shared portal-div animation provided before.

**Transitions vs keyframes — status quo preserved.** The presence machine suspends unmount only
for CSS **`@keyframes`** (it waits for `animationend`, never `transitionend` — the documented
CLAUDE.md gotcha). The `data-starting-style`/`data-ending-style` transition flow is independent:
it is driven by `useTransitionStatus` (`core/src/composables/use-transition-status.ts`, WAAPI
`getAnimations()`-based) for `onOpenChangeComplete`, and that machinery is untouched here. This
ADR does not change which exit styles keep content mounted.

**Future work (explicitly out of scope, separate follow-up):** upgrade the presence machine to
WAAPI (`element.getAnimations()`, including transitions — the same approach
`use-transition-status.ts` already uses) so transition-based exits also delay unmount, closing the
long-standing gap and matching Base UI's transition-first styling. Keeping it out of this ADR
keeps the anatomy change behavior-compatible and bisectable.

### 5. What this does for every primitive (applicability)

| Primitive             | Migration                                                                     | Notes                                                                                                                                                                                                                                                                                                                                                         |
| --------------------- | ----------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| popover               | mechanical pair→structural swap                                               | **pilot** — simplest, anatomy already Base UI-shaped                                                                                                                                                                                                                                                                                                          |
| tooltip               | mechanical                                                                    | `present: isOpen`; positioning via popper is untouched                                                                                                                                                                                                                                                                                                        |
| preview-card          | mechanical                                                                    | same as popover                                                                                                                                                                                                                                                                                                                                               |
| dialog                | mechanical, explicit `ng-template` form                                       | two root nodes (backdrop + popup) — exercise multi-root support                                                                                                                                                                                                                                                                                               |
| drawer                | free via dialog                                                               | swap the hostDirectives composition: `ng-template[rdxDrawerPortal]` composing the structural `RdxDialogPortal` (TemplateRef injection through hostDirectives on ng-template is already proven by today's `RdxDrawerPortalPresence`); delete `drawer-portal-presence.ts`; exit is driven by the same presence machine (keyframes, not transitions — unchanged) |
| alert-dialog          | free via dialog                                                               | same hostDirectives swap as drawer; delete `alert-dialog-portal-presence.ts`                                                                                                                                                                                                                                                                                  |
| recipes               | template updates                                                              | `confirmation-dialog.ts`, `notification-dropdown.ts` — migrate in the same PRs as their underlying primitives; `confirmation-dialog` styles the portal div (`[class]="d.portalAnimated"`), see the styled-wrapper caveat below                                                                                                                                |
| select                | swap **+ Phase 5 restructure**                                                | also delete `positionerContent`, invert popup/positioner                                                                                                                                                                                                                                                                                                      |
| combobox              | mechanical                                                                    | popup/list only; input stays in the trigger area, unaffected                                                                                                                                                                                                                                                                                                  |
| autocomplete          | mechanical                                                                    | same machinery as combobox; verify inline (non-portal) mode stories still bypass the portal part entirely                                                                                                                                                                                                                                                     |
| navigation-menu       | mechanical                                                                    | `present` is root `isOpen`; viewport/content internals untouched                                                                                                                                                                                                                                                                                              |
| menu                  | **net-new win**: `*rdxMenuPortal` replaces consumer-owned `@if (root.open())` | today menu has no presence at all → no exit animations with plain `@if`; the structural portal adds both teleport _and_ exit-animation support; `rdxMenuPortal` already exists (unused in stories) — repurpose the name                                                                                                                                       |
| context-menu, menubar | free                                                                          | they compose menu's popup parts; docs/stories update only                                                                                                                                                                                                                                                                                                     |
| toast                 | **out of scope**                                                              | `toast-portal` is an always-mounted viewport region, no presence semantics — keep as attribute portal                                                                                                                                                                                                                                                         |
| tabs presence         | **unchanged** (docs-only improvement)                                         | inline presence, no portal — teleporting it would be wrong (content must stay in flow). Its "extra tag" is already solvable today: any `ng-template[x]` directive supports `*` microsyntax. Checkbox and collapsible presence parts were removed during Base UI parity work.                                                                                  |

**Styled-wrapper caveat.** Some consumers put classes/animations on the portal `div` itself
(in-repo example: recipes `confirmation-dialog.ts` binds `[class]="d.portalAnimated"` on
`rdxAlertDialogPortal`). After the migration there is no portal element to style. Migration
guidance (must go into the changelog and the misuse-guard error message): move those classes onto
the backdrop/popup, or keep a plain consumer-owned `<div>` as the single root inside the
`ng-template` — it relocates as-is and behaves exactly like the old wrapper.

### 6. Select restructure (separate phase, same direction)

Align select's inner layers with popover (and Base UI ordering `Positioner → Popup`):

- Invert the order: `rdxSelectPositioner` (composes `RdxPopperContentWrapper`) becomes the outer
  element; `rdxSelectPopup` the inner.
- Delete `select-positioner-content.ts`; fold its responsibilities into popup:
  `RdxPopperContent` hostDirective (animation guard + `data-side`/`data-align`),
  `[id]="rootContext.contentId"`. Popup keeps its existing `role="listbox"` (removing the
  duplicate), focus-scope, dismissable-layer, collection, highlight model.
- Popup focuses **itself** instead of `firstElementChild`; the `content` signal becomes the host
  element.
- Replace the `@ContentChild(RDX_SELECT_POSITIONER_TOKEN, { descendants: true })` query in
  `select-popup.ts` with a parent DI `inject(RDX_SELECT_POSITIONER_TOKEN)` (the positioner is now
  an ancestor). Keep the token so the item-aligned positioner can satisfy it too.
- Rename the leaked `--radix-tooltip-content-*` custom properties on `select-positioner.ts` to
  select-scoped names (follow popover's `--anchor-width`/`--available-height` style).
- `select-item-aligned-position(.content)?.ts` (the Radix-style `position="item-aligned"` mode)
  must be evaluated against the new ordering in the same PR; if non-trivial, keep that mode's
  internal structure and only adapt the token resolution, and file a follow-up.

## Phases (each lands as its own PR)

1. **Extract presence machine** in `presence` entry. No behavior change;
   `presence.directive.spec.ts` passes unmodified.
2. **`RdxPortalPresence`** in `portal` entry + unit specs (see Testing).
3. **Pilot: popover.** Structural `rdxPopoverPortal`, delete `rdxPopoverPortalPresence`, misuse
   guard, stories + `popover.docs.mdx` anatomy + `pnpm skills:build`.
4. **Roll-out:** tooltip, preview-card, dialog (**+ drawer and alert-dialog wrappers + recipes
   `confirmation-dialog` in the same PR** — they compose dialog's parts), select, combobox,
   autocomplete, navigation-menu, menu (+ context-menu/menubar docs), popover-dependent recipe
   `notification-dropdown` with the popover pilot. Per primitive: directive swap, stories, docs
   MDX anatomy block, skills regen, **animation-carrier migration per §4** (move `portalAnimated`
   classes in `storybook/styles.ts`, verify `data-state` attrs on the new carrier part). Update
   `apps/radix-ssr-testing` pages and `apps/radix-perf-testing` benches that reproduce the old
   anatomy (select bench exists).
5. **Select restructure** (section 6 above) + fix the three incidental bugs.

## Testing

`packages/primitives/portal/__tests__/portal-presence.spec.ts` (zoneless rules apply — no
`fakeAsync`; drive exit animations by dispatching `animationstart`/`animationend` events as the
existing presence spec does):

- mounts into `document.body` by default; into `ElementRef` / `HTMLElement` / selector-string
  containers; selector matching nothing falls back to body.
- no wrapper element is added: the template's root nodes are direct children of the container.
- multiple root nodes all relocate; exit animations are watched on **all** `HTMLElement` roots.
- `present` → false with no exit animation unmounts immediately; with a _different_
  `animationName` suspends until `animationend`; re-opening during the exit keeps the view.
- dialog-shaped exit: two roots where only the **second** (popup) has an exit keyframe — the view
  stays mounted until that animation ends; two roots with different-length exit keyframes — the
  view unmounts only after the longer one ends.
- a root whose computed `animationName` is unchanged between open and closed states does not
  suspend the unmount (the "different animation" heuristic, per root).
- container change while open relocates the live nodes.
- directive destroy while portaled removes the nodes (no orphans in body).
- server platform (`PLATFORM_ID` = 'server'): renders in place, no relocation, no
  `getComputedStyle` calls.

Per migrated primitive: existing specs keep passing with templates updated to the new anatomy; one
added spec asserting `<div rdxXxxPortal>` misuse throws in dev mode.

## Rejected alternatives

- **Hide the positioner inside popup via imperative `Renderer2` wrapper creation** (classic Radix
  React style — their Content renders the wrapper internally). Rejected: Base UI deliberately
  exposes Positioner as a styling hook (z-index, size custom properties), it is our primary
  reference, and imperatively created DOM complicates hydration.
- **Keep the pair, add only docs sugar.** Rejected: the wrapper `div` in body and the visible
  template tag are the actual complaints; sugar doesn't remove them.
- **`keepMounted` option (Base UI parity) instead of presence.** Not a replacement — exit
  animations on unmount still need presence. Worth adding _later_ as an input on
  `RdxPortalPresence` (`keepMounted` → render once, toggle `hidden`), tracked separately.

## Consequences

- Anatomy reaches tag-for-tag parity with Base UI for every popup primitive; the only
  Angular-specific artifact left is the (invisible) `*` microsyntax.
- One fewer permanent DOM node per popup (the portal wrapper div), and select stops parking an
  empty div in body while closed.
- Breaking change for consumers: `rdxXxxPortalPresence` removed, `rdxXxxPortal` changes from
  attribute to structural. Loud failures in both cases (compile error / dev-mode throw) + changelog
  migration table.
- `skills/` bundle, `llms.txt`, all anatomy MDX blocks, SSR-testing pages, and perf benches must be
  regenerated/updated in the same PRs (CI verifies the generated bundle).
- Project docs must be updated in the same PRs: the "Shared composition primitives" section of
  `CLAUDE.md` and `.claude/skills/project-knowledge/references/architecture.md` (both describe
  `portal`/`presence` as the attribute-directive pair), plus
  `apps/radix-storybook/docs/guides/animation.docs.mdx` (its "lifecycle owner" table references
  `RdxPresenceDirective` mounting — add the structural portal case) and
  `apps/radix-storybook/docs/guides/ssr.docs.mdx` (portal no-op on server wording).

## Follow-up clarification (boundaries for ADR 0015/0017)

This ADR is **Implemented** and is not reopened; this is a non-normative clarification so later work does
not bolt dismissal/focus ownership onto the portal. Per the floating-stack split (ADR 0015 dismissal,
ADR 0017 focus manager):

- A structural portal **keeps the declaration-site injector ancestry** — moving the host nodes does not
  change DI, which is exactly what makes the shared floating tree's logical parent survive portaling
  (ADR 0015 §1).
- The portal is a **DOM-relocation primitive only**; it does **not** own dismissal or focus. Do **not**
  add Escape/outside-press or focus-trap logic to `RdxPortal` / `RdxPortalPresence`.
- The focus-integration functions Base UI's `FloatingPortal` performs (inner/outer guards, portal-subtree
  tabbability, `aria-owns`, outer-guard focus-out close) belong to the **portal-focus bridge of ADR 0017
  §6a** — which reads the portal's **multiple** `Element` roots (text/comment nodes ignored), owner
  document, and `mounted`/`open` lifecycle. The portal exposes those; it does not act on them.
- **Cross-`Document` container relocation is not supported** (ADR 0015 §1 invariant) — only same-document
  container moves.
- If strict Base UI parity later includes **Shadow DOM**, the portal's **container contract** must be
  extended separately to accept a `ShadowRoot` container; that is out of this ADR's shipped scope.
