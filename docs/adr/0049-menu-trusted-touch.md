# ADR 0049: Compare Menu through trusted touch input

- Status: Accepted
- Date: 2026-11-12
- Decision owners: Radix NG maintainers
- Related: ADR 0016, ADR 0036, ADR 0048, `menu`, `floating-focus-manager`

## Context

Menu had keyboard, mouse and collection comparisons, but no trusted touch suite. A tap produces
compatibility mouse events: the native `mousedown` that opens a menu has no `pointerType`. Treating
that event as a mouse open selects the wrong focus and anchored-scroll policy. SubTrigger ignored
the compatibility click when hover opening was enabled, so a touch user could not enter a submenu.
Disabled button items could also take pointer focus, unlike the reference's button implementation.

## Decision

Extract the existing pointer-history mechanism from `createRdxTriggerInteraction` as the smaller
`createRdxInteractionTypeTracker`. Keep the same classification for existing consumers. Menu Trigger
and SubTrigger reuse it; Root's existing trigger registration accepts an optional input resolver.
Root consults that resolver only for events originating inside its registered trigger. Events from
items and outside controls use their own native metadata, without inheriting stale trigger input.
Original event objects, event types and trust remain unchanged in public change details.

SubTrigger accepts touch activation on compatibility `mousedown`, matching Base UI. It consumes the
following compatibility click once. A click-only touch activation remains supported. Touch preserves
trigger focus, promotes a hover-opened child through the ordinary cancelable transaction, and a
subsequent tap closes that child. Existing keyboard and mouse ownership remain in their own handlers.
No React event wrapper, mirrored input store or synthetic primitive event is introduced.

Disabled Item, CheckboxItem and RadioItem prevent default pointer-down focus while remaining in the
keyboard composite. Trigger `data-pressed` follows its open session, matching Base UI; it no longer
represents the physical interval between pointer down and up. Consumers needing physical feedback
can style native `:active` separately.

Use `page.touchscreen.tap` for taps and Chromium CDP touch input for cancel/pan. The same CDP helper
now serves Select and Menu; browser click synthesis, scrolling and `pointercancel` remain native.
Checkpoint comparisons include callback event type/trust, open/pressed state, focus, highlight,
values and scrolling. The fixtures retain uncontrolled primitive state. Application fixtures alone
supply scrollable content and viewport-wide geometry.

After panning the page, wait for native `scrollend` before testing the next tap. During momentum
scrolling Chromium consumes a tap to stop the page, even in the reference; retrying that tap would
hide native behavior. This readiness observer does not alter scrolling or dispatch an input event.

## Evidence and limits

Twenty-five new scenarios bring Menu to 122 scenarios / 366 planned comparisons. Nineteen tap
scenarios run in Chromium and WebKit; six cancel/pan scenarios use Chromium CDP. Firefox has no
Playwright touch context and WebKit has no equivalent public gesture protocol: 31 capability skips
leave 335 executable comparisons. Unsupported input is skipped before page creation.

The cases cover open/select/toggle, disabled trigger/items/values, stay-open commands, checkbox/radio,
canceled open/close, modal/non-modal outside taps, LTR/RTL submenu selection and toggling, retained
reopening, canceled gestures, panning and small/wide touch-opened scroll policy. Outside panning
closes on native touch movement, matching the pin. A wheel beside the touch-opened popup probes the
existing small/wide page-scroll policy; it does not stand in for the separately tested pan gesture.

Two additional exact macOS WebKit focus pairs extend the existing `native-button-focus` category
for canceled touch open/close. Angular preserves native button focus preference; the pin supplies an
explicit tabindex. Other fields and Linux focus remain compared. No event/focus normalization or
reference repair is allowed.

Unit tests cover original event identity, touch/mouse reclassification, disabled pointer focus,
submenu mousedown/click deduplication and click-only activation. Public Menu stories receive trusted
tap browser checks, including LTR/RTL submenu selection. Neighboring Select, Popover, Menubar and
Context Menu suites guard shared interaction and Menu ownership.

Emulation does not certify hardware, mobile browser UI, TalkBack or VoiceOver. Real-device/AT
verification, hybrid input sequences and remaining API/lifecycle combinations stay separate work.

## Base UI References

Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`:

- `packages/react/src/menu/trigger/MenuTrigger.tsx`
- `packages/react/src/menu/submenu-trigger/MenuSubmenuTrigger.tsx`
- `packages/react/src/menu/root/MenuRoot.tsx`
- `packages/react/src/utils/popups/interactions/useClick.ts`
- `packages/react/src/internals/use-button/useButton.ts`
