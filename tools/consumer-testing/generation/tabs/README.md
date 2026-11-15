# Projected AppTabs coding experiment

The completed [first attempt](REPORT.md), `2026-11-15-tabs-first`, used one live session and passed
both production builds. Its frozen browser result is **34/36**: Chromium 10/12, Firefox/WebKit 12/12
each. The two Chromium focus failures and a separate render-timing diagnosis are retained, with no
component repairs or replacement generation. [verification.json](verification.json) records hashes,
versions, original outcomes and the supplemental observations separately.

One Codex subscription session builds an application-owned standalone wrapper. Its host composes
`RdxTabsRoot` via `hostDirectives`; its own template contains `RdxTabsList` and projects the consumer's
tab buttons and panels. Value/events, list label and manual activation are part of the frozen
[public contract](criteria.json), repeated in the [product prompt](prompt.md).

The independent `probe-app.txt` contains only consumers of AppTabs, never a wrapper implementation.
Both instances intentionally reuse `account`, `billing` and `security` values to test DI/ID isolation.
Six [browser cases](generation.spec.ts) per host check relationships/visibility, manual focus versus
selection, focusable disabled tabs without activation, external values/events, instance isolation
and forward/backward Tab exit. Two hosts × three engines give 36 cases with fresh contexts and no
retries. Traces are retained for every outcome.

Disabled Tabs are intentionally different from disabled Select: Billing receives arrow focus but
Enter, Space and pointer attempts do not activate it. macOS WebKit uses the established Alt+Tab /
Alt+Shift+Tab convention. Installed types/contracts, not cross-primitive assumptions, define behavior.

The existing pinned preparer reuses the first blank scaffold/toolchain, local library tarball and
installed skills snapshot `d000174e3fb69ef5424b73492d73f34b84e3c80f`. Versions stay library `1.3.0`,
Angular `22.0.2`, TypeScript `6.0.3`, Node `24.22.2`, pnpm `11.5.1` and Playwright `1.60.0`.
Model: `gpt-6.1-sol`; reasoning effort: `low`.

```bash
RUN_CODEX_CODING_CONTRACT=1 node --test tools/consumer-testing/generation/codex-contract.test.mjs
node tools/consumer-testing/generation/prepare-pinned.mjs NEW_TABS_ATTEMPT_ID \
  tools/consumer-testing/generation/tabs
```

The preparer must pass actual offline coding-tool execution, both skill reads, fixture/workspace
isolation and strict `ngc --noEmit` before a live attempt. Freeze the helper files imported by the
tests/config too (`cross-browser/keyboard.ts` and `tools/playwright/browser-projects.mts`). Then, only
for an authorized new attempt, start one session and independently verify its unchanged result:

```bash
node tools/consumer-testing/generation/code.mjs /absolute/prepared/path/consumer
node tools/consumer-testing/generation/verify.mjs /absolute/prepared/path/consumer
```

The shared launcher refuses an existing coding-run record and changed inputs. The evaluator builds
the generated demo and a separate parent with strict templates, checks public imports/build isolation,
reviews hostDirectives/List/projection ownership in source and runs all three engines. It never repairs
generated implementation. Source, dependency/skill identities, initial scaffold, frozen inputs, journal,
materials, complete patch, build logs/stats and browser results/traces remain separate artifacts.
Infrastructure, implementation, checker failures and confirmed skill gaps must be reported distinctly;
a failed attempt is retained without automatic generation retry.

The focused diagnostic can be repeated on a retained build without changing the original suite:

```bash
node tools/consumer-testing/generation/tabs/diagnose-tab-exit.mjs \
  /absolute/prepared/path/consumer dist/consumer-generation/NEW_TABS_DIAGNOSIS
```

It compares back-to-back Enter/Tab with the same navigation after observable selected-state checks.
It saves 18 independent observations/traces (two hosts, three engines, two immediate samples and one
observed-state sample per pair). These are diagnosis results, not a corrected 36-case verdict.
