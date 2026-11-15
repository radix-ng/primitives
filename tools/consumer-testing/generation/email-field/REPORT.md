# AppEmailField — one independent coding run

**`2026-11-15-email-field-first`: passed. One live session; both production builds and 8/8 Chromium
cases passed on unchanged generated code.** No evaluator implementation repairs, check changes after
generation or automatic live retries were made.

## Frozen task and environment

Before launch, [criteria.json](criteria.json) fixed the public API: standalone `AppEmailField`, exported
from `src/app/app-email-field.ts`, selector `app-email-field`, with required `control: FormControl<string>`,
`label` and `description` inputs. The parent owns value, validators, disabled state, reset and submission.
The [prompt](prompt.md), blank scaffold, separate `probe-app.txt` and eight browser cases were saved
and hashed before the session. `before-live.json` was written at `2026-11-15T10:29:15.559Z`; the live
session started at `10:29:17.393Z`.

| Input                          | Version / identity                                                                                       |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Model / reasoning effort       | `gpt-6.1-sol` / `low`                                                                                    |
| Authentication / Codex CLI     | ChatGPT subscription / `0.169.0`                                                                         |
| Base repository revision       | `1fb1ee33805cfe5f685b4b4d4e92a3b228e0b1b0`; launcher/check changes captured separately by hashes         |
| Skills snapshot                | `d000174e3fb69ef5424b73492d73f34b84e3c80f`                                                               |
| Library / tarball              | `@radix-ng/primitives@1.3.0`, SHA-256 `bbe21d90d2e03937f8d9c7a856ac7ceb81a972a247d7f3f40ecf4e82aaeac750` |
| Angular / TypeScript           | `22.0.2` / `6.0.3`                                                                                       |
| Node / pnpm                    | `24.22.2` / `11.5.1`                                                                                     |
| Playwright / Chromium          | `1.60.0` / `148.0.7778.96`                                                                               |
| Checks                         | `email-field-consumer/1`                                                                                 |
| Live duration / shell commands | 128.873 seconds / 10                                                                                     |

The clean app and physical dependencies were outside the workspace. Preparation reused the immutable
tarball, toolchain and installed skill bytes from the previous experiment, with a new blank heading.
It contained no ready Field implementation. This reused the documented GitHub installation's saved
snapshot; it was not a new check of registry publication, GitHub HEAD or the current workspace bundle.
Both skill tree hashes match that snapshot:

- `radix-ng`: `2ffe4674e069a598c3f0c25e60c372156964115df1ccfbb0ca47487a58ac3075`.
- `radix-ng-examples`: `f3407a6c55219ba80f889fd5923b0a986897c7c83bd32ddbb9229b8a99a6a0ee`.

The shared launcher resolves/records the absolute Codex executable before restricting PATH. Offline
preparation passed the actual coding-tool loopback contract, reads of both installed skills, denial
of workspace/hidden-fixture access and strict `ngc --noEmit` inside the configured sandbox. The
loopback fixture does not call a model. ChatGPT authorization was checked separately before the
one live session. API-key variables were excluded; credentials were not saved.

## Generated result and independent checks

The agent read both skills, the forms guide, Field API/styling contracts, Field's index/Reactive Forms
example, the verification guide, installed Field types and selected compiled runtime sections. The
material record contains eight skill files and two installed-package files with hashes and command
IDs. This is command/output evidence, not a complete filesystem read audit.

The wrapper is thin: required signal inputs, public Field directives, `rdxNgControlField` on the native
email input and `validationMode="onBlur"`. It binds the original parent control directly and adds no
validators or duplicate value/disabled model. The generated parent owns the FormGroup, required/email
validators and submission history, and reads real control events for its state display. Appearance
comes from application CSS using the existing tokens.

| Independent check                                                                     | Generated app | Separate parent |
| ------------------------------------------------------------------------------------- | ------------- | --------------- |
| Strict production compilation                                                         | Passed        | Passed          |
| Label click/name, description, no initial errors, required on blur                    | Passed        | Passed          |
| Invalid email, correction and user/external control synchronization                   | Passed        | Passed          |
| Disabled pointer/editing, Tab/Shift+Tab skip, external value and enable               | Passed        | Passed          |
| Reset value/flags/errors, invalid submit, current value exactly once per valid submit | Passed        | Passed          |

Each case used a fresh Chromium context. All eight passed with zero retries, skips, flaky results or
browser errors. The suite took 4.800 seconds. The independent parent supplied different label and
description text and its own FormControl/handlers. Two consecutive valid submissions produced two
entries with the respective current values; invalid submission produced none. Disabled navigation
checked real focus targets instead of sending activation to an unfocusable control. Tests used waiting
assertions and native events, without internal handler calls.

Public import auditing found `@radix-ng/primitives/field`. Production inputs stayed outside the
workspace; protected configuration, library bytes and skills remained unchanged. Source tree digest:
`e6bf58e2a19e8a3234ce02c53629c252fefdbd96c93b03b5715e4963f2226ecb` (five files).
`app-email-field.ts` SHA-256:
`825daad725fb333e956cbcbd61d8a599b3fdf1cbf686c26cb882a686837c66b5`.
The complete 7,754-byte generated patch has SHA-256
`1864f64181c4ff67f0fe60aa94aa6363466ad194f55d1101308992c75c42b2e9`.
All input/source hashes and per-case traces are listed in [verification.json](verification.json).

## Findings separated

- **Environment:** the first heredoc write failed because the sandbox denied temporary-file creation,
  leaving an empty App module and a follow-on compiler error. The agent recovered with its native
  patch tool in the same session; strict compilation then passed. Its production build returned the
  already disclosed sandbox exit 134. Both independent production builds outside the sandbox passed.
  The original failed commands remain in the journal.
- **Implementation:** no defect was observed within the frozen contract and eight checks. There were
  no evaluator source changes. The native patch recovery belongs to the agent's own session.
- **Checks/executor:** no confirmed false positive, false negative or launcher failure occurred. The
  launcher/preparer/verifier now accept a separate task-input directory while retaining the existing
  default task; they freeze its files and verify their hashes instead of supplying hidden fixtures.
- **Confirmed skill gaps:** none demonstrated for this task. The installed guide/example and types
  were sufficient for this observed implementation. A successful task does not prove completeness.

## Reproduction, artifacts and limits

The commands and one-run guard are documented in [README.md](README.md). The completed invocation used:

```bash
node tools/consumer-testing/generation/prepare-pinned.mjs 2026-11-15-email-field-first \
  tools/consumer-testing/generation/email-field
node tools/consumer-testing/generation/code.mjs /absolute/prepared/path/consumer
node tools/consumer-testing/generation/verify.mjs /absolute/prepared/path/consumer
```

`dist/consumer-generation/2026-11-15-email-field-first/` retains scaffold, before-live contract/hashes,
frozen inputs and harness sources, preparation/spawn logs, CLI/configuration/authentication metadata,
JSONL journal, material references, final answer, full generated diff/source, build logs/stats, original
browser JSON and eight traces. External dependencies and both builds remain at the pointer in
`dist/consumer-generation/2026-11-15-email-field-first.json`. Artifacts are gitignored and were not staged.
All four earlier AppSelect archives were checked by tree digest and remain unchanged.

Focused Node launcher/logging regressions, TypeScript checking of the new tests/config, ESLint with
zero warnings, formatting and `agents:check` passed. Exact validation commands/results are retained
in the attempt's `validation.json` and logs. No library-wide suite or skills rebuild was needed for
this experiment's harness and engineering-documentation changes.

CLI usage is retained as returned: input 186,662; cached input 152,832; output 4,851; reasoning output 85. These are not subscription percentages. This is one task and one coding session on a pinned
local package/bundle, not a reliability estimate. Other browsers, screen readers, visual quality,
async validators and replacing the FormControl instance after mounting were not evaluated.
