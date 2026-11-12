# ADR 0052: Resolve Menu initial focus at disabled boundaries

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0032, ADR 0048, ADR 0051, `menu`, `focus-scope`

## Context

The native-host audit left initial keyboard opening with a disabled first item unverified. Angular
focused that item immediately; the pin chose an enabled item. With no enabled items, Angular still
focused a disabled item while the pin focused Popup. Subsequent arrow navigation intentionally
includes disabled items in both implementations.

Comparing actual Tab stops also exposed two gaps. An open SubTrigger lost its Tab entry when focus
moved into its child. Retained closing restored an old tabindex snapshot after Angular had already
written closed-state bindings; reopening then left an inactive item at tabindex=0 beside the newly
focused item.

## Decision

Add one pure Menu initial-entry selector that finds the first/last enabled item within the current
semantic popup boundary. Popup supplies it to the existing position-ready Floating Focus Manager
activation. Root-trigger keyboard focus recovery uses the same selector. An all-disabled root falls
back to Popup, with no highlighted item. Empty submenu entry retains its existing trigger policy.

Keep normal arrow/Home/End navigation and explicit already-open requests unchanged: disabled items
remain focusable, and their activation is prevented. Do not remove disabled items from the shared
composite or add an initial-focus store/retry loop. SubTrigger remains in the parent's Tab order
while its child is open, independently of parent highlight, matching the pin's explicit mapping.

The common focus bridge separates resource setup from disposal. Setup/snapshotting stays in
Angular afterRenderEffect, when required view queries and authored tabindex are ready. A reactive
effect disposes the active listener/snapshot resource before the owning view applies its next host
bindings. The after-render cleanup remains an idempotent fallback for replacement/destruction.
Initial logical-inside inspection is untracked, so descendant ownership reads do not accidentally
restart the bridge after unrelated host bindings have rendered. Native focus events continue to
read the current logical subtree.

This uses Angular rendering lifetimes and preserves the existing composed-tree DOM helpers. No
React state/event adapter, synthetic focus, MutationObserver loop or new public input is introduced.

## Evidence

Thirteen cases / 39 new comparisons cover Enter/Space/Up/Down and pointer opens, button/div/anchor
hosts, single/all-disabled collections, real edge/arrow requests, whole-chain Escape, retained
reopening and nested disabled-first lists. They compare native focus, highlight, native disabled
attributes and actual Tab stops. End/Home are explicit native requests in both fixtures, not a
reference focus repair. No new expected-difference pairs are needed.

The suite now defines 175 cases / 525 planned comparisons: 477 executable and the existing 48 touch
capability skips. New cases pass in Chromium, Firefox and WebKit on macOS and Linux. A focused
Angular unit demonstrates the stale retained snapshot before the bridge fix and one Tab stop after
reopen. Additional units preserve semantic popup boundaries and disabled arrow candidates. Selected
Select/Popover focus/lifecycle and Menu-family composition checks guard the shared bridge change.

The Initial Focus public example exposes disabled-first/all-disabled and keepMounted controls.
Browser checks verify initial targets, disabled activation, closed/reopened Tab stops and root Tab
departure. These checks certify DOM behavior, not screen reader or device behavior.

## Remaining boundary

Forward Tab from a reopened retained submenu remains a separate gap. Reproduce with the new nested
retained fixture: keyboard-open Root, enter the child, close both with Escape, reopen Root/child,
then Tab from the enabled child item. Angular focuses More and leaves both menus open; the pin
closes the chain with focus-out and focuses the following input. The logical portal outside-guard
handoff needs a separate composition change. Initial-focus comparisons finish nested sessions via
Escape; passing them does not certify that Tab path. No exception or capability skip accepts this
known gap.

Further projection, lifecycle/API and real-device/AT audits remain open.

## Base UI References

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/menu/popup/MenuPopup.tsx`
- `packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx`
- `packages/react/src/menu/item/useMenuItemCommonProps.ts`
- `packages/react/src/utils/popups/focus/FloatingFocusManager.tsx`
- `packages/react/src/utils/popups/interactions/useListNavigation.ts`
