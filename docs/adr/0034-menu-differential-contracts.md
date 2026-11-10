# 0034 — Compare Menu contracts through shared browser infrastructure

Status: Accepted
Date: 2026-11-10

## Context

Angular-only Menu tests did not establish compatibility with Base UI. A dedicated pinned suite
exposed missing ARIA identities, incomplete event reasons/native events, pointer opening that
highlighted an item, canceled Escape moving focus, submenu highlight/callback ordering, and Tab
exiting through stale tabindex or an incorrectly classified content guard.

## Decision

Add an independent Menu suite with matching native buttons and uncontrolled framework state. Reuse
the test/page/report lifecycle with Popover while keeping each driver's actions and DOM contract
local. Preserve the existing reference pin, integrity validation and exact exception policy.

Generate native part IDs and accept authored id inputs. Root derives identities through registered
signal getters, so ARIA links follow bindings without replacing the DOM or copying React registration
state. Capture actual native events for item/checkbox/radio actions. Report `list-navigation` for
arrows and `item-press` for UI selection; keep `none` for programmatic radio selection without an
event. Emit ancestor selection closes before descendant closes. Canceled Escape leaves focus inside.

Classify a native keyboard click before the empty-pointerType fallback: modern browsers send these
as PointerEvents. Pointer opening focuses the popup; keyboard opening focuses an item. Shared portal
tabbability observes Angular DOM after rendering host bindings. Trigger guards resolve the existing
guard-ownership metadata so a content guard is recognized as the same popup's departure. Leading
content-guard departure emits focus-out even when its destination is the owning trigger. Native Tab
then follows the portal path; Menu does not remove the focused node synchronously during keydown.

Menu reuses core's scope-local coordinate pointer guard, already used by Select. Document capture
and item handlers classify the same native event. Changing client coordinates counts as movement
even when WebKit reports zero deltas; stationary scrolling does not steal highlight.

During an exit, Menu Positioner retains its last successful placement while the position resource
refreshes, so Popper's initial-placement animation guard does not cancel the popup's exit animation.
Reopening still waits for fresh placement. The animated story uses shared Tailwind utilities and
starts its exit on `data-closed`, with the popup displayed until the positioner finishes closing.

## Deliberate limits and migration

Do not reproduce the pin's React portal capture marker that suppresses unrelated programmatic
focus-out, its native button tabindex workaround, or its zero-delta pointer bug. Exact observed
differences remain recorded and stale/changed pairs fail. These are limitations, not full parity.

UI event reason values and ancestor/descendant callback ordering change. Applications checking
`none` for UI actions should handle `item-press`/`list-navigation`; programmatic APIs retain their
existing defaults. Popup/trigger IDs and ARIA links are additive. Native click-focus preference is
preserved rather than forcing an artificial tabindex onto every Angular button.

Menu's retained/deferred lifetime is still separate from `usePopupLifecycle`; migrate it in a later
increment with pinned CSS/retained tests. Context Menu/Menubar inherit the shared fixes and receive
browser/unit regressions, but their complete Base UI API/behavior remains a separate audit.
