# 0041 — Menubar navigation return and external open state

Status: Accepted

Date: 2026-11-10

## Context

ADR 0040 matched vertical return arrows, but seven exact exceptions still retained direct backward
switching and single-menu navigation. Neither difference is required by Angular. Default/external
open state had only Angular unit coverage, leaving initial focus and sibling ownership unmeasured.

## Decision

Extend Menubar to 51 scenarios / 153 comparisons against unmodified Base UI 1.9.0. Add single-menu
RTL and eight state cases: default opening in LTR/RTL/vertical, controlled initial opening, external
opening/closing, sibling coordination and canceled open/close requests followed by external updates
and retry. Ordinary cases remain uncontrolled. Controlled cases use actual Angular model bindings
and React open props with application state. F6/F7 toggle application inputs, F8 resets them, and F5
changes cancellation policy. No fixture sets primitive internals or normalizes callbacks/focus.

Horizontal return uses the existing Menu Root navigation-return operation before the owning bar
searches for a destination. The original key remains unconsumed during the close callback when the
parent bar also navigates on that axis; the bar consumes it afterward. Vertical and ordinary nested
returns still consume the key before their close requests. A native trigger focus reopens the source.
With one enabled menu, focus remains on its trigger. A real sibling then opens through native focus
and closes the source with `sibling-open`. Remove all seven backward/single-menu exceptions.

Menu's initial focus policy is popup focus. Native requests still choose first/last item or popup,
including a keyboard request canceled before an external open. This keeps opening provenance in
the existing autofocus signal rather than adding a second keyboard-open flag.

Menubar observes external input changes in `afterRenderEffect`, once their popup views exist, and
uses the same activation/sibling-close operation. The existing WeakMap skips states already handled
by accepted native requests. Navigation returns preserve trigger focus only for `list-navigation`;
other focus-driven openings use normal popup focus.

Shared FocusScope returns focus in a cancelable post-unmount microtask. This matches the pin's
`utils/popups/focus/FloatingFocusManager.tsx` cleanup and runs before another popup's frame-based
autofocus. Waiting for a frame let that autofocus preempt return ownership during an external sibling
open. Remounting the same scope invalidates its pending return task. Explicit final-focus policies
and the moved-focus guard remain authoritative. No synthetic focus, coordinator timeout or React
store is introduced.

An external sibling open can therefore return focus to the closing source trigger and reopen that
source before the destination completes opening. Compare that actual callback/completion chain;
do not force the requested destination into the report. All new cases match without exceptions.

## Verification and scope

The unit regression checks original key identity and `defaultPrevented` at callback time, followed
by source close/reopen/sibling-close ordering. A FocusScope characterization checks return before
the next animation frame. Storybook verifies the backward arrow's real trigger-focus handoff.

Run Menubar and the other pinned suites plus shared floating consumer regressions in three engines.
Changes to focus timing affect Menu, Context Menu, Select, Popover and modal consumers as well.

Nine exact pairs remain: three disabled-trigger Tab-entry pairs and six missing nested-completion
pairs in the pin. Custom popup orientation, nested pointer/selection cancellation, retained Menubar
portals and real device/assistive-technology evidence remain separate audit work.
