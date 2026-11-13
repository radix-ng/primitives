# Core utility map

- `createContext<T>(description, docs?)` — DI context factory; `docs` ('components/<name>') links the missing-context error to the primitive's docs page
- `useArrowNavigation(event, current, container, opts)` — keyboard list nav
- `DataOrientation` — `'horizontal' | 'vertical'`
- `AcceptableValue` — `string | Record<string, any> | null`
- `isNullish(v)` — null/undefined check
- `rdxDevWarning` / `rdxDevError` / `rdxCheckTriggerElement` / `rdxCheckLabelElement` — dev-mode diagnostics (ADR 0013); `docsUrl(path)` builds a `radix-ng.com/<path>.md` link
- `rdxPlatform` — the **only** place the library sniffs the platform: `engine.{webkit,gecko,blink}` (WebKit is a `-webkit-backdrop-filter` CSS probe, not a UA match), `os.{ios,android,mac,windows,linux,apple}`, `screenReader.voiceOver`, `env.jsdom`. Static, SSR-safe (all `false` without `navigator`). Never re-roll a `navigator.userAgent` check in a primitive — add the missing trait here (`core/src/dom/platform.ts`)
- `isStationaryWebKitPointer(event)` — hover-highlight guard: WebKit fires zero-delta `mousemove`/`pointermove` when a list scrolls under a still cursor, which would yank the highlight off the keyboard target. Other composite / combobox / autocomplete hover handlers use this check; Select and Menu use the scope-local `createPointerMoveGuard` in document capture so real viewport-coordinate travel is not dropped when WebKit reports zero deltas
- `isMouseWithinBounds(event, element)` / `getPseudoElementBounds(element)` — whether a release happened on an element, counting a `::before`/`::after` that renders past it and a 5px drift tolerance. Used by the menu trigger's `cancel-open` guard so a slightly-off release does not close the menu it just opened
- `useInitialLiveRegionText(host)` — makes a polite live region that already has text when it mounts announce it (an invisible word joiner for 200ms), which Safari's VoiceOver otherwise misses. Wired into combobox status/empty and autocomplete empty; no-op on iOS and the server
