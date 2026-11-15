# Cross-browser reevaluation of AppSelect and AppEmailField

**Final matrix: 36/36 passed, no retries or skips.** The same two generated implementations and
their retained library/dependencies were used. No new generation, component repair, library patch
or skill update was performed. This evaluates existing code, not the probability of future success.

| Saved component                                     | Chromium 148.0.7778.96 | Firefox 150.0.2 | WebKit 26.4 |
| --------------------------------------------------- | ---------------------- | --------------- | ----------- |
| AppSelect inside Dialog                             | 4/4                    | 4/4             | 4/4         |
| AppEmailField, generated app and independent parent | 8/8                    | 8/8             | 8/8         |

macOS, Node `24.22.2`, pnpm `11.5.1`, Playwright `1.60.0`, Radix NG `1.3.0`, Angular `22.0.2`,
TypeScript `6.0.3`. Original generation model/effort: `gpt-6.1-sol` / `low`; skills snapshot:
`d000174e3fb69ef5424b73492d73f34b84e3c80f`. Neither the model nor current workspace library sources
were used to create a replacement component. Four separate production builds passed using the
retained dependencies and strict configuration. Their build inputs stayed outside the workspace.

## Evidence and classifications

All attempts remain separately archived:

| ID suffix               | Outcome                              | Classification / evidence                                                                                                                                                                                                                                       |
| ----------------------- | ------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `cross-browser-v1`      | Preparation failed; no browser cases | Harness resolved transitive `playwright` as a direct consumer dependency. Fixed dependency-owner resolution; regression added.                                                                                                                                  |
| `cross-browser-v2`      | Preparation failed; no browser cases | Harness compared installation-specific nested `.bin` shims across installations. Only those generated shim paths differed; runtime files matched. Package-identity hashing corrected, with regression coverage; complete retained trees still hashed unchanged. |
| `cross-browser-v3`      | 35/36; AppSelect WebKit 3/4          | Test assumption: pointer-checking a native checkbox was expected to focus it. Original failed assertion, error and trace retained.                                                                                                                              |
| `native-checkbox-focus` | Three-engine reproduction            | Plain HTML reproduces the native focus difference without Angular or Radix NG; explicit starting focus restores expected disabled navigation in every engine.                                                                                                   |
| `cross-browser-v4`      | 36/36                                | Complete reevaluation after test setup correction; all assertions retained. No component defects observed within these cases.                                                                                                                                   |

Each ID has prefix `2026-11-15-` under `dist/consumer-generation/`. The raw reports and original
Playwright results were not rewritten. The final suite took 23.180 seconds. The original AppSelect
3/4 Chromium result, its earlier corrected 4/4 reevaluation, and the original AppEmailField 8/8 remain
unchanged too. [summary.json](summary.json) identifies all runs, hashes and trace paths.

## Minimal reproduction and checker correction

The failing case was the independent parent's disabled Select scenario. Its assertion immediately
after `checkbox.check()` expected that checkbox to be focused, before any Tab navigation. The native
[HTML reproduction](native-checkbox.html) and [runner](reproduce-pointer-focus.mjs) establish:

| Engine   | Active element after pointer check | Disabled navigation after explicit checkbox focus                |
| -------- | ---------------------------------- | ---------------------------------------------------------------- |
| Chromium | Checkbox input                     | Passed forwards and backwards                                    |
| Firefox  | Checkbox input                     | Passed forwards and backwards                                    |
| WebKit   | Body                               | Passed forwards and backwards with the macOS keyboard convention |

The checkbox is checked in all engines. Thus the failure is a browser-native pointer-focus
difference exposed by a test assumption, not evidence of a Select defect. The matrix adapter now
calls `checkbox.focus()` before the existing `toBeFocused()` assertion. It retains both expected Tab
targets, disabled pointer refusal, value and event assertions, external updates, enabling, keyboard
selection and focus restoration. AppEmailField assertions did not change. All copied-suite assertion
lines are checked against their historical sources by a Node regression.

WebKit on macOS uses Alt+Tab / Alt+Shift+Tab as in existing repository checks. Escape, Enter and
arrow events are unchanged. Firefox uses the shared helper's isolated app-data directory. These
are environment/test adaptations, not changes to runtime behavior.

## Fixed inputs

Hashes below use the existing deterministic file-path/content tree algorithm. Complete dependency
trees contain 92,461 physical files each, plus 1,125 symlinks whose targets are hashed separately.
Their before/after fingerprints match in every run, including the failed ones.

| Input                                        | SHA-256                                                            |
| -------------------------------------------- | ------------------------------------------------------------------ |
| AppSelect source, five files                 | `a93040edc1d292a8a9fba75a6eade3b24835344fb4c368f7a244ceededaa5ffe` |
| AppEmailField source, five files             | `e6bf58e2a19e8a3234ce02c53629c252fefdbd96c93b03b5715e4963f2226ecb` |
| Installed library, 219 files, both consumers | `714d5d1a1898a4e80a2ddcc6adc99444330e424869b82211f4d4adb7e49d63a0` |
| AppSelect complete dependency files          | `438d3cd626431bc57a0c88a29fafecba250c1a98c7205e3681202707aa08b90a` |
| AppEmailField complete dependency files      | `fd85a1f4a6ceacaabc0a48eb3b2c7baf60a77e4bac04b342563e10eef05851a6` |
| Dependency symlink targets, both consumers   | `e8021cc5ffef103ac782a7b40e5fbe78244fc1440e4d5d1620b1bac5c7a6fe05` |

Source-file hashes, protected manifests/lock/configuration, skills, harness/check copies and the
earlier-archive digests are retained in the final report. The complete dependency fingerprints are
new attestations at reevaluation time; prior recorded lock, library and source fingerprints establish
their relation to the successful experiments. No fresh dependency installation was substituted.

## Read the traces and repeat

The compact per-scenario matrix with clickable links to all 36 traces is
`dist/consumer-generation/2026-11-15-cross-browser-v4/compact-matrix.md`. The initial failed matrix and trace
are in the corresponding `v3` directory; three native-reproduction traces are in
`dist/consumer-generation/2026-11-15-native-checkbox-focus/`. Paths are local artifacts, not a claim
that trace archives have been published on GitHub.

[README.md](README.md) documents reproducible commands and required retained environments. No public
adapter/API changed. This matrix covers only the existing scenarios on these macOS browser builds;
screen readers, visual quality, other OS/browser versions, async validators and new generated code
were not evaluated. Public documentation reports these scoped results separately from generation
and maintained example checks.
