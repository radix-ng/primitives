# ADR 0080: Accept arbitrary Tabs identities with unknown public values

- Status: Accepted
- Date: 2026-11-16
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [ADR 0074](0074-tabs-native-identities.md), [ADR 0079](0079-tabs-collection-consistency.md)

## Context

The pinned Base UI 1.9.0 Tabs (`cf696d6f6e08c699c5bda24d5a033430909f2285`) accepts arbitrary values.
Angular's public alias admitted only string, number and null, although most runtime associations
already used strict equality and native instance IDs. Panel treated a bound undefined as a missing
input. Direction geometry used Map lookup, which matches NaN under SameValueZero while the pin's
strict Tab lookup cannot find it. A canceled NaN request therefore reported a different direction.

## Decision and migration

- Widen `RdxTabsValue` to `unknown` throughout Root models/inputs, Tab, Panel, presence, contexts and
  event payloads. Consumers narrow emitted values before storing them in narrower application
  state. The object-value Storybook consumer finds the original object in its typed collection;
  it uses no cast. Existing string/number bindings remain valid, but narrower event/model consumers
  may need migration. This public type change is breaking.
- Preserve === identity, including separate objects/arrays with equal contents and separate symbols
  with equal descriptions. Keep functions as data in Angular signals; callbacks return the original
  instance. Keep native IDs independent of values. No equality comparator, coercion, hashing,
  serialization or additional selection store is introduced.
- A private unique sentinel represents an omitted ordinary Panel input. Bound undefined is a valid
  value; omission without structural presence still triggers the existing diagnostic. Structural
  presence continues to supply its actual value, including undefined, to the native Panel.
- Omit NaN from captured Tab positions so direction follows the pin's strict lookup and value-based
  fallback. Other geometry, native identity registration and Panel Map semantics stay unchanged.
- Keep Root's initial undefined/default semantics and the existing nullish Indicator visibility
  policy. Controlled mode switching is separate from accepting arbitrary value data. Consumers keep
  controlled values defined. An explicitly authored null Tab/Panel matches selected null. Values
  must be unique under ===; zero and negative zero share an identity, and NaN never matches itself.

## Evidence and limits

Thirty cases cover defaults, implicit function fallback, native requests/repeats, cancellation,
controlled external updates, missing object defaults, collection fallback and structural presence.
Fixtures construct stable local catalogs and pass original values directly to real parts. A browser
probe retains unmodified callback values. Object.is membership/type/nullish observations preserve
identities that cannot be serialized directly across runtimes; native IDs and IDREFs remain raw,
with separately asserted ownership. Opaque objects throw on coercion, and function/coercion counts
must stay zero. Selection, actual Panel visibility, focus/tab stops, directions and literal visible
Indicator variables compare without adapters driving primitive state.

All **330 affected comparisons** pass across three engines on macOS: 90 new rows and 240 controls.
All **90 new rows** also pass in Playwright 1.60.0 Noble Linux/arm64 with one worker and original
timeouts, retained in `dist/tabs-values-linux/results/`. All **75 Tabs units** pass, including 12 new checks. Two of those fail against the previous runtime:
explicit undefined Panel and canceled NaN direction. Four focused Storybook browser checks pass
against a fresh build, including the typed object consumer. Five SSR checks establish native
object/function/undefined relationships and no function execution; library/SSR-app builds, scoped
lint and consumer-bundle generation pass.

The first raw browser experiment also contained a duplicate 0/-0 fixture, which caused React error
185 in the reference. It was corrected to an initial -0 selection with one zero-valued Tab. That
original report is retained in `dist/parity-testing/tabs/before-values-runtime-fix/`; it includes the
reference fixture failure and three Angular failures, not a clean reference baseline.

No new differential exception is added. The existing null-Indicator host adaptation remains raw in
DOM measurements; these cases certify its visibility and visible variables, not host-presence
equality. NaN is covered as a canceled request only; selected NaN, controlled mode switches,
actual hydration and arbitrary identity transfer across processes remain outside this evidence.
