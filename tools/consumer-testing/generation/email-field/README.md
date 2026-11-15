# AppEmailField coding experiment

One independent Codex subscription session implements a standalone consumer component over Radix NG
Field with Angular Reactive Forms. The parent owns the supplied `FormControl<string>`, validation,
disabled state, reset and submission. Application CSS provides the appearance.

The completed [first run](REPORT.md), `2026-11-15-email-field-first`, passed both production builds
and **8/8 Chromium cases**. One live session was used; there were no evaluator code repairs or retries.
[verification.json](verification.json) retains the portable outcome, versions and hashes.

The [prompt](prompt.md), [public contract and criteria](criteria.json), blank `scaffold-app.txt`,
independent `probe-app.txt` and eight [Chromium cases](generation.spec.ts) are frozen before generation.
Four behaviors run against each host: label/description and initial/blur errors; validation and two-way
control updates; disabled navigation/editing and external values; reset and exactly-once submission.
The independent parent contains no Field implementation and is inaccessible to the coding session.
The tests use native pointer/keyboard events and expected Tab targets around a disabled input.

Preparation reuses the first experiment's immutable tarball, blank toolchain and installed consumer
skills snapshot `d000174e3fb69ef5424b73492d73f34b84e3c80f`, replacing only the blank heading. No
ready-made consumer solution is copied. Versions remain library `1.3.0`, Angular `22.0.2`, TypeScript
`6.0.3`, Node `24.22.2`, pnpm `11.5.1` and Playwright `1.60.0`. Model: `gpt-6.1-sol`, effort `low`.

Use the shared launcher and preparer with this task's input directory:

```bash
RUN_CODEX_CODING_CONTRACT=1 node --test tools/consumer-testing/generation/codex-contract.test.mjs
node tools/consumer-testing/generation/prepare-pinned.mjs NEW_EMAIL_ATTEMPT_ID \
  tools/consumer-testing/generation/email-field
```

The preparer must complete the real coding-tool contract, both skill reads, source/fixture isolation
and strict `ngc --noEmit` in the restricted environment. It records spawn failures too. A successful
preparation is required before the following **single live session**, only for an authorized attempt:

```bash
node tools/consumer-testing/generation/code.mjs /absolute/prepared/path/consumer
node tools/consumer-testing/generation/verify.mjs /absolute/prepared/path/consumer
```

The launcher refuses an existing coding-run record and any changed task inputs. The verifier builds
the generated app and a separate parent with unchanged strict settings, audits public imports and
build isolation, then runs Chromium. The evaluator never repairs generated source. Self-corrections
within the coding session are retained; there is no automatic repeat after failure.

Reports, scaffold, frozen inputs/hashes, journal/material references, complete diff/source, build logs,
browser results/traces and toolchain versions belong in a separate gitignored attempt archive. Earlier
AppSelect archives remain unchanged. This is one task, not an estimate of general reliability or an
accessibility certification. No visual baseline is used.
