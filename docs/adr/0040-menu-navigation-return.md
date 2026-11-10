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
then clear the existing highlight signal and focus the surviving return element through the existing
DI owner chain. Popup classifies submenus through Root ownership rather than a trigger selector;
composed popup/item/submenu-trigger hosts omit their original directive attributes. A canceled arrow-close retains open state but still performs that focus/highlight
handoff. A canceled Escape retains child focus. No new focus store or pending-navigation flag is needed.

Popup-arrow delegation forwards the same optional KeyboardEvent through parent Roots. A unit checks
event identity and `defaultPrevented` at callback time, actual close, return focus and reopening.
The vertical Storybook check verifies closing and reopening through the public keyboard path.

## Intentional reference difference

The pin's `utils/popups/interactions/useListNavigation.ts` nested close-key handler requests a close
and focuses the reference. Menubar's trigger-focus handler immediately reopens the same popup, so
its visible/open state remains true. Its coordinator preserves interaction mode for a
`list-navigation` close. Angular completes the close and leaves focus on the trigger,
consistent with its existing direct navigation policy. This is an intentional library contract,
not an Angular restriction or a claim of identical behavior.

Twenty-two exact LTR/RTL pairs retain that visible-state and callback difference. The prior eighteen
reviewed pairs remain. Source measurements, complete snapshots and callbacks are retained without
normalization; changed or disappeared pairs fail. The difference is a library policy choice;
it does not follow from a React or Angular limitation.

## Browser test timing

The Menu hover-reentry scenario now returns the native mouse directly to the measured trigger
coordinates. Locator actionability frame waits could consume its actual 80ms close window and
turn the intended cancellation into a close/reopen. Record native pointer timestamps and assert
that the delivered return fits that window; retain real timers, raw callbacks and trusted input.

## Remaining scope

Custom horizontal popup orientation, nested pointer/selection cancellation, retained Menubar portals
and real device/assistive-technology verification remain open. Other Menu families compose the same
navigation operation; their independent suites guard existing submenu behavior.
