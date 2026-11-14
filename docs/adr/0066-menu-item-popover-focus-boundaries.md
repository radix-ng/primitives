# ADR 0066: Open Popover from Menu with live anchors and native focus ownership

- Status: Accepted
- Date: 2026-11-14
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0032, ADR 0064, ADR 0065; `menu`, `popover`, `floating-focus-manager`

## Context

An editor can outlive a closing Menu or stay attached to its still-open item. Popover needs a live
geometry anchor throughout either lifetime. Directly combining a closing item and Popover trigger
can lose focus and dismiss the pin's popup; replacing that behavior with a forced focus/open adapter
would hide the constraint.

Comparisons exposed shared focus defects: every document press suppressed focus-out, a modal
Popover's trigger could become inert, and a non-modal editor kept claiming Escape after native
Menu hover had moved focus back to the parent. The reference also separates its marker and control
keep-sets and gives a first Popover family its own focus boundary.

## Decision

For an independent editor, keep Popover Root outside the closing Menu portal, set open from item
selection and use a surviving element such as the Menu trigger as custom anchor. For trigger
composition, keep Menu and its item available through closeOnClick=false. Detached handles reuse
the existing trigger registry. No new part or public element wrapper is required.

Reuse the focus manager's native press tracking, scoped to trigger/content/outside. Only a trigger's
transient blur is protected until the next task or pointer end/cancel. An outside press remains
eligible for focus-out before click. Keep cleanup in DestroyRef.

Use separate keep-sets for neutral markers and native inert isolation. Include declared previous/
next focus targets only in isolation, matching the reference's control pass. markOthers walks their
ancestor chain and still isolates unrelated siblings; a whole application root need not itself be
inert. The marker pass remains unchanged. Native inert is retained instead of replacing it with
React's aria-hidden mechanics.

A virtual Context Menu's captured return target is not a control keep. Its previous-focus control
is null; the existing default-return policy still restores the captured element. This prevents
WebKit's pre-open body focus from exempting the whole page from isolation.

Derive Popover family nesting from Angular's declaration injector. A first Popover family treats
pressed focus in an ancestor as departure, while non-press Menu hover can preserve the editor.
When native focus has returned to an ancestor, a non-trapping Popover yields Escape through the
existing escapeKey/escapeKeyBubbles policies. Nested Popovers keep their family's related-ancestor
policy. This preserves logical floating ancestry for containment and ownership without adding a
React event flag, open counter, another tree or mirrored reactive state.

Retaining a Menu portal preserves the embedded Popover Root and its open state in both frameworks.
The retained hover comparison observes that native lifetime directly. The public nested editor
uses application-owned open state and resets it on Menu close, so its editor closes even when the
Menu view is kept. No generic ancestor-close propagation is added to the primitives.

## Evidence and limits

Twenty-three cases / 69 pinned comparisons exercise keyboard/pointer/submenu and trusted drag-release
activation, persistent geometry, detached handles, CSS/deferred/retained exits, vetoes, modalities,
Tab wrapping, hover Escape and outside-focus reasons. Geometry, raw isolation, original events and
completion arrays are observed directly. Four exact Menu hover fields extend the existing WebKit
zero-delta-pointer-travel category. Popover's earlier outside-close-reason entries are
removed: scoped trigger protection leaves the native outside focus-out path eligible. The native
macOS WebKit canceled-button-focus difference remains exact.

The close-phase unit enters a fresh task after opening so dismissal's existing opening-press guard
has installed; the fast pointerdown/click pair itself remains consecutive.

The pin ignores WebKit's zero movement deltas even when trusted client coordinates move. Hover
snapshots preserve that existing category exactly; parent-focused Escape is compared in Chromium/
Firefox and tested against Angular in all three engines. No synthetic movement metadata or focus
adapter repairs the reference.

Unit checks cover trigger-only transient blur, pointer end/cancel/task cleanup, modal control keeps
and same-family ancestor focus. Open Popover and Nested Popover examples check focus, positioning,
retained/deferred completion and layered Escape in real browsers. Existing floating consumers need
focused unit/browser comparisons because they share the manager.

This is Menu integration evidence. The pin's modal-Menu backdrop instability from ADR 0065 and
real device/assistive-technology work remain explicit gaps; independent primitive audits continue.

## Reference

Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285, prepared from local committed objects.
Checkout HEAD fb9fbbf35e72bd4a5494b678c85d2ea0457fed60 was also inspected.

- packages/react/src/popover/root/PopoverRoot.tsx and popup/PopoverPopup.tsx
- packages/react/src/utils/popups/focus/FloatingFocusManager.tsx
- packages/react/src/utils/popups/popupRoot.tsx (active trigger unregistration)
- packages/react/src/menu/root/MenuRoot.test.tsx (native popup composition)
