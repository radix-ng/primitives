# ADR 0058: Preserve explicit nullable Menu finalFocus policies

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0054, ADR 0057, `menu`, `focus-scope`, `floating-focus-manager`

## Context

Base UI distinguishes a finalFocus callback returning null from one returning undefined. Null
selects the default target while preserving the callback's explicit precedence over moved focus;
undefined suppresses return focus. Angular already distinguished suppression but treated null as a
guarded automatic return. An outside click therefore left focus on the background field instead of
honoring the callback's request to return to the trigger.

Removed targets require a separate distinction. A retained HTMLElement reference, including one
returned by a callback, remains explicit after removal and its native focus call has no effect. A
callback reading a live query/ref can return null and select the surviving owner instead.

## Decision

The shared Floating Focus Manager resolves a consumer callback exactly once. A null/true result
requests the default target explicitly; undefined/false suppresses return focus. An ordinary true
policy retains its guarded automatic behavior. The existing forward-Tab suppression still wins,
and Menu's Shift+Tab navigation continues to return to its owner independently of the unmount policy.

The Focus Scope configuration accepts true as an explicit default request. Its existing queued
return task selects the default target and bypasses the moved-focus guard for that request. This
neutral composition seam preserves ownership and timing without a second callback evaluation,
global interaction store, synchronous Angular render or Menu-specific focus branch. Other consumers
of the shared manager receive the same policy semantics.

## Evidence

Twenty-four differential cases compare root/child callbacks, fresh and retained sessions, Escape,
native forward/backward Tab, non-modal outside presses, targets removed before close or by the
application's close callback, and live queries that become empty. Application shortcuts only change
target data; fixtures do not move focus or repair primitive state. The public Return Focus example
exposes both nullable callback policies and displays the actual callback interaction type.

The reference loses the close interaction type when an outside press closes a child through its
parent: its callback receives an empty string, while Angular retains mouse from the original trusted
PointerEvent. Exact finalFocusCalls pairs record that source-data difference. Focus destinations,
callback counts, Tab stops, close requests and lifecycle completion remain compared unchanged.
This preserves the native event rather than recreating a React interaction bookkeeping artifact.

This increment adds 72 planned comparisons without capability skips. Menu now defines 236 cases /
708 planned comparisons: 660 execute and the existing 48 touch comparisons remain capability skips.
Remaining API/lifecycle combinations, real devices and assistive technology are separate audits.

## Reference

The automated reference remains Base UI 1.9.0 commit cf696d6f6e08c699c5bda24d5a033430909f2285.
The same return-policy logic was checked in local Base UI checkout
fb9fbbf35e72bd4a5494b678c85d2ea0457fed60.

- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx: getReturnElement, explicit return, closeTypeRef
- packages/react/src/menu/popup/MenuPopup.tsx: dynamic return target and explicitReturnFocus
