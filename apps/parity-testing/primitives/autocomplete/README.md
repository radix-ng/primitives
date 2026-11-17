# Autocomplete state and navigation comparisons

Compares Radix NG with unmodified Base UI **1.9.0**, pinned by
[reference.json](../../reference.json). The suite covers G1, G2 and G3 from the
[Autocomplete matrix](../../../../packages/primitives/autocomplete/PARITY.md): **137 scenarios / 411
comparisons**, without skips or reviewed exceptions. G1 contributes 14 initial-state cases; G2 adds
79 navigation cases; G3 adds 44 read-only cases.

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

The G1 increment's **42 comparisons** passed on macOS and Linux/arm64 in Playwright 1.60.0 Noble, two workers and
original timeouts. Reports: `dist/parity-testing/autocomplete/g1-final/` and
`dist/autocomplete-g1-linux/results/`. Autocomplete/Combobox units pass **254 tests**. The new
Autocomplete SSR initialization case and the Menu initialization control pass, alongside the library
build, lint, formatting, consumer generation and contributor checks.

Angular Reactive Forms, template forms, Signal Forms and native reset are covered by unit
regressions. Their Angular form integrations are not synthetic paired React observations. SSR
coverage establishes initial serialized values/metadata, not client hydration. Read-only,
query/preview, full event metadata, retained/manual exits, grouped data, geometry and native platform
compositions remain separate matrix increments. `expected-differences.json` is empty.

## G2 navigation scope

Native keyboard cases cover closed/open lists, both arrow directions, each auto-highlight mode,
looping through the input-only position, clamping, mounted DOM and flat virtualized lists, disabled
item highlighting without activation, modified arrows, empty/text Space, native Home/End/caret, and
LTR/RTL grids with rectangular and shorter final rows. Grid arrows leave a closed popup closed;
Left/Right preserve native caret movement when no cell is highlighted. The comparison uses `mode="none"`
to isolate navigation from G4's query and inline-preview protocol. Virtualized cases mount all items;
real virtual windows and offscreen active-ID reveal remain G10.

The application accepts ordinary value/open requests on both sides. After each native key the driver
compares actual input text, caret selection, popup visibility, DOM focus, resolvable active IDREF,
`data-highlighted`, value/open request counts, highlight index/count traces and native key prevention.
The key observer runs after dispatch; it never repairs selection or focus. Highlight value/reason and
full request/native metadata remain in raw measurements; their complete equivalence belongs to G5.
Enter and empty Space activate the actual mounted Item click handler, including disabled virtual items.

Before the runtime fix, the selected ten-case baseline had seven Angular failures and three controls
with passing reference assertions. The raw report is in
`dist/parity-testing/autocomplete/g2-before-final/`. A core input-only-loop regression also failed
before implementation. An earlier diagnostic key observer sampled too early and was corrected before
this baseline. Modified-arrow reference expectations were corrected against actual pinned navigation.

All **279 comparisons** pass on macOS and Linux/arm64, Playwright 1.60.0 Noble, two workers,
original timeouts and zero retries. Reports: `dist/parity-testing/autocomplete/g2-final/` and
`dist/autocomplete-g2-linux/results/`. **269 units** pass across Autocomplete, Combobox and core
highlight. Library build, fixture Angular compilation, scoped lint, consumer generation and
contributor checks pass.

An additional standalone strict TypeScript check including the pinned React implementation reports
68 diagnostics, all inside the prepared upstream source (none in the Autocomplete fixtures).
That optional check is not a passing gate; it does not alter the pinned sources or browser results.

## G3 read-only scope

44 cases cover all four modes, native arrow/input/Trigger opening, pointer takeover after keyboard,
blocked edits/activation, Enter without a highlight and actual native form submission, DOM/flat
virtualized lists, listbox/grid read-only ARIA, native LTR/RTL caret behavior and completion toggles.
Read-only blocks mutations while browsing remains available. Discarded completion stays absent when
editing is restored; fresh editable input/keyboard navigation releases suppression.

Preview cases use public `filter=null` and preserve the complete typing setup as a measurement.
G4's suffix timing differs before the toggle, so setup establishes the native query/highlight before
paired G3 checkpoints start. Those checkpoints compare displayed/committed text, read-only/ARIA,
focus/popup, active IDREF, highlight indices/counts, value/open request counts and native key behavior.
Completion caret selection belongs to G4; exact callback ordering belongs to G5. Every complete
snapshot/DOM/callback remains recorded. Other read-only cases compare all navigation fields.

The corrected negative baseline has 44 Angular failures and passing reference assertions:
38 assertion failures and six differential-only failures. Seven unit regressions also failed before
implementation. Report: `dist/parity-testing/autocomplete/g3-before-final/`. Earlier diagnostic
fixtures included incorrect typing-preview expectations and a List focus precondition rejected by the
reference focus manager; those are not clean negative baselines. The final fixture records G4 setup
separately and leaves inside-popup/List focus to G11. No exceptions or fixture state repairs are added.

The final G3 verification passes **411 G1–G3 comparisons on macOS** and **132 new G3 comparisons
on Linux/arm64**, Chromium/Firefox/WebKit, Playwright 1.60.0 Noble, two workers, original timeouts,
zero retries/skips/exceptions. **279 units** pass across Autocomplete, Combobox and core highlight,
including the read-only axe checks. Library build, Angular fixture compilation, test-fixture types,
scoped lint, consumer generation and contributor checks pass. Reports:
`dist/parity-testing/autocomplete/g3-final/` and `dist/autocomplete-g3-linux/results/`.

In the first broad macOS run, WebKit Backspace navigated back from a read-only input on both sides,
so 26 scenarios lost their pages before reporting. The final edit-guard test uses native Delete;
native browser Backspace/history remains unmodified. The original traces are retained in
`dist/parity-testing/autocomplete/g3-platform-before/`. Axe scans the host and portaled popup as
primitive subtrees; application landmarks belong to the host application.
