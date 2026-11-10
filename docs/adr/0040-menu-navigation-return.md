# 0040 — Menu navigation return and nested cancellation

Status: Accepted

Date: 2026-11-10

## Context

ADR 0039 left vertical return arrows and child cancellation unmeasured. The vertical Menubar ignored
the popup's return arrow, and a canceled child arrow-close kept its logical highlight after focus
returned to the trigger. Base UI 1.9.0 clears that child highlight independently of canceled closing.

## Decision

Extend Menubar to 42 scenarios / 126 comparisons: vertical return arrows in LTR/RTL and canceled
child opening, Escape closing and arrow closing, followed by retry, including a composed trigger. F5 changes only the fixture's
application callback policy. Menu state remains uncontrolled, and browser input remains native.

Use one `RdxMenuRoot.closeForNavigation` operation for submenu Popup and the vertical coordinator.
Consume the original KeyboardEvent before emitting the cancelable `list-navigation` close request,
then focus the surviving return element through the existing DI owner chain. A nested menu clears
its highlight; a directly owned Menubar menu preserves highlight across a synchronous reopen.
Popup classifies submenus through Root ownership rather than a trigger selector; composed
popup/item/submenu-trigger hosts omit their original directive attributes. A canceled child arrow-close
retains open state but still performs that focus/highlight handoff. A canceled Escape retains child focus. No new focus store or pending-navigation flag is needed.

Popup-arrow delegation forwards the same optional KeyboardEvent through parent Roots. A unit checks
event identity and `defaultPrevented` at callback time, native trigger-focus reopening, retained popup
identity/highlight and absence of intermediate close completion. The vertical Storybook check exercises
the public keyboard path and Escape dismissal.

## Menubar interaction mode

Match the pin's observable behavior. The original complete-close policy has been removed: it was a
library choice and had no Angular requirement behind it.

Base UI's `menubar/Menubar.tsx` retains `hasSubmenuOpen` after accepted `sibling-open` and
`list-navigation` closes. Its `menu/trigger/MenuTrigger.tsx` enables open-on-focus in that mode.
The nested close-key handler in `utils/popups/interactions/useListNavigation.ts` returns native focus
to the trigger, producing `close(list-navigation)` followed by `open(trigger-focus)`.

Angular represents this independent interaction mode with one signal on Menubar. It observes accepted
open-change events from directly owned Menu Roots, sets the mode on opening, preserves it through
sibling/navigation closing and clears it on other accepted closes. The flag is not an aggregate of
current open Roots: a canceled sibling close can leave another popup open after interaction mode ends.
Nested child events do not change the bar's mode. Hover switching uses the same mode, including
after an overlapping popup has closed.

A reactive query effect also observes `defaultOpen` and external Angular `open` bindings. A WeakMap
records which per-Root values have already been handled, including synchronous accepted events;
unchanged open siblings cannot re-enable a mode ended by another Root. This is input-change
observation, not a second source of open state. Unit checks cover both input paths.

A native navigation return reopens without moving focus back into the popup. The existing highlight
and mounted view survive, and no intermediate close completion is emitted. Other focus transfers
continue through the existing coordinator and Menu focus policy. Cancellation still gates accepted
state changes. There is no React store, deferred-focus flag or synthetic focus event.

The LTR/RTL cases compare actual state, callbacks, completion and focus without vertical-return
exceptions. The two overlapping-state exceptions have also disappeared. Changed or disappeared
exceptions in other cases still fail review.

The shared popup lifecycle starts enter transitions from its Angular render effect. Logical changes
still invalidate close transactions synchronously, but a close/reopen before render preserves the
existing enter transition or its completed state. It neither repeats the open completion nor loses
an unfinished enter completion. Real rendered closing/reopening retains the normal transition path;
all floating consumers share this rule.

## Browser test timing

The Menu hover-reentry scenario now returns the native mouse directly to the measured trigger
coordinates. Locator actionability frame waits could consume its actual 80ms close window and
turn the intended cancellation into a close/reopen. Record native pointer timestamps and assert
that the delivered return fits that window; retain real timers, raw callbacks and trusted input.

## Remaining scope

Custom horizontal popup orientation, nested pointer/selection cancellation, retained Menubar portals
and real device/assistive-technology verification remain open. Other Menu families compose the same
navigation operation; their independent suites guard existing submenu behavior.
