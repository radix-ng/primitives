# AppTabs — one independent coding experiment

**`2026-11-15-tabs-first`: one completed live coding session, both production builds passed, frozen
browser suite 34/36. No evaluator implementation repairs or automatic replacement generation.**
The raw report remains `verification-failed`; supplemental observations do not relabel it as 36/36.

| Frozen checks                     | Chromium 148.0.7778.96 | Firefox 150.0.2 | WebKit 26.4 |
| --------------------------------- | ---------------------- | --------------- | ----------- |
| Generated consumer, six scenarios | 5/6                    | 6/6             | 6/6         |
| Independent parent, six scenarios | 5/6                    | 6/6             | 6/6         |
| Total                             | **10/12**              | **12/12**       | **12/12**   |

## Frozen inputs and isolation

The [public contract/criteria](criteria.json), [prompt](prompt.md), independent `probe-app.txt`, blank
scaffold and [browser checks](generation.spec.ts) were frozen before the live session. Required API:
standalone `AppTabs`, host-composed `RdxTabsRoot`, inner-view `RdxTabsList`, projected tab/panel parts,
`value`, required `label`, `activateOnFocus` (default false) and native `onValueChange` event payload.
The two instances reuse the same values to test context/ID ownership.

The clean external app contained no ready Tabs implementation. It reused the old immutable scaffold
toolchain, local library tarball and installed skills bytes, not a current workspace build or fresh
GitHub HEAD. Workspace sources, global skills and hidden checks were denied to the coding session.
Installed skill examples were allowed; the independent parent contains consumer markup only and was
not provided to the agent. Helper files imported by the checks were frozen separately too.

| Input                           | Version / identity                                                                        |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| Model / effort / authentication | `gpt-6.1-sol` / `low` / Codex ChatGPT subscription                                        |
| Codex CLI                       | `0.169.0`; absolute executable resolved before restricting PATH                           |
| Skills                          | `d000174e3fb69ef5424b73492d73f34b84e3c80f`                                                |
| Library / Angular / TypeScript  | `1.3.0` local tarball / `22.0.2` / `6.0.3`                                                |
| Node / pnpm / Playwright        | `24.22.2` / `11.5.1` / `1.60.0`                                                           |
| Base revision                   | `105a5b9b49373bc7b1da7c83de09af1e68824ae1`; uncommitted inputs/harness captured by hashes |
| Checks version                  | `tabs-consumer/1`, six cases × two consumers × three engines                              |
| Live duration / shell commands  | 142.561 seconds / 10                                                                      |

Offline preparation passed actual coding-tool execution through a loopback fixture (no model), both
skill reads, workspace/fixture isolation and `ngc --noEmit` in the restricted environment. All three
browser engines launched before the model session. `before-live.json` predates that session and
contains the contract, source/dependency capture, helper hashes and browser versions. Task hashes
were checked again by the launcher and verifier.

## Generated component and independent results

The agent read both skills, composition guidance, Tabs API/styling contracts, the Tabs index, projected
wrapper example, verification guide and installed package metadata/types/runtime. The material record
identifies eight skill files and three installed-package files by hash and command IDs. This is
command/output evidence, not a filesystem syscall audit.

Independent source review confirms `hostDirectives: [{ directive: RdxTabsRoot, ... }]` on the component,
`RdxTabsList` in its template and separate `ng-content` slots for tab buttons and panels. The wrapper
forwards Root's value/event contract and adds signal inputs for list label and activation mode. It
does not recreate keyboard behavior. The consumer owns both states, payload records, disabled
bindings, projected content and token-based CSS. Review excerpts/line numbers are in `source-review.json`.

Both production builds passed strict templates and used installed public imports. The independent
parent supplied different list labels and its own event handlers. Browser checks confirmed:

- Projected Root/List DI ownership, tab/panel roles/names, reciprocal unique IDs and visible selection.
- Manual arrows/Home/End change focus without selection; Enter/Space produce the expected value and
  `eventDetails.reason = 'none'`, without duplicate callbacks, including repeated activation.
- Disabled Billing receives arrow focus and refuses keyboard/pointer activation. No Select-style
  disabled-skip assumption was used.
- External updates render without user callbacks; two instances retain separate values, events,
  associations and focus.

All cases used fresh contexts, zero retries, traces and error collection before navigation. No Angular
or console/page errors occurred. The original suite took 27.523 seconds; only the second half of the
Tab-exit case failed in Chromium on each consumer.

## Focus failures and supplemental diagnosis

The frozen case presses Enter on Security and immediately presses Tab, then expects the Security
panel to be focused. It does not wait for selected-tab/panel/parent-state rendering between those
keys. The [diagnostic runner](diagnose-tab-exit.mjs) retains this sequence and compares it with the
same interaction after observing the new selection. It never invokes internal handlers or edits code.

In Chromium, three of four immediate samples focused the still-visible Account panel while the DOM
still reported Account and zero events. After Angular committed Security/one event and hid Account,
focus fell to `body`. One immediate Chromium sample succeeded, showing timing sensitivity. All eight
immediate Firefox/WebKit samples succeeded. With observable selection checks before Tab, all six
engine/consumer pairs passed both forward panel focus and reverse-tab focus restoration.

Those **six supplemental passes are separate evidence**, not a corrected full-suite score. The
original frozen source/tests, 34/36 result, failure screenshots and traces remain unchanged. No second
generation occurred. [FOLLOWUPS.md](FOLLOWUPS.md) records the remaining timing/contract investigation.

## Findings separated

- **Environment:** sandbox heredoc temporary-file creation failed; the agent recovered with its own
  patch/Python writes in the same session. Its Chromium availability probe failed on inaccessible ICU
  data. It did not rerun the production builder inside the sandbox because the earlier exit-134
  limitation was disclosed. Both independent builds and engine launches outside it succeeded.
- **Implementation/runtime:** no wrapper architecture or settled-state behavior defect was confirmed.
  Rapid Enter→Tab exposes a real focus-timing limitation in Chromium. This experiment does not prove
  whether runtime changes are warranted for that pre-render interaction; no library/wrapper patch
  was made to hide it.
- **Checks:** the evaluator omitted a render-state wait before dependent navigation. The diagnosis
  isolates this missing precondition and shows the expected settled-state focus path. It does not
  erase the original failure or establish that all rapid keyboard sequences are safe.
- **Confirmed skill gaps:** none demonstrated for wrapper generation. The agent found the projection
  example and preserved the required architecture. Test synchronization is an evaluator follow-up;
  it is not evidence that the skills failed to teach the component API.

## Hashes, artifacts and checks

Source tree SHA-256: `07cc99d1756b851b825e85cfecf7f0ff205bf504cba02114ab9e9c515bc717ac`.
`app-tabs.ts`: `35df649d9c1490243e213c92bbc1c6d5a0dff6b7862a53ee28d6ef45ac9871a5`.
The full 7,737-byte patch hashes to
`0d34da77b1bcdc0739b1e87338757dfb1faacd029054d3aeae5117cb2d6f3580`.
Complete dependencies: 92,461 files, SHA-256
`c285c195f4503167b09c1bd0f6c0790d5c36db584dbf89be5b54d3d75994a995`, plus 1,125 symlinks hashed
separately. Full dependency contents/links, protected configuration, library, skills and helper files
match before/after. Earlier experiment archives remain unchanged.

[verification.json](verification.json) includes all input/source hashes, versions, usage, original
per-case results and diagnosis paths. `dist/consumer-generation/2026-11-15-tabs-first/` retains scaffold,
frozen files/support code, preparation logs, exact prompt, CLI/configuration metadata, journal,
materials, complete patch/source, both build logs/stats, original Playwright JSON, 36 traces and
`matrix.md` linking every result. The separate `2026-11-15-tabs-focus-diagnosis/` holds 18 diagnosis
observations/traces. These are local gitignored artifacts; they were not staged or uploaded.

The [README](README.md) gives reproduction commands. Focused launcher regressions, new test/config
typechecking, ESLint, formatting and `agents:check` passed; commands/logs are retained in the attempt's
`validation.json`. Generated source was not reformatted or repaired by the evaluator.

CLI usage was input 212,007; cached input 181,888; output 6,039; reasoning output 78, retained without
conversion to subscription percentages. This is one task on three macOS browser builds, not a general
generation-reliability estimate, visual score or accessibility certification. No new live retry was run.
