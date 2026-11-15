# Third output — checks-v2 reevaluation

**`2026-11-15-third-reevaluation-v2`: 4/4 Chromium scenarios passed, no retries, no new live session.**
Both production builds passed with the original strict template settings. The generated AppSelect,
application source, library and installed skills were unchanged. This reevaluates the third coding
result; it is not another generation attempt or an estimate of general reliability.

## Correction and observed behavior

The historical disabled test tried `locator.press('Enter')` on a native disabled button. That cannot
focus the Select; Enter instead activated the focused Dialog `Done` button. Checks version
`appselect-consumer/2` replaces that operation in both disabled scenarios:

- In the generated Dialog, initial focus lands on `Done`; Tab and Shift+Tab return to `Done`, skipping
  the disabled Select. A forced pointer click leaves Dialog open, Select closed and Public unchanged.
- In the independent parent, Tab moves from the checkbox to the test-owned `After select` button;
  Shift+Tab returns to the checkbox. The button is the only addition to this version's parent fixture,
  providing a stable focus target after the Select. The original parent and generated component were
  not edited.
- Pointer attempts do not open Select, change the selected value or emit `valueChange`. Externally
  supplied values still render without an output event. After enabling, keyboard navigation focuses
  Select, Enter/ArrowDown/Enter selects Public, and focus returns to the Select trigger. The independent
  parent records exactly one output with payload `public`.

| Corrected Chromium scenario                                                          | Result |
| ------------------------------------------------------------------------------------ | ------ |
| Selection persistence, nested Escape, modal focus and both trigger restorations      | Passed |
| Disabled/external binding and keyboard selection after enabling in generated Dialog  | Passed |
| Independent parent: external values, callback count/payload, dynamic accessible name | Passed |
| Independent parent: disabled keyboard/pointer, external values, enabling and focus   | Passed |

All cases use real browser events and waiting assertions, monitor `pageerror`/console errors before
navigation, and start in fresh contexts. No browser errors were observed. The static production
builds were served without a dev-server fallback. The four cases took 3.955 seconds including server
startup; the complete reevaluation took 11.023 seconds.

## Fixed inputs and check hashes

The source hash matches the immutable third generation before and after evaluation. Its full tree
digest is `a93040edc1d292a8a9fba75a6eade3b24835344fb4c368f7a244ceededaa5ffe` (five files).

| Source                  | SHA-256                                                            |
| ----------------------- | ------------------------------------------------------------------ |
| `src/app/app-select.ts` | `86de211b2f4b4b0d995b086c4f0339d11fb10061a7d8f35b12a0bd87ceb736bd` |
| `src/app/app.ts`        | `101e6e10dddac8a1a9cc442807eeb137d2f9a19e1f4983c19ab9c11988bd21a4` |
| `src/index.html`        | `ffb5a776db3eb0acaecb7ea55e7f2ed806e0ac629754310413e25c003d0a2cac` |
| `src/main.ts`           | `0a9d22dcff54fd8c11effc8e871f02f6720ef47ff47c5ca74eac0d918a064538` |
| `src/styles.css`        | `677d56a8f754453149ed5698fe9906e84e1cc6b9dafcf887558364455b5c9f66` |

| Checks version `appselect-consumer/2` | SHA-256                                                            |
| ------------------------------------- | ------------------------------------------------------------------ |
| `generation-v2.spec.ts`               | `db82038c2ba9ae8a08e5764e10e2836187379f25f6b4e9aaf921b4a4aba2fcf7` |
| `playwright.reevaluation.config.ts`   | `b17ac82a39c6475c65f8e59fd1fb1adcfde8a977b6413179fbaef7a90f927214` |
| `probe-app-v2.txt`                    | `740087c84f7fe3ab219a7bf32a85ea887c88753885fa73aff215a9951c9913b9` |
| `reevaluate-browser.mjs`              | `00c6bde2a3b846ee5d04451a68e6680dd7a6747e73470be42d281a8a87f5f56c` |

Node `24.22.2`, pnpm `11.5.1`, Angular `22.0.2`, TypeScript `6.0.3`, library `1.3.0`, Playwright
`1.60.0`, Chromium `148.0.7778.96`. Skills remain at
`d000174e3fb69ef5424b73492d73f34b84e3c80f`; their hashes and library integrity match the
[third attempt](REPORT-THIRD.md). Base repository revision at evaluation:
`e4b31f7c02b4c84343585aa25f94949380010f1a`; the new uncommitted checks are identified by hashes above.
The original model/effort remain `gpt-6.1-sol` / `low`; no model was called for this reevaluation.

## Reproduction and preserved evidence

```bash
RADIX_GENERATION_PORT=4511 node tools/consumer-testing/generation/reevaluate-browser.mjs
```

The completed run is in `dist/consumer-generation/2026-11-15-third-reevaluation-v2/` with its own
`report.json`, `browser-results.json`, four traces, frozen v2 checks, source snapshot, two production
builds/stats and logs. [reevaluation-v2.json](reevaluation-v2.json) is the portable result with hashes.
The retained external consumer/dependencies are required; this command does not download newer
skills or rebuild the library. For another offline run pass the pointer and a fresh ID as documented
in [README.md](README.md); an existing result cannot be overwritten.

Focused validation also passed: strict standalone TypeScript checking of the new spec/config,
ESLint with `--max-warnings=0`, Prettier on changed files and `pnpm agents:check`. Exact commands,
exit codes and logs are saved separately in the reevaluation's `validation.json` and adjacent logs.

Before/after digests match for all three original archives, including the raw **3/4**, supplemental
**2/2**, original `report.json`, frozen tests and original parent. Their statuses and historical reports
were not rewritten. There were zero human component corrections. The oracle correction was made
after generation and is disclosed separately. Only Chromium and this task's observable criteria were
checked; there is no visual score or claim about other browsers or applications.
