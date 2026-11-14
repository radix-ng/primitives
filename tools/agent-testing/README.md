# Local Agent Playground executor

This opt-in experiment gives a real OpenAI model exactly three tools against the existing
`/playground/agents` application: `snapshot`, `query`, and `act`. A local Node process runs the model
loop and Playwright. The frontend has no model SDK, credential, chat UI, WebMCP server, or npm adapter.
See [the runtime contract](../../docs/engineering/agent-playground.md) for primitive behavior.

## Run a real model

From the repository root, use Node from `.nvmrc` and the repository's pnpm version. Install Chromium
once with `pnpm exec playwright install chromium`. Build and serve the composed production site:

```bash
pnpm build-site
pnpm exec http-server dist/radix-site -a 127.0.0.1 -p 4496 -c-1
```

In another terminal, set `OPENAI_API_KEY` through your local shell/secret manager and choose a model
available to your API account. `OPENAI_MODEL` supplies its ID; `--model` overrides that ID. No model
is selected implicitly. ChatGPT/Codex login credentials are not reused as API credentials.

```bash
pnpm agent:run --scenario all --model YOUR_MODEL_ID
pnpm agent:run --scenario settings --model YOUR_MODEL_ID
pnpm agent:run --task 'Rename the project to Release workspace and make it Public.' --model YOUR_MODEL_ID
```

`--api-key-env VARIABLE` selects an already defined credential variable. Keys are not CLI arguments,
sent to the page, forwarded into the browser environment, or included in reports. The backend uses
the official OpenAI SDK against `https://api.openai.com/v1`; it does not use `OPENAI_BASE_URL` or another
provider. Provider errors retain a safe HTTP status, never the HTTP body or headers. Exact credential
values are also redacted before JSON/JSONL evidence is written. Do not put secrets in tasks or UI data.

Useful configuration:

```bash
pnpm agent:run --help
pnpm agent:run --list
node tools/agent-testing/run.ts --schemas > /tmp/radix-runtime-tools.json
pnpm agent:run --scenario rename --model YOUR_MODEL_ID \
  --max-steps 16 --max-tool-calls 48 \
  --request-timeout-ms 30000 --total-timeout-ms 180000 \
  --max-output-tokens 2048 --out dist/agent-testing
```

`--reasoning-effort` is optional; choose an effort supported by your model. Output tokens include
reasoning where applicable. An incomplete response is a provider error, not a successful completion.
The step limit counts model requests; the separate tool limit also bounds an unexpected batch.
The request timer covers the full SDK call, and the total timer covers preparation, the agent loop,
and independent verification. Timeouts/SIGINT abort requests, close the owned context and retain the
available evidence. If the page has disappeared, a final snapshot or screenshot can be unavailable;
the report records that instead of presenting an old observation as final state.

`--base-url` accepts only a loopback HTTP(S) origin and always opens `/playground/agents`. Serve a fresh
build from this checkout. The recorded source revision identifies the checkout, not a cryptographic
source-to-build attestation of an independently started server. The Playwright trace retains the
actually loaded application resources. The executor does not start or stop your HTTP server.

## Boundary and schemas

[protocol.ts](../../apps/radix-playground/src/app/agent-runtime/protocol.ts) defines the Zod validators;
[schemas.ts](schemas.ts) exports their JSON Schemas and tool descriptions. Input objects reject unknown
fields. `query` has exact optional `id`, `kind`, and `name` filters. `act` requires `id` and `action`;
`value` is a required string for `set-value`/`select-option` and is forbidden for `open`/`close`.

OpenAI tools explicitly use `strict: false`: strict provider mode requires every field to be required,
which would change the runtime's optional query filters and action-dependent arguments. The executor
validates every call locally using the same schemas before executing it, and validates every result.
The backend advertises no built-in browser, shell, JavaScript, or additional tools. Browser evaluation
uses a fixed switch; model arguments are passed as data to the captured `window.radixAgentRuntime`.

| Result                               | Meaning                                                                                                                                                                                                                                                                                        |
| ------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `query: matched`                     | Exactly one control, returned in `matches`.                                                                                                                                                                                                                                                    |
| `query: ambiguous`                   | Multiple controls, all returned; the executor never picks one automatically.                                                                                                                                                                                                                   |
| `query: not-found` / `invalid-query` | No matches / invalid filters.                                                                                                                                                                                                                                                                  |
| `act: applied`                       | Returned before/after describe an actual state change.                                                                                                                                                                                                                                         |
| `act: unchanged`                     | No state change. An open Select selecting its current value can still close and return `applied`.                                                                                                                                                                                              |
| `act: canceled`                      | A primitive callback vetoed the request; inspect actual before/after.                                                                                                                                                                                                                          |
| `act: refused`                       | An explicit code explains the refusal. `unknown-id` means absent/destroyed before execution; `destroyed` means disposal during settling. Other codes include `unsupported-action`, `invalid-command`, `invalid-arguments`, `unavailable`, `disabled`, `read-only`, `busy`, and `action-error`. |

The executor additionally stops on an unknown tool, invalid arguments/results, or an `act` ID not
observed through an earlier snapshot/query. It returns explicit reasons for step/tool/time limits,
provider errors, navigation, missing/replaced runtime, browser errors and interruption. Navigation
invalidates the captured boundary, even if the user subsequently returns to the page. Modal and
disabled/read-only restrictions are rechecked by the runtime at execution; old observations confer
no authority. UI names, values, option labels and tool messages are data, never executor instructions.

Responses history is append-only. SDK normalization preserves replayable reasoning and assistant
message `phase`; tool results return as `function_call_output`. `store: false` requests no stored
Responses state; this is not a claim about all provider retention policies. SDK automatic retries
are disabled so request failures and limits remain observable. Implementation references:
[function calling](https://developers.openai.com/api/docs/guides/function-calling),
[conversation state](https://developers.openai.com/api/docs/guides/conversation-state), and
[preserving the prefix](https://developers.openai.com/api/docs/guides/preserved-reasoning).

## Independent scenarios

Each scenario owns a fresh browser context, the original form model and a separate evidence directory.
Preparation checks the initial model and applies constraints through the demo's real checkboxes before
the model starts. The model receives a goal in ordinary text, without a prescribed tool sequence.

| CLI scenario | Goal and independent success criteria                                                                                                                                                                  |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `rename`     | Project name becomes `Agent workspace`, Visibility becomes Public; UI, form model, runtime and one callback per edit agree.                                                                            |
| `settings`   | Dialog opens; Change note becomes `Ready for production`, Environment becomes Production; UI was observed displaying both, the model retains them, and Dialog/Select close and registrations clean up. |
| `canceled`   | Preparation enables value cancellation; the attempted rename emits a canceled callback/result, values remain original, and the final answer acknowledges cancellation.                                 |
| `disabled`   | Preparation disables the form; values remain original and the answer acknowledges the restriction. Correctly declining based on snapshot flags is allowed.                                             |
| `read-only`  | Preparation makes the form read-only; values remain original and the answer acknowledges the restriction.                                                                                              |
| `archived`   | The disabled Archived option is handled without changing the value or bypassing the restriction.                                                                                                       |

The observer reads actual UI values and the published Signal Forms model after actions, separately
from tool results. These observations are evidence, not extra model tools. Final checks also inspect
controlled open bindings, callback counts/payloads, overlays and the final registry. A model's
“done” response alone fails the oracle. Obstacle explanations have a small English phrase check;
this is a bounded task check, not a general semantic judge.

For an arbitrary `--task`, UI/model/runtime consistency is still checked, but no semantic goal oracle
is invented: `goalChecked` is false and `passed` is null. `integrationPassed` and the exit code describe
execution/consistency only. Named scenarios set `passed` from the independent task assertions.

## Evidence

Default output is the gitignored `dist/agent-testing/`. No script stages or commits artifacts.
Each run has its own directory containing:

- `metadata.json`: mode (`live` or `deterministic`), task, instructions, model/parameters/limits, tool
  schemas, Git commit, dirty flag, patch hash and a source digest including untracked executor code.
- `events.jsonl`: ordered requests, normalized responses, tool calls, results and termination; written
  incrementally. `report.json` also retains the full event list, usage per response when supplied,
  steps/calls, duration, final snapshot, independent assertions and their result.
- `observations.json`: UI/model observations after actions, written incrementally when available.
- `final.png` and `trace.zip`: final UI and browser evidence when the context remains reachable.

Keep artifacts private when tasks or values are sensitive. They intentionally contain task and UI data;
only credentials are excluded/redacted. Each report labels unavailable observations and termination.

## Deterministic verification

```bash
pnpm agent:typecheck
pnpm agent:test
pnpm build-site
pnpm agent:test-browser
pnpm exec playwright test -c apps/visual-regression/playwright.playground.config.ts
pnpm agents:check
```

Node tests use scripted replies/fake HTTP transport for success, refusals, cancellation, invalid calls,
timeouts, step/tool limits, schema contracts, credential handling, and SDK wire/history behavior.
Playwright executor checks use the real app and bridge with an explicitly scripted backend; they cover
all six oracles, false success, runtime loss/navigation, timeout cleanup and evidence. The runtime suite
also checks modality with stale observations, canceled repeated selection/focus and Dialog spacing in
real browsers. Both configs share the existing composed-site static server helper.

These checks do **not** invoke a model or estimate LLM task quality. Live runs require API access and
are separately labeled and reported. This implementation was checked without provider credentials;
no live model run is claimed. Real-model reliability, prompt injection robustness, other applications,
screen readers, production hosting and additional providers remain outside this experiment.
