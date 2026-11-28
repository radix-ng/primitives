# Toast — parity matrix

Reference pin: **Base UI 1.9.0**, `cf696d6f6e08c699c5bda24d5a033430909f2285`
([reference manifest](../../../apps/parity-testing/reference.json), [pinned Toast source](https://github.com/mui/base-ui/tree/cf696d6f6e08c699c5bda24d5a033430909f2285/packages/react/src/toast)).

The [public entry](index.ts) exports Provider, Viewport, Root, Content, Title, Description, Close,
Action, Portal, Positioner, Arrow and the Angular DI manager. The manager owns queue state, timers
and completion. Root reads the toast passed by the consumer and reports its measured size and motion
completion. The [state ownership contract](../../../docs/engineering/state-ownership.md) applies to
this delegated state. There is no per-toast open model.

## Compared behavior

| Area                         | Implementation and evidence                                                                                                                                                                                                                                                                                                                                             | Remaining comparison                                                                                                                            |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| G1 — queue and lifetime      | Over-limit toasts stay in the queue with `limited`; the stack promotes them on close and live limit changes. Closure is idempotent, commits before callbacks and ignores updates during exit. Plain updates preserve the timer; promise settlement uses the result timeout or provider default. Angular manager units and a three-engine Storybook overflow regression. | External manager API, functional updates, duplicate IDs during pending promises, and callbacks when replacing a toast during exit.              |
| G2 — focus and announcements | A named polite region supports F6 and Escape with focus restoration, and high-priority messages use the shared assertive announcer. Hover, keyboard focus, swipe and window blur pause timers. Angular axe coverage for the normal toast and three-engine F6/Tab/Shift+Tab/Escape coverage.                                                                             | Focus guards with portals and custom focus targets, overlapping holds and windows, simultaneous announcements, and real screen-reader coverage. |
| G3 — state and motion        | Root exposes `data-starting-style`, `data-ending-style` and inert `data-limited`. Content exposes `data-expanded` and `data-behind`. Root owns finite CSS exit motion. Viewport exposes `--toast-frontmost-height`. Angular units and three-engine motion and reduced-motion regressions.                                                                               | Interruptions and replacement animations across the two implementations.                                                                        |
| G4 — anchors and gestures    | Anchored toasts disable swipe when their model has an anchor. `RdxToastArrow` delegates to Popper and exposes its placement and alignment. Three-engine arrow/drag and live-anchor/clipping regressions.                                                                                                                                                                | Pointer-type and swipe-axis/cancel parity, data-derived Positioner props, and the Action/Close native-host contract.                            |

Angular keeps its DI-based manager, oldest-first queue iteration, and always-mounted attribute
portal ([ADR 0010](../../../docs/adr/0010-structural-portal-presence.md)). `data-swipe-dismiss`
remains an Angular styling hook. The migration from `data-state` and `data-front` is documented
in [Toast Storybook](stories/toast.docs.mdx).

## Evidence and next step

- [Manager and rendering units](__tests__/toast-manager.spec.ts)
- [Storybook behavior](../../../apps/visual-regression/tests/toast.behavior.spec.ts) and
  [anchored consumer](../../../apps/visual-regression/tests/floating-consumers.behavior.spec.ts)

The next increment is a [pinned Toast comparison suite](../../../apps/parity-testing/README.md)
covering the queue, focus and timer transactions from G1 and G2. SSR and hydration have yet to
be verified for Toast.
