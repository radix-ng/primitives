# Third attempt — 2026-11-15

**ID: `2026-11-15-third`. One completed live coding session, no evaluator edits to generated source.**
The agent created a working consumer AppSelect inside Dialog using the pinned skills and application
CSS. Both production builds pass. The frozen Chromium suite records **3 passed / 1 failed**; a
separate diagnosis confirms the failure is a keyboard-targeting defect in the evaluator. The
unchanged component passes the corresponding real-navigation check. The failed raw result is
retained; this report does not relabel the original suite as 4/4.

The later [checks-v2 reevaluation](REPORT-REEVALUATION-V2.md) runs all four corrected scenarios and
records **4/4 passed** on this unchanged generated source. It is a separate test result, with no new
live session; the original 3/4 and supplemental 2/2 remain intact.

## Inputs and toolchain

The prompt, criteria, four browser tests and independent parent have exactly the first attempt's
hashes. The blank scaffold, tarball and skill bytes are also identical; dependencies were installed
afresh outside the workspace. The library was not rebuilt from parallel workspace changes.

| Input                          | Value                                                                                                    |
| ------------------------------ | -------------------------------------------------------------------------------------------------------- |
| Consumer skills snapshot       | `d000174e3fb69ef5424b73492d73f34b84e3c80f`                                                               |
| `radix-ng` SHA-256             | `2ffe4674e069a598c3f0c25e60c372156964115df1ccfbb0ca47487a58ac3075`                                       |
| `radix-ng-examples` SHA-256    | `f3407a6c55219ba80f889fd5923b0a986897c7c83bd32ddbb9229b8a99a6a0ee`                                       |
| Library / tarball              | `@radix-ng/primitives@1.3.0`; SHA-256 `bbe21d90d2e03937f8d9c7a856ac7ceb81a972a247d7f3f40ecf4e82aaeac750` |
| Angular / TypeScript           | `22.0.2` / `6.0.3`                                                                                       |
| Node / pnpm / Playwright       | `24.22.2` / `11.5.1` / `1.60.0`                                                                          |
| Codex CLI / model / effort     | `0.169.0` / `gpt-6.1-sol` / `low`, ChatGPT subscription                                                  |
| Live duration / shell commands | 183.470 seconds / 8                                                                                      |

The executable is resolved from the parent PATH, canonicalized, checked and recorded with its version
before child environments are restricted. Preparation, authentication, offline contracts, the coding
launcher and the runtime executor use the same resolution mechanism. No user-specific executable
path is hardcoded. The actual resolved path is in `codex-executable.json` and the session record.
Regressions cover a child PATH without Codex, a missing/non-executable file, and durable spawn-error
logs. An actual CLI-to-loopback fixture executes a coding tool before a live session can start.

Before this live session, the offline tool contract, reading both installed skills, denying access to
workspace/hidden checks, and `ngc --noEmit` all passed in the prepared environment. The first and second
attempt archives/statuses remain unchanged; whole-tree digests were checked.

## Generated code and materials

The agent read both SKILL.md entrypoints, Select/Dialog indexes and API/styling contracts, common
mistakes, the verification guide, the typed wrapper/nested focus/label examples, and installed Select
types. `read-materials.json` identifies 14 referenced skill files and three installed-package files,
with hashes and command IDs. The original journal retains the recorded command outputs. This is
command evidence, not a complete filesystem syscall audit.

The final code contains a standalone `AppSelect` with typed `value`/`valueChange`, `disabled`, and
required `label`, public Select imports and a non-modal child Select inside the modal Dialog. Parent
signals retain the selection across Dialog destruction/recreation. Styling uses application tokens
in consumer CSS; no repository helper, workspace alias or ready-made fixture is imported. The installed
library matches the original tarball byte-for-byte.

## Independent results

| Check                                                                     | Result                                                                                   |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- |
| Production consumer build / strict templates                              | Passed                                                                                   |
| Public secondary imports / no workspace build inputs                      | Passed                                                                                   |
| Independent parent with strict wrapper bindings                           | Passed                                                                                   |
| Selection persistence, nested Escape, modal focus and trigger restoration | Passed, frozen scenario 1                                                                |
| External value, one callback/payload, dynamic accessible name             | Passed, frozen scenario 3                                                                |
| Disabled, external values and re-enabling in the independent parent       | Passed, frozen scenario 4                                                                |
| Disabled/re-enable in the generated Dialog                                | Frozen scenario 2 failed; supplemental diagnosis and real-navigation verification passed |

Scenario 2 opens Dialog while Select is disabled. The native disabled Select cannot take focus, so
initial focus correctly lands on Done. `trigger.press('Enter')` at line 89 attempts to focus the
disabled trigger but sends Enter while Done remains focused. A native click on Done closes Dialog;
the test subsequently times out looking for Done. The trace and captured native events demonstrate
the target. This is not a Select value change, disabled bypass or incorrect Dialog dismissal.

The supplemental check verifies Tab/Shift+Tab skip the disabled Select, a pointer attempt does not
open it or change its value, externally supplied Public renders, and selection works after re-enabling.
It also verifies focus restoration and cleanup. No application errors occurred. It uses the unchanged
production build and real keyboard/pointer events, not internal handlers. The original four tests,
criteria, raw failed report and browser result were preserved.

## Problems separated

- **Environment:** the sandbox's heredoc temporary-file restriction broke the first write command.
  The agent recovered using its patch tool within the same session, then strict compilation passed.
  The production builder still aborted inside the sandbox with the disclosed exit 134; the independent
  outside-sandbox build passed. Git's xcrun cache writes were also denied without preventing the diff
  check. These did not cause a second live session.
- **Implementation:** no component defect was confirmed by the completed build/interaction criteria.
  There were no human source corrections. This does not establish behavior beyond this task.
- **Evaluator:** the disabled `locator.press` false negative is confirmed. The mechanical raw verifier
  labeled its nonzero suite result `implementation-failed`; `assessment.json` separates that raw status
  from the reviewed finding. Raw result: 3/4. Supplemental result: 2/2.
- **Skills:** no missing instruction blocking this task was demonstrated. The agent used the intended
  contracts, nearby examples and installed types. The evaluator's keyboard mistake is not evidence
  of an API or skill defect.

The [test follow-up is completed separately](REPORT-REEVALUATION-V2.md): both disabled cases now use
real Tab/Shift+Tab navigation with expected enabled focus targets. Historical inputs/results remain
unchanged. No primitive API or skill change was needed.

## Evidence and scope

The separate archive is `dist/consumer-generation/2026-11-15-third/`. It contains the initial scaffold,
frozen inputs, executable/version, every preparation step, authorization status, JSONL journal,
material hashes, final answer, complete generated patch/source, builds/stats, original four-scenario
results/traces, supplemental diagnosis/traces and a screenshot. The external consumer/dependencies
remain at the path in its preparation record. [verification-third.json](verification-third.json)
provides the portable summary.

`report.json` remains the original raw verification result. `assessment.json` records the separate
reviewed conclusion: the task's component behavior was verified, with a known defect in the frozen
test. This is one observed coding result, not a fully green frozen suite or an estimate of general
model reliability. Chromium only; there is no visual score, screen-reader certification or claim
about other consumer applications. No additional live coding session was started to improve the outcome.

CLI-reported usage is retained as returned: input 331,580; cached input 293,248; output 7,773;
reasoning output 96. It is not converted into subscription percentages. Credentials were not saved.
