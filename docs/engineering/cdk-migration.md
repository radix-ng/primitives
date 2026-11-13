# Owned replacements for Angular CDK

**`@angular/cdk` is no longer a dependency** (not a peer, not installed by `ng-add`, not in the root lockfile). New code must not reintroduce CDK imports.

Own replacements for what CDK used to provide:

- `_IdGenerator` (`cdk/a11y`) → `RdxIdGenerator` + the `injectId(prefix)` hook in `core/src/id-generator.ts` (re-exported from `@radix-ng/primitives/core`). `injectId('rdx-…-')` is the call-site API (Angular counterpart of React's `useId`); it generates deterministic, SSR/hydration-stable IDs via a per-prefix counter folded with `APP_ID`. Inject `RdxIdGenerator` directly only when generating IDs lazily outside an injection context.
- `LiveAnnouncer` (`cdk/a11y`) → `RdxLiveAnnouncer` in `core/src/live-announcer.ts`: lazily appends a visually-hidden `aria-live` region to `document.body`, no-op on the server. Only consumer: stepper.
- `Platform` (`cdk/platform`) → `core/is-client` now uses `isPlatformBrowser(inject(PLATFORM_ID))` from `@angular/common`.
- `Direction` (`cdk/bidi`) → `core/src/types.ts` `export type Direction = 'ltr' | 'rtl'` (re-exported from `@radix-ng/primitives/core`).
- `BooleanInput`, `NumberInput` (`cdk/coercion`) → defined in `core/src/types.ts` (re-exported from `@radix-ng/primitives/core`). The transforms themselves are Angular's `booleanAttribute` / `numberAttribute`; CDK only ever supplied the input-value type aliases.
- CDK Dialog/Overlay, `cdk/portal`, and `CdkTrapFocus` were previously replaced with own implementations (so consumers no longer need `@angular/cdk/overlay-prebuilt.css`).
