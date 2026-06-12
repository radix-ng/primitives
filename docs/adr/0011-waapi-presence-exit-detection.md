# ADR 0011: WAAPI-based exit detection for presence — transitions-first styling, subtree-aware

- Status: Proposed (spec for implementation; no code yet)
- Date: 2026-06-13
- Decision owners: Radix NG maintainers
- Related: ADR 0010 (structural portal+presence; flagged this as explicit follow-up in its §4),
  `packages/primitives/presence/src/presence-machine.ts`,
  `packages/primitives/core/src/composables/use-transition-status.ts`,
  `apps/radix-storybook/docs/guides/animation.docs.mdx`

## Context

### Two gaps left by ADR 0010

The `PresenceMachine` (shared by `RdxPresenceDirective` and `RdxPortalPresence`) decides whether to
suspend an unmount by reading the computed `animationName` of the **watched root nodes** and then
waiting for `animationend`/`animationcancel` events. That has two consequences that are now the
biggest styling-DX gap vs Base UI:

1. **Keyframes-only.** CSS _transitions_ never suspend the unmount (`animationName` stays `none`).
   But transitions + `data-starting-style`/`data-ending-style` are Base UI's primary styling idiom,
   and our newer parts already expose those attributes (dialog/select/menu popups bind
   `data-starting-style`/`data-ending-style` via `useTransitionStatus`). Today a consumer who
   styles an exit the Base UI way gets an instant unmount — documented as a gotcha in CLAUDE.md
   ("waits for `animationend`, not `transitionend`") instead of being fixed.
2. **Roots-only.** Only the template's root nodes are watched. The popup usually sits _inside_ the
   positioner root, so popup exit keyframes are invisible to the machine. The ADR 0010 roll-out had
   to work around this with **decoy keyframes**: every demo that animates the popup also puts an
   opacity exit keyframe on the positioner (the watched root) purely so the machine sees a fresh
   `animationName` (`demoPopover.positionerAnimated`, `demoNavigationMenu.positionerAnimated`,
   menu's positioner opacity keyframe; recorded as the "KEY GOTCHA for the rollout").

Meanwhile `useTransitionStatus` (`use-transition-status.ts`) already solves the same problem
correctly for `onOpenChangeComplete`: it uses the Web Animations API —
`element.getAnimations()` + `Promise.all(animations.map((a) => a.finished.catch(...)))` — with a
duration-based safety-net timer (`getMaxTransitionDuration` + 50 ms buffer). So completion timing
in the library is already WAAPI-based in one place and event-based in the other; they can disagree
by a frame and they accept different CSS.

### Goal

A consumer styles an exit on **any element inside the portal template** (positioner or popup),
with **either** `@keyframes` **or** transitions, and the content stays mounted until that exit
finishes — exactly what Base UI's `useAnimationsFinished` gives. The decoy-keyframe convention
disappears.

## Decision

Upgrade `PresenceMachine`'s exit detection and waiting. The machine's public shape
(`PresenceMachineHost`, the `MACHINE` state table, mount semantics) does not change — only
`evaluateExit` and the waiting mechanism do.

### 1. Detection: WAAPI, subtree-aware, freshness-filtered

When `present()` flips `false`, capture a close timestamp (`document.timeline.currentTime`) in the
effect, before the `afterNextRender(() => evaluateExit())` is scheduled. In `evaluateExit`, for
each watched root node:

```ts
const animations = typeof node.getAnimations === 'function' ? node.getAnimations({ subtree: true }) : [];

const exitAnimations = animations.filter(
  (a) =>
    (a.playState === 'running' || a.playState === 'pending') &&
    // Fresh = triggered by the close-state style flip. Pre-existing animations
    // (an infinite spinner inside the popup, a long-running enter that already
    // settled) have an earlier startTime and must NOT delay the unmount.
    (a.startTime === null || a.startTime >= closeTimestamp)
);
```

- `{ subtree: true }` is the key change: popup keyframes/transitions inside the positioner root
  are now seen. This is what deletes the decoy-keyframe convention.
- The `startTime >= closeTimestamp` freshness filter is the WAAPI generalization of the existing
  `prevAnimationName !== currentAnimationName` heuristic: only animations _started by_ the
  data-closed/data-ending-style flip count as exit animations. `startTime === null` means the
  animation is created but not yet started this frame — that is exactly a freshly triggered one.
- An element with `display: none` contributes nothing (`getAnimations` reports nothing running on
  it), preserving the current "hidden → unmount immediately" behavior.
- The existing computed-`animationName` check on root nodes is **kept as an additional acceptor**
  (see §3 — it is what the jsdom unit suite can drive, and it costs nothing).

If `exitAnimations` is empty across all roots → `UNMOUNT` immediately (today's behavior for
no-exit-animation content).

### 2. Waiting: `finished` promises + the existing safety net

Replace the per-node `animationend`/`animationcancel` bookkeeping for the WAAPI-detected set:

```ts
void Promise.all(exitAnimations.map((a) => a.finished.catch(() => undefined))).then(() => this.send('ANIMATION_END'));
```

guarded by a **version counter** incremented on every `MOUNT`/`UNMOUNT` transition (the same
pattern `use-transition-status.ts` uses), so a late resolution after re-opening is ignored — the
state table already ignores `ANIMATION_END` in `mounted`, the version guard just makes it explicit
and prevents a stale promise from racing a _second_ close.

Safety-net timer per evaluation: `max(getMaxTransitionDuration(el))` over the animated elements
plus the same 50 ms buffer, force-sending `ANIMATION_END`. `getMaxTransitionDuration` is already
exported from `@radix-ng/primitives/core`; entry dependency `presence → core` is acyclic. This
covers engines that under-report `getAnimations`, interrupted/replaced animations, and
`prefers-reduced-motion` setups, and it caps the worst case of the freshness filter letting an
unexpected animation through.

The existing `animationstart`/`animationend` **event listeners on root nodes stay** (they keep the
`prevAnimationNames` freshness bookkeeping for the legacy root-keyframe path and keep the jsdom
unit suite meaningful). Either path completing settles the same pending set; `ANIMATION_END` is
sent once.

### 3. Defaults and compatibility

- **Default ON, no option.** This is strictly more permissive than today: everything that kept
  content mounted before (fresh root keyframes) still does; transitions and descendant animations
  _additionally_ do. There is no "keyframes-only" use case worth an opt-out flag.
- Behavior that changes, deliberately: content whose close triggers a running transition anywhere
  in the subtree now unmounts when that transition ends instead of instantly. The main false
  positive is a hover transition kicked off because the pointer leaves an item at close time
  (e.g. `transition-colors` on a menu item, ~150 ms) — the unmount is delayed by that duration,
  visually imperceptible and capped by the safety net. Document this in the animation guide.
- jsdom (`pnpm primitives:test`): `getAnimations` is absent → guard makes the WAAPI set empty;
  the suite continues to drive suspension through synthetic `animationstart`/`animationend` events
  on roots, so **`presence.directive.spec.ts` and `portal-presence.spec.ts` pass unmodified**.
  Real-browser coverage for the new paths lives in Playwright (see Testing).
- SSR: unchanged — `evaluateExit` already runs only in the browser (`host.isBrowser` guard).
- `useTransitionStatus` is untouched. Optional later convergence (shared
  `waitForAnimationsSettled(elements, onSettle)` helper in `core` used by both) is a refactor that
  can ride this ADR's Phase 1 if it falls out naturally, but is not a requirement.

### 4. Demo & docs cleanup — retire the decoy keyframes

Once the machine is subtree-aware, the rollout's decoy convention can be unwound:

- `storybook/styles.ts`: positioner-level `positionerAnimated` opacity keyframes (popover,
  navigation-menu, menu) are no longer required for correctness. Keep them only where they are a
  _visual_ choice; where the popup carries the real exit (menu's `data-ending-style` zoom,
  popover transform keyframes), the positioner decoy is deleted and the popup's own exit is what
  keeps the view mounted. Verify each affected story visually (the exit must look identical, just
  without the parallel positioner fade).
- `animation.docs.mdx` + CLAUDE.md: replace the "waits for `animationend`, not `transitionend`"
  gotcha with the new contract: _exit styles may be keyframes or transitions, on any element
  inside the presence/portal template; unmount waits for all exit animations started by the
  close_. The "lifecycle owner" table's presence row updates accordingly.
- Skills bundle regen (`pnpm skills:build`) after the MDX edits.

## Phases (separate PRs)

1. **Machine upgrade** — §1–§3 in `presence-machine.ts` (+ version guard, safety net). Existing
   jsdom suites pass unmodified; new unit tests only for what jsdom can express (freshness
   bookkeeping, version guard via manually-resolved fake animation objects if practical).
2. **Playwright behavior coverage** — extend `apps/visual-regression` behavior specs:
   - popup-only **transition** exit (no keyframes anywhere) stays mounted until `transitionend`,
     then unmounts (this is the headline capability — fails on main today);
   - popup-only **keyframe** exit with _no_ positioner decoy stays mounted (fails on main);
   - infinite spinner inside an open popup does **not** delay unmount (freshness filter);
   - re-open during a transition exit keeps the view (no flicker/teardown).
3. **Decoy retirement + docs** — §4. Visual baselines guard the demo edits.

## Testing

Beyond the Playwright list above: the zoneless jsdom suites stay as the regression net for the
state machine itself (mount/unmount/suspend/re-open paths, multi-root). Do **not** try to simulate
`getAnimations` in jsdom — browser-truth lives in Playwright per the project testing skill
(animation/visibility behavior is exactly the class jsdom cannot see).

## Rejected alternatives

- **`transitionend` listeners instead of WAAPI.** Per-property events (one per transitioned
  property), no reliable "all transitions done" signal, can be swallowed when elements are
  display-toggled — this is why `use-transition-status.ts` already chose WAAPI. Same choice here.
- **Opt-in input (`exitDetection: 'animations' | 'all'`).** An option would freeze the decoy
  convention into the API surface; the upgrade is strictly-more-permissive, so ship it as the
  behavior.
- **Watching only roots with `getAnimations({ subtree: false })`.** Fixes transitions but keeps
  the decoy-keyframe requirement for popup-level exits — misses the main point.

## Consequences

- Exit styling reaches Base UI parity: transitions or keyframes, on positioner or popup, no decoy.
- One new freshness concept (`startTime >= closeTimestamp`) replaces name-diffing as the general
  rule; name-diffing remains as a root-level acceptor.
- Worst-case unmount latency is bounded by the safety net (`max declared duration + 50 ms`), never
  unbounded, even with misbehaving animations.
- CLAUDE.md / animation guide / skills bundle must ship in the same PR as Phase 3.
