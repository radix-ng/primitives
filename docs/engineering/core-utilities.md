# Core utility map

- `createContext<T>(description, docs?)` — DI context factory; `docs` ('components/<name>') links the missing-context error to the primitive's docs page
- `useArrowNavigation(event, current, container, opts)` — keyboard list nav
- `useElementRegistry<T>({ injector? })` — shared registration, removal, reactive document order and metadata payload updates for Composite, Combobox and Autocomplete (ADR 0086). `register` returns an owner-safe cleanup; `unregister` checks the owner; `update` preserves the registration lifetime. `elements` and O(1) `indexOf` depend only on membership/order, while `items` also publishes replaced payloads. Metadata signals remain owned by each adapter. Angular render hooks and scoped parent/common-ancestor observers reconcile tracked moves; `refresh` explicitly synchronizes external DOM work. Navigation, filtering and virtualized data indices remain consumer policies.
- `DataOrientation` — `'horizontal' | 'vertical'`
- `AcceptableValue` — `string | Record<string, any> | null`
- `isNullish(v)` — null/undefined check
- `isNode` / `isElement` / `isHTMLElement` / `isShadowRoot` — constructor-independent DOM checks for
  foreign and adopted nodes; shared by Portal, Composite, Focus Scope and dismissal
- `isKeyboardEvent` / `isMouseEvent` — native event-brand guards that work across Windows, including
  events whose `view` is null; shared by floating focus and Menu (ADR 0072)
- `rdxDevWarning` / `rdxDevError` / `rdxCheckTriggerElement` / `rdxCheckLabelElement` — dev-mode diagnostics (ADR 0013); `docsUrl(path)` builds a `radix-ng.com/<path>.md` link
- `rdxPlatform` — the **only** place the library sniffs the platform: `engine.{webkit,gecko,blink}` (WebKit is a `-webkit-backdrop-filter` CSS probe, not a UA match), `os.{ios,android,mac,windows,linux,apple}`, `screenReader.voiceOver`, `env.jsdom`. Static, SSR-safe (all `false` without `navigator`). Never re-roll a `navigator.userAgent` check in a primitive — add the missing trait here (`core/src/dom/platform.ts`)
- `isStationaryWebKitPointer(event)` — hover-highlight guard: WebKit fires zero-delta `mousemove`/`pointermove` when a list scrolls under a still cursor, which would yank the highlight off the keyboard target. Other composite / combobox / autocomplete hover handlers use this check; Select and Menu use the scope-local `createPointerMoveGuard` in document capture so real viewport-coordinate travel is not dropped when WebKit reports zero deltas
- `isMouseWithinBounds(event, element)` / `getPseudoElementBounds(element)` — whether a release happened on an element, counting a `::before`/`::after` that renders past it and a 5px drift tolerance. Used by the menu trigger's `cancel-open` guard so a slightly-off release does not close the menu it just opened
- `useInitialLiveRegionText(host)` — makes a polite live region that already has text when it mounts announce it (an invisible word joiner for 200ms), which Safari's VoiceOver otherwise misses. Wired into combobox status/empty and autocomplete empty; no-op on iOS and the server
