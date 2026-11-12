# ADR 0048: Resolve Menu keyboard requests across empty collections

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0038, ADR 0041, ADR 0047, `menu`, `floating-focus-manager`

## Context

Empty/refilled Menu lists were covered, but initial keyboard opening, promotion of an empty hovered
submenu and retained submenu return focus were not compared. An empty ArrowDown request left logical
index zero highlighted after data arrived; Angular then advanced from that index despite focus still
being on Popup. Enter did not report promotion from hover. A retained trigger could also remain the
return target after its owning popup closed and hid it.

SubTrigger and Popup each retried initial submenu focus for ten animation frames. That duplicated
ownership and made late data capture depend on when a retry happened to run.

## Decision

Navigation reads actual DOM focus. When an arrow originates from the popup or a non-item container
inside it, it enters the first/last item. An empty forward request still uses the existing `activeIndex`
zero; it does not need a second pending-navigation store. Highlight and DOM focus remain independent.

SubTrigger routes keyboard requests through the existing `Root.show()` path. Enter promotes hover
through the cancelable `trigger-press` transaction. A forward arrow on an already-open empty child
retains logical index zero without moving focus off its trigger. The next explicit arrow can resolve
that index against the now-populated DOM, even if the index itself did not change.

For a newly mounted keyboard-opened submenu, Popup supplies the existing Floating Focus Manager's keyboard-only
initial-focus policy. Its position-ready Angular scope activation pauses a modal ancestor before
entering the child. Item discovery runs in that activation, so later collection updates do not
restart initial focus. Already-open requests resolve directly against the existing popup. Remove
both ten-frame loops rather than copying React layout-effect scheduling or adding a focus-request store.

Return focus follows surviving Menu owners. If a parent has logically closed, its retained submenu
trigger is not the destination; resolve through that parent's return policy. The common focus manager
ignores hidden default references before consulting its composing owner's fallback. Explicit final
focus and deliberate moved focus keep their existing priority and timing.

The public async examples derive Angular `resource()` parameters from the actual Root `open` signal.
Requests and loading state belong to the application. Closing cancels the abortable request; neither
loading feedback nor delayed results invent a Menu item or force primitive focus/open state.

## Reference limitation

Base UI 1.9.0 exposes one remaining failure: hover-open an empty submenu, press its forward arrow,
then populate it after the initial mount window. The child highlights index zero while focus remains
on its trigger. Repeating the same arrow proposes the same index; the nested trigger path does not
call `focusItem()` when that index is unchanged, so keyboard entry remains stuck on the parent.

Angular resolves the explicit native request against DOM items and enters the child. Preserve this
working navigation. Exact `empty-submenu-keyboard-focus` pairs record focus and the resulting parent
highlight at one checkpoint, separately for LTR/RTL and each browser. The reference failure stays
observable before both fixtures finish through a real pointer selection. No focus/state adapter or
event normalization repairs the reference. Changed or disappeared pairs fail and require review.

## Consequences

Empty keyboard opens and delayed data preserve native focus. ArrowDown no longer skips the first
item merely because an earlier empty request retained its index. Enter promotion has the ordinary
cancelable request, and retained nested selection returns to the surviving top-level trigger.

The initial focus handoff uses Angular rendering readiness; later data cannot indefinitely prolong a
failed initial request. Menu, Context Menu and Menubar share these changes. The hidden-reference
check remains in the common focus manager for other floating consumers.

## Acceptance Criteria

Fourteen new cases / 42 comparisons bring Menu to 97 cases / 291 comparisons in Chromium, Firefox
and WebKit. They cover Enter/Space/Up/Down initial opening, pointer opening, empty forward/backward
requests, delayed root/child data, hover promotion, LTR/RTL, retained reopening and close-before-refill.
Native events, actual focus, highlight, selection, requests and completions remain in the comparison.

Unit regressions exercise pending-index entry and a hidden retained default reference. Public async
root/submenu examples have browser checks for keyboard continuation, abort/retry, absence of stale
items, retained close and final focus. Neighboring parity suites guard shared changes.

Touch emulation, additional API/lifecycle combinations and real device/AT audits remain separate work.

## Base UI References

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/utils/popups/interactions/useListNavigation.ts`
- `packages/react/src/menu/root/MenuRoot.tsx`
- `packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx`
- `packages/react/src/menu/popup/MenuPopup.tsx`
- `packages/react/src/utils/popups/focus/FloatingFocusManager.tsx`
