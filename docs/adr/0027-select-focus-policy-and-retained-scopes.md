# ADR 0027: Select focus policy and retained scopes

- Status: Accepted for this increment; the default focus-policy change remains AT-gated
- Date: 2026-11-09
- Related: ADR 0017, ADR 0023 WS5, ADR 0026

## Context

Select currently keeps DOM focus on the popup and exposes virtual navigation through
`aria-activedescendant`. The pinned Base UI implementation focuses items, closes on unrelated focus
out, lets forward Tab leave through the portal guards, and handles Shift+Tab by requesting a
`focus-out` close back to the trigger. These are separate observable contracts from the framework's
rendering model.

ADR 0023 requires a real screen-reader check before changing the default Select focus-out policy.
Browser automation alone cannot establish whether virtual-navigation announcements regress.

The existing Angular focus scope also equates view creation/destruction with focus activation. A
closed `keepMounted` popup can therefore still pause a parent scope, fail to return focus, or receive
mount autofocus before it opens. Menu compensates with a separate deferred return-focus effect.
Select additionally focuses itself on placement, which can undo a deliberate focus move when the
anchor changes position.

## Decision

The shared focus manager drives an optional `enabled` signal in `RdxFocusScopeConfig`. A retained
Angular view can activate and deactivate its scope independently of DOM destruction. Deactivation
queues return focus and releases the document's active-scope stack. Reactivation cancels a stale
return frame, captures the current origin and runs mount autofocus again. Standalone focus scopes
retain their existing default lifetime. Deferred cleanup is registered synchronously with Angular.

Select's manager remains active while open or ending. Menu uses the same gate, including its manual
retention window, and removes its separate keep-mounted return-focus effect. This does not migrate
Menu to `usePopupLifecycle` or change its dismissal policy.

Initial focus, including delayed layout retries, is owned by the shared manager. A retry is canceled
when its activation ends and respects focus that moved to another control. Select placement updates
highlight/geometry only. Native `null` interaction values remain programmatic; an otherwise unknown
close interaction can use the manager's recorded pointer/key intent.

Focus-out handling observes only events originating in the related layer and only while open. A
trigger, declared inside element, descendant popup or owned related guard counts as inside. An
ancestor popup host is related, but an arbitrary control in that ancestor is outside the child.
Guard-to-host ownership is passive DOM metadata in a WeakMap; the existing floating tree still
decides layer relationships. This is not the full portal-ancestry registry from ADR 0023 WS3.
Pointer cancellation clears temporary focus-out suppression.

Portal tabbability also treats an open descendant floating layer as inside. Angular's sibling portal
DOM must not make a parent Popover suspend all of its controls when focus enters a child Select.
The shared `useFocusGuardsTabbability` accepts this containment predicate from the manager.

For non-modal portaled content, default guard destinations use the existing helpers that find
tabbable elements relative to the trigger. Helpers relative to the currently focused guard cannot
preserve the trigger's place in document order.

Select Popup forwards the manager's `closeOnFocusOut` input as an Angular opt-in. Its default remains
`false`. With the input enabled:

- forward Tab uses the shared guards, moves after the trigger and closes with `focus-out`;
- Shift+Tab requests a cancelable `focus-out` close; the manager applies `finalFocus`;
- unrelated programmatic focus movement closes while preserving the new focus target;
- a canceled request leaves the popup open; Tab/highlight movement does not commit a value.

The popup retains virtual navigation in both modes. No React store, ref mirror or synchronous render
flush is introduced. The implementation uses Angular signal configuration, DI composition, the
existing document-scoped stack and native focus events/animation frames.

## Verification and remaining work

Unit coverage exercises inactive retained views, scope reactivation, parent resumption, guard
ownership, unrelated document events, pointer cancellation and programmatic focus-policy arguments.
Browser coverage includes both mount policies, Escape/selection, default and opt-in Tab behavior,
explicit/suppressed final focus, cancellation, anchor movement, and Select inside Dialog/Popover.

The `FocusManagement` story exposes `shell`, `keepMounted`, `closeOnFocusOut`, `finalFocus` and
`cancelClose` for reproduction and manual review. Its child component is instantiated within each
parent layer's DI context; a template declared outside the parent would not establish the same
floating-tree relationship.

**Not yet run: real VoiceOver verification.** Before changing the default or replacing virtual
navigation with item focus, review:

1. With VoiceOver/Safari, open by keyboard and pointer; check the label, selected option and expanded
   state announcements.
2. Navigate by arrows, Home/End and typeahead; check that highlights announce once and disabled items
   announce their disabled state and cannot change the committed value.
3. Enable `closeOnFocusOut`; check Tab, Shift+Tab and VoiceOver cursor movement, including canceled
   closes and repeated opens with `keepMounted`.
4. Repeat inside Dialog and Popover; check one-layer Escape dismissal and return to the parent control.
5. Compare against the pinned Base UI scenario and record browser/OS/AT versions and observations.

The default-policy gap stays open in `select/PARITY.md` and ADR 0023 WS5. This increment does not claim
full focus or assistive-technology parity.

Reference: Base UI commit `cf696d6f6e08c699c5bda24d5a033430909f2285`,
`select/root/SelectRoot.tsx`, `select/item/SelectItem.tsx`, `select/popup/SelectPopup.tsx`,
`utils/popups/interactions/useListNavigation.ts` and `utils/popups/focus/FloatingFocusManager.tsx`.
