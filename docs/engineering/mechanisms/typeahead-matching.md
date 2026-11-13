# Typeahead matching

core `findTypeaheadMatch` is a pure, indexed, case-insensitive prefix matcher
used by Select and Menu. Null labels represent unavailable entries. Select Root owns one Trigger/Popup
query, 750ms timeout and origin; it does not mirror selection or copy a React store. Closed typing
commits through Root, while open typing only highlights. Root shares lazy option preparation with
autofill, coalescing reads/keys across Angular rendering and releasing hidden query views at session
end. Metadata uses current DOM order, explicit aliases and live ItemText rather than a mount-time
text cache. Logical open/close, blur, reset, mode changes and destruction invalidate stale work;
query reset does not depend on browsers dispatching blur for a removed popup. Menu retains its own
session and timeout policy; focus, eligibility and mounting remain primitive-owned (Select `PARITY.md`).
