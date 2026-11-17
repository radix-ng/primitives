# ADR 0084: Share a signal-owned render lifetime and explicit animation participants

- Status: Accepted
- Date: 2026-11-17
- Decision owners: Radix NG maintainers
- Related: ADR 0010, ADR 0011, ADR 0026, ADR 0077, ADR 0083, packages/primitives/core/src/composables/use-render-lifecycle.ts, packages/primitives/core/src/dom/wait-for-animations.ts, packages/primitives/presence/src/use-presence.ts

## Context

PresenceMachine combined a Radix-style transition table, Angular view callbacks, root animation-name
heuristics, subtree WAAPI discovery and exit holds. Core's useTransitionStatus independently observed
motion for transition phases and completion. The popup coordinator had to choose between the two
observers for disposable and retained views; structural Tabs also combined them.

The pinned Base UI reference (`cf696d6f6e08c699c5bda24d5a033430909f2285`, version 1.9.0) separates
mounted/status, animation observation and unmount policy in useTransitionStatus, useAnimationsFinished
and useUnmountAfterClose. Its animation waiter observes finite animations on an explicit element and
re-reads replacements when an animation is canceled.

Angular animate.leave delays DOM removal after view destruction begins. Reopening an @if branch
creates new child instances. Our interruptible exit must preserve the live Angular view and its
children, so compiler leave hooks do not replace this lifetime contract.

## Decision

Core's useRenderLifecycle owns mounted and transition status as signals. Owners drive committed open
changes through start; cancel invalidates observation while retaining the view, and unmount ends the
lifetime immediately. Render hooks discover motion after host bindings; DestroyRef cancels work.
An optional owner hold postpones removal after motion, preserving the outgoing Tabs frame.

One waitForAnimations helper observes explicit elements, ignores infinite motion, handles replacement
animations after cancellation and supports AbortSignal. WAAPI's finished promises follow changes to
duration, iterations and playback rate; no wall-clock timeout overrides them. Paused motion has no
wall-clock completion; the owner must finish/cancel it, remove its target or explicitly unmount.
Engines without WAAPI use declared CSS timing as a fallback. There is no parallel
animation-name/event path for a test environment.

Popup Roots share their lifetime with structural Portal. Popup/Backdrop parts register animation
elements. Portal and Presence use the same thin usePresence view adapter; they never start a second
observer for a supplied Root lifetime. The popup coordinator retains accepted-close transactions,
late manual holds, the notification frame and physical view registration, so completion still follows
actual destruction. Logical open continues to govern interactivity, focus policy and scroll locking.

Standalone Presence observes its template roots. RdxPresenceTarget explicitly registers additional
elements, including descendants across child component templates in the declaring injector tree.
Arbitrary subtree animations no longer acquire the parent's lifetime. Multiple participants and roots
share one completion; unrelated nested animations do not prolong an exit.
Adding or removing a participant during an active lifetime invalidates the previous observation and
re-reads the current set after Angular renders. A suspended standalone Portal ends its lifetime
immediately, so resolving its destination later cannot resurrect already closed content.

## Breaking changes and migration

- Remove PresenceMachine and PresenceMachineHost; remove useTransitionStatus and RdxTransitionStatusRef.
- Use useRenderLifecycle and RdxRenderLifecycle for shared lifetime ownership.
- Add rdxPresenceTarget to animated elements that are not registered primitive parts or standalone
  template roots. Popup, Backdrop and Tabs Panel parts register automatically.
- Finite motion already running on a registered target participates; infinite motion never does.
  Animation cancellation waits for replacement motion instead of completing the view immediately.

Keep existing structural portal anatomy, keepMounted, pending container behavior, SSR rendering,
manual unmount and child identity on reopening. This supersedes ADR 0011's observation mechanism;
ADR 0010's structural anatomy and ADR 0026's accepted-close contract remain in force.

## Verification

Unit checks cover live view identity/destruction, owner holds, disposal, explicit targets, multiple
participants, cancellation/replacement and popup transactions. Browser checks discover real CSS
transitions/keyframes, ignore infinite/unregistered motion, interrupt exits and wait for replacement
animations and finite WAAPI timing. Affected popup/Tabs checks, pinned comparisons, library build and
SSR/consumer templates verify the shared integration.

The focused desktop browser configuration is
`pnpm exec playwright test -c apps/visual-regression/playwright.presence.config.ts` (Chromium,
Firefox and WebKit). It follows the standard Storybook server/build workflow.
Presence and Tabs specs also participate in the affected browser planner and CI's shared browser run.
