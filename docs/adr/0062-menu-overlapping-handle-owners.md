# ADR 0062: Restore Menu handle ownership across overlapping Roots

- Status: Accepted
- Date: 2026-11-13
- Decision owners: Radix NG maintainers
- Related: ADR 0059, ADR 0061; `menu`, `core`, existing `popover` and `dialog` consumers

## Context

A handle normally belongs to one mounted Root. View transitions can briefly mount its replacement
before removing the previous Root. The single-owner registry discarded the previous registration,
so removing the replacement left a still-mounted menu disconnected from its external triggers.
The pinned Base UI handle keeps an attachment stack and restores its latest surviving owner.

## Decision

Keep Root registrations in attachment order in the shared popup handle registry. The newest
registration owns detached trigger connections and imperative actions. Detaching an inactive owner
does not reconnect anything; detaching the active owner restores the most recent surviving Root.
Each cleanup removes its exact registration and is harmless after its first call. Trigger identity,
payload getters and replacement-safe cleanup remain owned by the existing registry.

Use the current Root context signal to drive Angular consumers. No React store, fallback open state
or subscription layer is introduced. This is transition recovery, not an API for broadcasting to
multiple menus: each Root retains its own state and normal composition uses one Root per handle.
Changing a Root's handle follows the same detach/attach path as destroying and mounting it.

An already-open previous Menu can outlive its trigger registration during the overlap. Resolve the
popup label from the current native trigger first, then the accepted triggerId/defaultTriggerId.
This preserves its name until the trigger reconnects and matches the reference's live-id preference.
It does not retain a native element in another owner or change focus and completion ownership.

## Evidence and scope

Six pinned cases / 18 comparisons exercise both removal orders, handle reassignment, native trigger
replacement under the same id, live payloads, complete owner removal/recreation and restoration of
an open owner. Snapshots include native focus, each Root's popup/ARIA/payload, handle isOpen and the
independent event/completion histories. No new expected differences are introduced.

Core unit coverage checks three-owner restoration, current trigger payloads and repeated cleanup;
Menu integration checks that surviving Roots accept native trigger presses and handle actions.
Existing Menu, Context Menu, Menubar, Popover and Dialog unit checks cover shared-mechanism consumers.
These consumer checks do not establish independent Popover or Dialog parity; those audits and
further Menu overlay composition remain separate work.

## Reference

Pinned Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285, prepared from the local checkout's
committed objects. The checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/utils/popups/popupHandle.ts
- packages/react/src/utils/popups/popupHandle.test.ts
- packages/react/src/menu/root/MenuRoot.tsx
- packages/react/src/internals/resolvePopupLabel.ts
