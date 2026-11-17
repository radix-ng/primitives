# Autocomplete initial-state comparisons

Compares Radix NG with unmodified Base UI **1.9.0**, pinned by
[reference.json](../../reference.json). This first increment covers G1 from the
[Autocomplete matrix](../../../../packages/primitives/autocomplete/PARITY.md): **14 scenarios / 42
comparisons**, without skips or reviewed exceptions.

```bash
pnpm test-parity autocomplete
pnpm test-parity autocomplete --project=chromium
```

| Scope                              | Cases                                                                                  |
| ---------------------------------- | -------------------------------------------------------------------------------------- |
| Omitted and initial default inputs | Empty/closed, default text, default open                                               |
| Explicit input precedence          | Empty text, closed popup, nonempty text, open popup, combined falsy inputs             |
| One-time defaults                  | Initially absent defaults, changed defaults, Clear/Escape followed by changed defaults |
| Application ownership              | Accepted external nonempty/empty and open/closed updates                               |
| Root lifetime                      | Destroy/recreate reads the new defaults without changing the old instance              |

Angular fixtures genuinely omit uncontrolled model bindings. Controlled models use ordinary
application signals and accept output requests; the React fixture uses ordinary state/props.
F2 changes only application defaults, F3/F4 supply external values and F5/F6 remove/recreate the
Root. Native Clear and Escape exercise user changes before later defaults. Mode `none` and explicit
flat Root items isolate G1 from the query/preview and collection work in G4/G7.

Each checkpoint compares actual input text, ARIA-expanded state, native popup visibility, FormData
and detailed request values/counts/cancellation. Initial/default/external updates must emit no
interaction requests. Raw DOM/IDs, focus, callback reason/native event metadata and Angular model
outputs remain in measurements. This increment does not compare G5's detailed event protocol or
G11's focus/isolation contract, and does not certify one-way frozen controlled requests.

The initial baseline reproduced eight failing initial/default cases only in Angular, with reference
assertions passing. The clearing case initially used typing, which also exposed the pin's distinct
empty-input close policy; the final scenario uses the actual Clear part. Consequently the saved
first report is not a clean whole-suite negative baseline. It is retained in
`dist/parity-testing/autocomplete/g1-before/`. Six initial unit regressions failed before the fix;
a seventh control already passed. Two later cases check native form reset baselines.

All **42 comparisons** pass on macOS and Linux/arm64 in Playwright 1.60.0 Noble, two workers and
original timeouts. Reports: `dist/parity-testing/autocomplete/g1-final/` and
`dist/autocomplete-g1-linux/results/`. Autocomplete/Combobox units pass **254 tests**. The new
Autocomplete SSR initialization case and the Menu initialization control pass, alongside the library
build, lint, formatting, consumer generation and contributor checks.

Angular Reactive Forms, template forms, Signal Forms and native reset are covered by unit
regressions. Their Angular form integrations are not synthetic paired React observations. SSR
coverage establishes initial serialized values/metadata, not client hydration. Navigation, read-only,
query/preview, event metadata, retained/manual exits, grouped data, geometry and native platform
compositions remain separate matrix increments. `expected-differences.json` is empty.
