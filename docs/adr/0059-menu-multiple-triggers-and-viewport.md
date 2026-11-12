# ADR 0059: Connect Menu triggers and share popup viewport transitions

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0017, ADR 0035, ADR 0054, ADR 0057, ADR 0058; `menu`, `core`, `popover`, `dialog`, `focus-scope`, `floating-focus-manager`

## Context

Menu registered one trigger, so a later registration replaced its anchor and return identity even
when another button initiated opening. Base UI supports multiple inline or detached triggers,
trigger payloads, default/controlled identity, imperative handles and animated content switching.
Our Viewport only measured its own box and did not supply the Popup's parent-scope CSS variables.
Popover and Dialog already duplicated detached-trigger registration; Popover also retained visual
viewport snapshots. These are concrete shared responsibilities, not reasons to introduce React stores.

## Decision

Root keeps registrations by actual element, tracks the accepted active trigger, and exposes Angular
models for open/triggerId plus defaultTriggerId and a typed payload signal. Registration alone does
not select a payload. Requests identify the initiating button before cancellation; an accepted switch
updates anchor/data/ARIA, resets item highlight and keeps focus on the new trigger. Removing a trigger
retains its last payload. Reactive getters observe application data without copying it on every input
change. A weak element reference preserves identity through a native id rebinding.

`createRdxMenuHandle<Payload>()` connects external triggers with a mounted Root and provides open(id),
close(), and an isOpen signal. An explicit handle is authoritative while unattached; it never falls
back to an unrelated ambient Menu. Shared core registration handles trigger/root replacement and
stale cleanup. Menu, Popover and Dialog use it while preserving their own public actions and policies.
Each handle belongs to one popup owner; deeper overlapping-owner combinations remain an audit.

Menu and Popover share a viewport controller. A consumer supplies one direct content wrapper. The
live Angular view keeps its directives and event handlers; a cloned visual snapshot becomes inert
and aria-hidden, with ids removed. It is excluded from Menu's registered-item/DOM-fallback navigation.
Cleanup follows actual animation completion, transition events and a bounded CSS-duration fallback;
new switches, closing and destruction invalidate previous work. ResizeObserver publishes content
dimensions and Popup's border-box variables. The positioner receives dimensions for stable geometry.
Resize notifications coalesce into a frame-based border-box measurement so publishing ancestor
dimensions does not re-enter ResizeObserver delivery. CSS direction attributes are token lists;
raw attribute spelling remains in differential evidence.

Native button triggers receive tabindex=0 only when the author supplied none. This uses native Safari
click focus to make keyboard continuation work after switching. Coordinators retain roving tabindex.
It requires no imperative click-focus workaround. Fourteen native-button-focus exception pairs became
equal and were removed after review; the remaining hover focus consequence belongs to the existing
zero-delta pointer-travel difference.

Programmatic opening prefers a surviving pre-open focus target and falls back to the connected owner
reference when that target was body/removed. The shared Focus Scope's existing queued return handles
that order. Standalone programmatic Escape does not preempt the queued preference; Menubar retains
its coordinated return policy.

## Evidence

Eighteen new cases / 54 comparisons cover inline/detached pointer and keyboard requests, payload
updates, cancellation, disabled activation, handle actions, controlled/default identity, active-trigger
removal, Root recreation, retained reuse and held CSS transitions. The reference remains unmodified;
fixtures only change application data. Transitions finish through actual WAAPI animations. New
comparisons require no new exceptions. Existing Menu/focus/touch scenarios review Safari changes.

Public Multiple Triggers, Controlled Triggers and Animated Triggers examples use semantic Tailwind
utilities. The animated demo follows Base UI's Library/Playback/Share structure and transitions the
positioner location, Popup size and Viewport content. The prior resize demo now supplies the content
wrapper explicitly. Shared registration/viewport and programmatic focus changes are guarded by
focused Menu-family, Popover, Dialog and focus unit/browser checks.

Menu now defines 254 cases / 762 planned comparisons: 714 executable, with 48 existing touch capability
skips. This increment does not certify the entire public API or real devices/assistive technology.
onItemHighlighted and further controlled/lifecycle/handle-composition combinations remain open.

## Migration

Root.triggerId is now a writable identity model; composing Menu contexts still expose resolved native
identity. Use Angular two-way models for application control, and eventDetails.cancel for user-request
vetoes. Use one direct wrapper inside Viewport for measurement/content transitions. Handle payload
typing flows from createRdxMenuHandle into Root and Trigger; handles should be instance-scoped.

## Reference

The automated pin remains Base UI 1.9.0 cf696d6f6e08c699c5bda24d5a033430909f2285. Local source was
also compared at fb9fbbf35e72bd4a5494b678c85d2ea0457fed60.

- packages/react/src/menu/root/MenuRoot.tsx
- packages/react/src/menu/trigger/MenuTrigger.tsx
- packages/react/src/menu/store/MenuHandle.ts
- packages/react/src/utils/popups/popupHandle.ts
- packages/react/src/utils/popups/viewport/usePopupViewport.tsx
- docs/src/app/(docs)/react/components/menu/demos/detached-triggers-full/tailwind/index.tsx
- https://base-ui.com/react/components/menu#animating-the-menu
