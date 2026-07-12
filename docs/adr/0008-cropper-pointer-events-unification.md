# ADR 0008: Unify Cropper Drag on Pointer Events

- Status: Proposed
- Date: 2026-06-10
- Decision owners: Radix NG maintainers
- Related: `packages/primitives/cropper`, `packages/primitives/core`

## Context

`RdxCropperRootDirective` implements four separate input paths for its pan/zoom gesture:

- **Mouse drag** — a `(mousedown)` host listener that imperatively attaches `mousemove` / `mouseup`
  listeners to `window` and tears them down on release.
- **Touch drag + pinch** — `touchstart` / `touchmove` / `touchend` / `touchcancel` listeners attached
  in an `effect` with `{ passive: false }` so the handlers can call `preventDefault()`. A single touch
  pans; two touches pinch-zoom, with explicit drag↔pinch transition bookkeeping on touch end.
- **Wheel zoom** — a `wheel` listener (`{ passive: false }`) that zooms toward the pointer.
- **Keyboard** — arrow keys pan, `+`/`-`/`PageUp`/`PageDown` zoom (see the keyboard zoom added
  alongside this ADR).

This duplicates the mouse and single-touch drag logic, handles no pen/stylus input, and does not use
pointer capture, so a drag that leaves the element can behave inconsistently.

The repo already owns a shared single-pointer drag lifecycle, `usePointerDrag`
(`packages/primitives/core/src/composables/use-pointer-drag.ts`), used by Toast and Drawer. It owns
pointer capture, the start threshold, window listener wiring, and tap/cancel handling for the
**primary pointer only**. It deliberately does not model multi-touch (a second finger cannot start a
parallel gesture), so it cannot, on its own, express the cropper's two-finger pinch.

Two practical constraints shape this decision:

1. **Multi-touch pinch is out of scope for `usePointerDrag`.** Pinch needs two concurrent pointers and
   a distance/scale computation that the single-primary-pointer lifecycle does not provide.
2. **Touch gestures cannot be verified headlessly.** As established during the Toast swipe
   investigation, Chromium's synthetic touch events (CDP `Input.dispatchTouchEvent` /
   Playwright) bypass the compositor scroll/`touch-action` pipeline — no scroll-steal, no
   `pointercancel` — so a Pointer Events migration's touch behavior can only be validated on a real
   device or by manual testing.

The current touch path works (it calls `preventDefault()` itself and the demo sets `touch-none`), so
this is a code-quality / unification change, **not** a bug fix. That is why it is deferred rather than
done inline with the other Cropper review items.

## Decision

Defer the migration. When revisited, unify the **single-pointer** drag (mouse + single touch + pen)
onto Pointer Events, preferably by reusing `usePointerDrag`, while keeping:

- a **dedicated multi-touch pinch path** (raw `touchstart`/`touchmove` for two pointers, or a small
  two-pointer tracker), since `usePointerDrag` does not model it;
- the existing **wheel** zoom handler;
- the existing **keyboard** pan/zoom handlers.

When migrating, move `touch-action: none` onto the gesture host (the root) in the primitive itself —
mirroring `number-field`'s scrub area and the Toast swipe fix — rather than relying on the demo's
`touch-none` class, so consumers get correct touch behavior without restyling.

Do not change the public input/output API (`onCropChange`, `onZoomChange`, `zoom`, `disabled`, etc.)
as part of this refactor; it is an internal implementation change.

## Consequences

- One drag code path instead of two; pen/stylus support comes for free; pointer capture makes
  drags that leave the element robust.
- Pinch remains a separate, clearly-scoped path — the refactor does not pretend `usePointerDrag`
  covers it.
- Net code reduction in `cropper-root.directive.ts` and one fewer bespoke `window`-listener block.
- Risk concentrated in touch behavior, which CI cannot cover; the change must ship with a manual
  device test checklist (drag, fling, pinch-zoom, drag↔pinch transitions, wheel, keyboard).

## Alternatives Considered

- **Leave as-is.** Lowest risk; keeps the duplicated mouse/touch logic and the missing pen support.
  Acceptable until the cropper needs further gesture work.
- **Full custom Pointer Events implementation (no `usePointerDrag`).** Maximum control, including a
  unified multi-pointer model that also handles pinch. More code to own and test; diverges from the
  shared lifecycle the rest of the library uses.
- **Extend `usePointerDrag` to support multi-touch.** Centralizes pinch for any future consumer, but
  widens a shared, well-scoped primitive for a single current use case; risks regressing Toast/Drawer.
  Revisit only if a second consumer needs multi-touch.

## Migration Plan

1. Replace the `(mousedown)` + window-listener drag and the single-touch branch of the touch handlers
   with one Pointer Events drag (via `usePointerDrag` if it fits the cropper's needs).
2. Keep a minimal two-pointer pinch handler for `touchstart`/`touchmove` (or `pointerdown` pair
   tracking) and the existing wheel/keyboard handlers.
3. Set `touch-action: none` on the root host binding in the primitive; drop the demo's reliance on
   `touch-none` for gesture correctness (the class may remain harmlessly).
4. Manually verify on a real touch device: pan, fling, pinch-zoom, drag↔pinch transitions, wheel
   zoom, keyboard pan/zoom, and `disabled` gating.
5. Keep `cropper-math.ts` unit tests as the regression guard for the geometry; they are
   input-method agnostic and should not change.

## Trigger for Revisit

Pick this up when any of the following happens:

- The cropper needs new gesture behavior (e.g. rotation, double-tap-to-zoom, momentum) that would
  otherwise be added to the already-duplicated paths.
- Pen/stylus support becomes a requirement.
- A second primitive needs multi-touch, justifying a shared multi-pointer lifecycle.
- The duplicated mouse/touch drag logic causes a real bug.
