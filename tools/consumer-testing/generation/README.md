# One consumer coding experiment

This experiment asks an ordinary Codex coding session to implement a reusable AppSelect inside a
Dialog in a blank external Angular application. It is separate from the maintained consumer fixtures
and from `tools/agent-testing`, which operates an already implemented UI through runtime commands.

The separate [AppEmailField experiment](email-field/README.md) uses the same launcher and pinned
environment for a parent-owned Reactive Forms control. Its contract, independent parent and eight
browser cases are frozen separately; it does not reuse an AppSelect implementation or result.

The [AppTabs experiment](tabs/README.md) freezes a projected `hostDirectives` wrapper contract,
independent two-instance parent and 36 checks across three engines. It distinguishes manual focus
from activation and tests Tabs' focusable disabled items using the installed contract.

The [cross-browser reevaluation](cross-browser/REPORT.md) checks both saved implementations with
their original dependencies. Its final 36-case matrix passes in Chromium, Firefox and WebKit; the
initial 35/36 result and a native WebKit pointer-focus reproduction remain separate evidence. No
additional generation or component repair was involved. See [its commands](cross-browser/README.md).

[REPORT.md](REPORT.md) records the first attempt: **infrastructure failure, no generated component**.
One live session was used; it could not read skills or execute commands because its tool host had been
disabled. That launcher fix was initially checked offline only. This attempt establishes no model/skill
generation-quality result, and it was not replaced with a successful retry.

The separately authorized [second attempt](REPORT-SECOND.md) pinned the same inputs. Its offline tool
and skill-read checks passed, but a preparer executable-lookup error stopped it before a live session.
It is retained separately with no automatic retry; the first result remains unchanged.

The [third attempt](REPORT-THIRD.md) completed a real coding session. The component passes production
and independent-parent builds. Its unchanged frozen browser suite records 3/4; supplemental native
focus/event evidence identifies an evaluator false negative in the fourth result. Raw and reviewed
outcomes are retained separately, without edits to generated source or another live session.

The separate [checks-v2 reevaluation](REPORT-REEVALUATION-V2.md) passes **4/4** on that same third
generation. It corrects disabled keyboard targeting in both cases and retains the original 3/4,
supplemental 2/2 and frozen inputs. No additional coding session was started.

## Inputs and isolation

- [prompt.md](prompt.md) defines the product task and observable public wrapper API without supplying
  a Select/Dialog implementation. [criteria.json](criteria.json), [generation.spec.ts](generation.spec.ts)
  and [probe-app.txt](probe-app.txt) were frozen before the live session.
- `prepare.mjs` copies only the existing consumer toolchain manifests/configuration. Its initial App
  is a heading and an unimplemented-task message. CSS contains application-owned tokens and native
  resets. No maintained consumer component fixture is copied.
- `../environment.mjs` is shared with the existing integration check: GitHub/skills.sh installation,
  discovery of exactly two skills, byte-for-byte revision matching, library build/pack and isolated
  installation. This experiment uses a local tarball, not a claim about a registry release.
- The coding session receives only the consumer, its installed dependencies and consumer skills.
  Project instructions/global skills/plugins/web tools are excluded. It is told to read the two
  installed SKILL.md files explicitly. Its filesystem policy denies workspace sources, sibling
  evidence/source clones and user data, reopening the consumer and required tool executables.
  System runtime files remain readable; model shell commands have no network access.
- `probe-app.txt` is an independent parent using the declared AppSelect inputs/output. It is never
  copied into the coding project; after generation it belongs in a separate probe copy. It contains
  no Select implementation. The main application tests the agent's own Dialog composition.

Codex uses the existing ChatGPT login. API-key variables are excluded, and no API fallback is used.
The profile follows the official [permissions documentation](https://developers.openai.com/codex/permissions).
Do not add `--sandbox`: older sandbox settings override named permission profiles. This setup was
checked on macOS with the pinned CLI; other platforms are unverified.

## Commands for a separately authorized future attempt

Use Node from `.nvmrc`, pnpm and a ChatGPT-authenticated Codex CLI. First run the deterministic
preflight. It connects the actual CLI to a local fake provider and executes a fixed shell command;
it does not contact a model, use subscription allowance, or modify the real login.

```bash
RUN_CODEX_CODING_CONTRACT=1 node --test tools/consumer-testing/generation/codex-contract.test.mjs
node tools/consumer-testing/generation/prepare.mjs
```

For the pinned comparison used by the second and third attempts, use the preserved first scaffold,
tarball and installed skill snapshot instead of fetching current HEAD:

```bash
node --test tools/codex/executable.test.ts tools/consumer-testing/generation/commands.test.mjs
node tools/consumer-testing/generation/prepare-pinned.mjs NEW_ATTEMPT_ID
```

The preparer resolves Codex to an absolute executable in the parent environment and records its
version before restricting child PATH. Every CLI caller uses that descriptor, including login and
offline tests. Failed spawns get both a text log and a JSON error record. Preparation runs the actual
coding-tool contract, skill-read/isolation check and strict Angular compiler before reporting success.

Preparation prints the external directory and writes a local pointer to
`dist/consumer-generation/latest.json`. It installs through the documented GitHub subpath with the
same pinned installer as the consumer integration check. Keep that external consumer outside this
workspace. The following command starts **one live coding session**, only when a new attempt is
requested:

```bash
node tools/consumer-testing/generation/code.mjs /absolute/prepared/path/consumer
```

The launcher now runs the actual offline coding-tool contract before a live request. It rejects a
consumer that already has a coding-run record, freezes the prompt/check hashes, records JSONL events
incrementally, and limits the session to 15 minutes and 80 commands. Agent self-corrections belong to
that same session. A CLI exit code of zero describes session termination, not task success.

The isolated environment uses project-local JS pnpm 11.5.1 and an absolute script shell. On this
machine the production Angular builder aborted inside the sandbox even on the blank app. Strict
`pnpm exec ngc -p tsconfig.app.json --noEmit` worked; `--noEmit` avoids the TypeScript 6 rootDir/output
layout error. The frozen prompt disclosed this limitation. Production builds and independent browser
checks run outside the coding sandbox, with no evaluator edits to generated source.

## Independent verification and evidence

Before inspecting generated source, retain its complete Git diff (including new files), snapshot and
the exact journal. Check the protected manifests/configuration and installed skills against their
preparation hashes. Build the consumer with its unchanged strict settings and inspect build stats
for workspace inputs; check that Radix imports use exported package entry points.

To check the reusable wrapper separately, copy the generated source/configuration to a sibling
`probe/`, replace only that copy's root App with `probe-app.txt`, and resolve the same installed
dependencies there. Run the installed Angular CLI directly from that directory if pnpm rejects a
dependency-location symlink. Preserve such setup failures separately. Do not repair the generated
AppSelect in either copy. Once both builds exist, the frozen checks run with:

```bash
RADIX_GENERATION_DIR=/absolute/prepared/path/consumer \
  pnpm exec playwright test -c tools/consumer-testing/generation/playwright.config.ts
```

`node tools/consumer-testing/generation/verify.mjs /absolute/prepared/path/consumer` retains the full
diff/source, checks public imports and dependency integrity, runs both builds and the four tests, and
writes a new report. It refuses to overwrite an existing result. Nonzero test results remain failures
in the raw report and need review; do not infer an implementation defect from a test exit code alone.
The separate `diagnose-disabled.mjs OUTPUT_DIRECTORY STATIC_BASE_URL` diagnoses the third attempt's
known keyboard-targeting issue without editing the frozen tests or the generated application.

For corrected checks against the retained third output, run the offline reevaluator with a fresh ID:

```bash
RADIX_GENERATION_PORT=4511 node tools/consumer-testing/generation/reevaluate-browser.mjs \
  dist/consumer-generation/2026-11-15-third.json NEW_REEVALUATION_ID
```

This command never invokes Codex or a provider. It checks the retained source/package/skill hashes,
builds two new external copies with the installed Angular CLI, runs `generation-v2.spec.ts`, and saves
logs, test sources/hashes, results and traces in a separate directory. It refuses an existing ID and
compares all three historical archives before/after. The corrected independent parent adds only an
enabled button after AppSelect so Tab/Shift+Tab have explicit focus targets. AppSelect itself remains
byte-identical. The original `generation.spec.ts`, config and parent remain frozen for historical runs;
do not use their known disabled `press` mistake to evaluate new results.

The two static servers serve external production builds, with no dev fallback. Chromium checks names,
parent value, callback payload/count, disabled keyboard/pointer behavior, nested Escape, modal focus
and focus restoration after overlay animations. There is no visual score. Four passing reference
tests would establish this task's observed integration result, not general LLM reliability.

Retained artifacts include preparation logs/versions/hashes, the exact published bundle revision,
scaffold, frozen inputs, prompt, CLI arguments/configuration, journal, final answer, generated patch,
production/independent-host build results, screenshots/traces and a report. Generated source fixes by
the evaluator must be separate from agent self-corrections. The first attempt has none of either.
Local evidence is gitignored and never staged automatically. Missing implementation, unavailable
observations and infrastructure failures are explicit; a blank scaffold build is not a task success.
