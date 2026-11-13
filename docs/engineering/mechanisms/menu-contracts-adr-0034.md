# Menu contracts (ADR 0034)

Menu has an independent pinned suite with native button fixtures.
Trigger/SubTrigger/Popup id inputs publish reactive identity getters to Root for native ARIA links.
Keyboard arrows report `list-navigation`; UI item/value actions report `item-press` with the original
event. Selection closes ancestors before descendants. Native keyboard PointerEvent clicks are
classified before an empty pointerType fallback. Portal tabindex suspension runs after Angular
host bindings, and trigger guards resolve existing content-guard ownership. Menu lets native Tab
use that path; a leading boundary emits focus-out before returning to its owning trigger.
Menu shares core's coordinate pointer guard with Select, scoped/reset per open menu and observed in
document capture. Exceptions retain the pin's programmatic focus-out and WebKit/native-focus limits;
React portal/store workarounds are not ported. Menu composes the shared popup lifecycle (ADR 0035).
Angular DI registers child Roots and parent presence derives a hold while accepted child exits end,
preserving the embedded view that owns their completion outputs. The pin drops one nested CSS
completion; an exact exception records this rather than copying its disposal race.
