# First consumer coding attempt — 2026-11-15

**Outcome: infrastructure failure before implementation. One live Codex session; no retry.**
The agent could not execute file/shell tools, read the installed skills or change the scaffold.
No conclusion about Radix NG skills or the model's ability to implement AppSelect can be drawn.

## Versions and provenance

| Input                                  | Observed value                                                                          |
| -------------------------------------- | --------------------------------------------------------------------------------------- |
| Repository and installed GitHub bundle | `d000174e3fb69ef5424b73492d73f34b84e3c80f`                                              |
| Installed skills                       | `radix-ng`, `radix-ng-examples`, matching the published revision and local bundle bytes |
| Installer                              | `skills@1.8.1`, public `radix-ng/primitives/skills` subpath, project-scoped copy        |
| Library                                | `@radix-ng/primitives@1.3.0`, local build packed and installed outside the workspace    |
| Tarball SHA-256                        | `bbe21d90d2e03937f8d9c7a856ac7ceb81a972a247d7f3f40ecf4e82aaeac750`                      |
| Angular / TypeScript                   | `22.0.2` / `6.0.3`                                                                      |
| Node / pnpm / Playwright               | `24.22.2` / `11.5.1` / `1.60.0`                                                         |
| Codex CLI / model / effort             | `0.169.0` / `gpt-6.1-sol` / `low`                                                       |
| Authentication                         | ChatGPT subscription; no API fallback                                                   |
| Duration / executed shell commands     | 18.290 seconds / 0                                                                      |

Both Select and Dialog API/styling contracts report library version 1.3.0. The scaffold contained no
Select/Dialog implementation. The skills' installed example shards were allowed context, but the
agent never obtained tool access to read them. Workspace sources, the captured GitHub clone and
independent checks were denied by a filesystem preflight.

## Failure and independent observations

The launch configuration mistakenly disabled `code_mode_host`. This flag is appropriate for neither
the ordinary coding session nor its file/shell tool router. The CLI reported
`code-mode host is disabled`; the agent accurately reported that it could not access the project.
Its exit code was zero because the session ended normally, not because a component was implemented.

- The complete generated diff is empty. Source, protected configuration and both installed skills
  match their pre-session hashes. Agent self-corrections: zero. Evaluator source corrections: zero.
- The unchanged blank application passes a production Angular build outside the sandbox. This is
  preparation evidence only; it is not a generated-component success.
- The independent parent build fails with TS2307 because `./app-select` does not exist. A separate
  pnpm dependency-location failure while preparing that probe was retained, then bypassed by invoking
  the same installed Angular CLI directly. No generated source was repaired.
- Chromium renders the original heading, with zero Dialog triggers and zero comboboxes and no
  application errors. Its screenshot and trace are retained. The four planned behavior tests are
  blocked by missing implementation; keyboard, disabled and nested focus behavior were not tested.

Other preparation issues were resolved or disclosed before generation: native standalone pnpm hung
in the restricted environment; local JS pnpm and an absolute script shell worked. The Angular
production builder exited 134 inside the sandbox even for the blank scaffold, while strict
`ngc --noEmit` worked. The prompt disclosed that limitation. An initial `ngc` command without
`--noEmit` hit TypeScript 6's rootDir/output-layout requirement. These are infrastructure observations,
not errors attributed to the model or skills.

## Fixes and justified improvements

After preserving the used configuration, `features.code_mode_host=true` replaced the disabled host.
A deterministic regression now drives the actual CLI through a loopback fake provider, invokes a
fixed `exec_command`, and confirms the result returns in the next request without authorization.
Both configuration and real-tool contract checks pass. The launcher requires this offline preflight
before spending subscription usage on any future run. This is not another live model attempt.

Keep coding-session tool configuration separate from snapshot/query/act transport restrictions.
Record native-tool failures separately from normal CLI termination and independent task success.
Preserve production compilation as an independent gate even when a sandbox compiler fallback is
needed. These changes address demonstrated harness defects.

**No skill instruction improvement is justified by this run:** the agent did not read the skills.
Claims that a binding, composition recipe or focus instruction was missing would be speculation.
A separately requested attempt with the fixed launcher is needed to examine those questions. Do not
replace this infrastructure failure with the result of a later attempt.

## Evidence and limits

Full local evidence is mirrored under `dist/consumer-generation/2026-11-15-first/`; the external app
and dependencies remain at the path in `dist/consumer-generation/latest.json`. The mirror includes
the prompt, actual scaffold, original frozen inputs/configuration, JSONL journal, final answer,
empty patch, build results, independent-host failure, browser screenshot/trace and report. Neither
directory is staged automatically. [verification.json](verification.json) is the small portable record.

CLI-reported usage: input 32,423; cached input 21,376; output 303; reasoning output 36 tokens. These
fields are retained as reported and are not converted into subscription percentages. Credentials are
not part of the artifacts. This is one infrastructure-limited attempt on one macOS/CLI/model setup,
not a model-quality baseline, accessibility certification or generation-reliability estimate.
