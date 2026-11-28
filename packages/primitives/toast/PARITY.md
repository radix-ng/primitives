# Toast — parity matrix

Reference pin: **Base UI 1.9.0**, `cf696d6f6e08c699c5bda24d5a033430909f2285`
([reference manifest](../../../apps/parity-testing/reference.json), [pinned Toast source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toast)).

The [public entry](index.ts) exports Provider, Viewport, Root, Content, Title, Description, Close,
Action, Portal, Positioner, Arrow and the Angular DI manager. The manager owns queue state, timers
and completion. Root reads the toast passed by the consumer and reports its measured size and motion
completion. The [state ownership contract](../../../docs/engineering/state-ownership.md) applies to
this delegated state. There is no per-toast open model.

## Compared behavior

| Area                           | Implementation and evidence                                                                                                                                                                                                                                                                                                                                                                                                            | Remaining comparison                                                                                                                            |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — queue and lifetime        | Over-limit toasts stay in the queue with `limited`; the stack promotes them on close and live limit changes. Closure is idempotent, commits before callbacks and ignores updates during exit. Plain updates preserve the timer; promise settlement uses the result timeout or provider default. Pinned scenarios cover overflow, timers, shared IDs, and callbacks during interrupted exits. A completed exit fires its onRemove once. | External manager API, functional updates, and a callback that reenters the manager during close.                                                |
| G2 — focus and announcements   | A named polite region supports F6 and Escape with focus restoration, and high-priority messages use the shared assertive announcer. Hover, keyboard focus, swipe and window blur pause timers. Angular axe coverage for the normal toast, with pinned Portal keyboard and overlapping hover/focus checks.                                                                                                                              | Focus guards with portals and custom focus targets, overlapping holds and windows, simultaneous announcements, and real screen-reader coverage. |
| G3 — state and motion          | Root exposes `data-starting-style`, `data-ending-style` and inert `data-limited`. Content exposes `data-expanded` and `data-behind`. Root owns finite CSS exit motion. Viewport exposes `--toast-frontmost-height`. Angular units and three-engine motion and reduced-motion regressions.                                                                                                                                              | Replacement of a running exit animation on the same element and multi-part motion.                                                              |
| G4 — anchoring and interaction | Anchored toasts disable swipe when their model has an anchor. `RdxToastArrow` delegates to Popper and exposes its placement and alignment. Pinned mouse comparisons cover both locked axes, the 40/41 px boundary, reversal, pointer cancellation and interactive targets. Action and Close comparisons cover native and custom hosts, disabled state, Enter/Space and cancelable Close.                                               | Touch and pen input, custom direction combinations and data-derived Positioner props.                                                           |
| G5 — SSR and hydration         | Angular renders the initial notification at the declaration, then hydrates and moves the original portal, viewport and notification to the body. Restored focus, preserved ARIA relationships, dismissal and fresh IDs on the next toast are checked in a real browser.                                                                                                                                                                | Deferred view and anchored Toast hydration, server-to-client timer policy, and paired React SSR.                                                |

Angular keeps its DI-based manager, oldest-first queue iteration, and always-mounted attribute
portal ([ADR 0010](../../../docs/adr/0010-structural-portal-presence.md)). `data-swipe-dismiss`
remains an Angular styling hook. Angular starts swiping on pointer movement and leaves transforms
to the consumer. [Toast Storybook](stories/toast.docs.mdx) describes the `data-state` and
`data-front` migration.

Angular composes Button semantics on the supplied Action and Close hosts. The template owns Action
copy and its callback. Close accepts `event.preventDefault()` from the template click handler and
remains exposed to assistive technology when the stack is collapsed.

## Evidence and next step

- [Pinned Toast comparisons](../../../apps/parity-testing/primitives/toast/README.md)
- [SSR rendering](../../../apps/radix-ssr-testing/src/ssr-rendering.spec.ts) and
  [eager Toast hydration](../../../apps/radix-ssr-testing/hydration-audit/README.md)
- [Manager and rendering units](__tests__/toast-manager.spec.ts)
- [Storybook behavior](../../../apps/visual-regression/tests/toast.behavior.spec.ts) and
  [anchored consumer](../../../apps/visual-regression/tests/floating-consumers.behavior.spec.ts)

The next comparison increment covers model-driven Positioner props. Check changing an active toast's
anchor, side, alignment and offsets through `manager.update()` and measure placement across engines.
