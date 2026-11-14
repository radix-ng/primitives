# Baseline follow-up tasks

## Resolved: restriction explanation oracle rejects an unchanged value description

Classification: result verification error (false negative), not a runtime error or an observed model
restriction bypass. Found in the local Codex subscription baseline dated 2026-11-14:
`final/attempt-2/disabled-W3fq70/report.json` under `dist/agent-testing/codex-baseline-2026-11-14/`.

The model received a real snapshot with both requested controls disabled and answered:

> Both controls are disabled, so no changes were made. The project remains “Radix project” with Visibility set to Private.

Independent assertions confirmed unchanged UI/model/runtime state, both restrictions and normal
executor completion; diagnostics were empty. Only the final explanation assertion failed.
`explainsRestriction('disabled', text)` treats the word `set` in the unchanged Private description as
a successful edit claim because its clause has a task subject without a preceding denial.

The original report remains failed in the historical baseline. No oracle code or assertion was changed
during that baseline. The subsequent fix is versioned as `restriction-oracle/2`: a passive description
such as "Visibility set to Private" is accepted only when it matches the independently captured final
control value or selected option label. An active edit claim, a past edit, or a contradictory description
of Public / Agent workspace / Archived still fails. Tool-observed restriction evidence, independent
UI/model assertions and final runtime confirmation remain required.

The exact response first failed a Node regression on the old implementation, then passed with the fix.
Focused tests cover matching/mismatching final state, false success and missing discovery. Browser
regressions accept the exact answer after a snapshot, reject it without model tool evidence, and reject
a contradictory Public description after a snapshot.

Offline reevaluation reads the retained initial/final reports and writes separate evidence:

```bash
node tools/agent-testing/reevaluate.ts \
  dist/agent-testing/codex-baseline-2026-11-14 \
  dist/agent-testing/restriction-oracle-reevaluation
```

`reevaluation.json` and `reevaluation.md` record source report paths/hashes, old/new verdicts and the
oracle version/source hash. Initial remains 6/6; final changes from 11 to 12 passed among 12 completed
runs. The interrupted thirteenth run stays interrupted and failed. Only the disabled false negative
changes verdict. The 121 historical baseline files, including original reports and summaries, were
checked against SHA-256 hashes captured before this fix and remain unchanged.

This reevaluation reuses recorded independent browser assertions; it does not rerun the model or
reconstruct historical UI from text. Separate deterministic browser checks use the current application.
No new live requests were made. The explanation check remains a bounded English heuristic, not a
general semantic judge.
