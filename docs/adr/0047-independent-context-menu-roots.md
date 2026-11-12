# ADR 0047: Separate Context Menu state ownership from floating ancestry

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0015, ADR 0017, ADR 0045, ADR 0046, `context-menu`, `menu`, `focus-scope`

## Context

Base UI clears Menu ownership when a Context Menu Root is nested inside another menu. Angular's
composed `RdxMenuRoot` inherited the enclosing Root through DI, incorrectly inheriting its disabled
state, command owner and parent-close chain. Independent context areas need their own state while
popups still coordinate focus, Escape and native pointer interactions.

## Decision

Context Menu provides an internal, self-scoped Menu boundary. The composed Menu starts a new command
owner; real Menu submenus beneath it continue to inherit that owner. Existing DI and Angular embedded
views own the directives. No wrapper component, duplicate state store or synthetic input is added.

The boundary does not clear floating registration. Base UI clears `MenuRootContext` while retaining
`FloatingNodeContext`; its independent store can refer to a parent node outside that store. Angular
keeps a valid parent in its existing shared floating tree instead of copying cross-store node IDs.
This is a framework adaptation, verified by native behavior rather than identical internal topology.

Shared floating fixes apply to every consumer:

- Internal backdrops register their actual owning context and release that registration on removal.
  The outside-press guard exempts owned elements from the injected-root check. A newly inserted
  foreign backdrop remains foreign, so one outside press closes the inner context menu only.
- Background marking/isolation keeps the popup ancestry of registered descendant portals, including
  closed retained views. An outer modal must not make a future inner popup inert. Backdrops remain
  outside the keep-set; they still intercept native outside presses.
- Context Menu's default initial focus uses the shared first-tabbable policy, falling back to the
  popup. Menu items are not initially highlighted. Touch retains the focus manager's popup policy.
  The shared post-open focus fallback also chooses the popup when no tabbables exist, including an
  interrupted exit whose active focus scope does not mount again.
- Focus Scope remembers a bounded list of weak return targets per owner Document. If a same-gesture
  replacement removes the previous popup, default return focus falls back to a surviving target.
  Explicit final focus, canceled return focus and deliberate moved focus retain their own policies.
  The composing manager supplies pre-open focus when modal isolation has already blurred the page.

## Consequences

Nested Context Menu Roots no longer inherit outer disabling or close an outer command chain on
selection. Escape, cancellation and focus work independently; genuine submenus still close normally.
Removing the outer embedded view still destroys inner Roots through Angular's existing lifetime.

Independent retained portals can mount in a different body order between frameworks. The new cases
record mounted membership by owner instead of treating sibling insertion order as a contract. Native
selection, focus and outside-press checks verify which open popup is actually interactive. Existing
ordered observations for Menu, Menubar and shared-area cases remain unchanged.

## Alternatives Considered

- Reset both Menu and floating ancestry: loses deepest-popup dismissal and retained focus ownership.
- Copy React's cross-store node references: violates Angular tree integrity without adding behavior.
- Keep inherited disabling/selection: makes an independent Root behave like a Menu submenu.
- Change only Context Menu hit testing: leaves the same retained-isolation/backdrop defects in other
  floating consumers.

## Acceptance Criteria

Sixteen new scenarios compare nested areas and Roots inside an open popup in Chromium, Firefox and
WebKit. They cover outer/inner disabling, canceled open/close and retry, Root removal/recreation,
native area switching, selection, outside/Escape dismissal, actual Menu submenus and retained view
reuse. Requests, completions, focus, anchor coordinates and native events remain unmodified.

Context Menu now defines 61 scenarios / 183 planned comparisons: 165 execute on macOS and 166 on
Linux, with the existing 18/17 native capability skips. The 48 new comparisons require no exceptions.
Public retained-Root examples have browser regressions for native pointer selection, Escape, outside
press and reopening. Shared Menu, Menubar, Popover and Select suites guard the common changes.

Real devices/assistive technology and other overlay compositions remain separate audits.

## Base UI References

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/context-menu/root/ContextMenuRoot.tsx`
- `packages/react/src/menu/root/MenuRoot.tsx`
- `packages/react/src/menu/store/MenuStore.ts`
- `packages/react/src/menu/popup/MenuPopup.tsx`
- `packages/react/src/utils/popups/tree/FloatingTree.tsx`
- `packages/react/src/utils/popups/interactions/useDismiss.ts`
- `packages/react/src/utils/popups/focus/FloatingFocusManager.tsx`
