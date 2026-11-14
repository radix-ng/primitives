# Agent Playground experiment

`/playground/agents` is a local experiment in `apps/radix-playground`. It reuses the playground shell,
theme, primitive styles and navigation. No model, external service or WebMCP is connected. The adapter
is application code under `src/app/agent-runtime`; it is not an npm export or a primitive API.

## Boundary and lifecycle

The page exposes `window.radixAgentRuntime` with three methods while it is mounted. In the browser console:

```js
const snapshot = window.radixAgentRuntime.snapshot();
const found = window.radixAgentRuntime.query({ kind: 'input', name: 'Project name' });
if (found.status === 'matched') {
  const result = await window.radixAgentRuntime.act({
    id: found.matches[0].id,
    action: 'set-value',
    value: 'Agent project'
  });
}
```

`types.ts` is the contract. `snapshot()` and `query()` return detached data and do not log, mutate
controls or move focus. Queries use exact optional `id`, `kind` and `name` filters; multiple matches
return `ambiguous` with all matches. Commands require an instance ID, never a guessed first match.
Names are read from the page's `aria-labelledby`, `aria-label` and native labels. Closed Dialog is
named by its trigger; its open popup uses the matching title. This resolver covers the naming patterns
used here, not the entire Accessible Name computation specification.

Only explicit registrations are visible. The main Input, Visibility Select and Dialog yield three
entries; opening Dialog mounts Change note Input and Environment Select, yielding five. Navigation,
mascot and experiment controls are outside the registry. Select options come from the same declared
metadata used by `[items]` and the rendered options, including disabled options while closed.
Availability follows the primitive's native `inert` boundary, including inert ancestors. An open
Dialog is addressed through its popup rather than its background trigger, so its own close command
remains available. Background Input/Select commands are refused without changing values or focus.

The root registry allocates monotonically increasing IDs for this application lifetime. Component
`DestroyRef` callbacks remove registrations and unsubscribe from primitive outputs. IDs are not
reused on navigation. The window boundary is removed when the page is destroyed; a retained API
reference can read the empty registry, but old IDs cannot address newly mounted instances. The
page-scoped form model is recreated on entry. The bounded journal retains at most 200 plain-data
entries and is cleared on entry; it keeps no DOM nodes, events or component references.

## Actions

| Instance | Declared actions                                               | Execution and policy                                                                                                                                                                                                                                                                  |
| -------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Input    | `set-value` with a string                                      | Native `input` event enters `RdxInputDirective`; its callback can cancel before the value model changes. Respects the instance's native length limit. Disabled/read-only edits are refused before dispatch.                                                                           |
| Select   | `select-option` with a declared enabled value; `open`; `close` | `setValue`, `setOpen` and `close` preserve cancelable callbacks, model updates and form integration. Accepted selection requests close an open popup. Read-only permits inspection/opening, but prevents selection. Disabled prevents opening and selection; close remains available. |
| Dialog   | `open`; `close`                                                | The existing Dialog handle targets its explicitly connected trigger, preserving focus ownership and cancelable open changes. Disabled refers to its opening trigger; close remains available. Dialog has no read-only state.                                                          |

These actions use existing primitive logic rather than assigning their value/open models. Input and
Select are connected through Angular Signal Forms. Dialog and both Select open states use controlled
bindings. The page records callback payloads and cancellation alongside the actual application model.
Input dispatches a synthetic, untrusted native event; it does not claim a human gesture. Its length
check follows that instance's native `maxLength` (Project name has 120; Change note has no limit).

`act()` returns `applied`, `unchanged`, `canceled` or `refused`, with messages and before/after state
where an instance exists. Unknown IDs, unsupported actions, invalid arguments, unavailable controls
and restrictions have explicit refusal codes. Only own declared action keys are executable. Repeating
an already satisfied command is a no-op without another callback. Selecting the current value in an
open Select still requests closing it, without another value callback; the result describes that open
state change. A second concurrent command gets
`busy`; it cannot overwrite an in-flight command's result.

Results settle after Angular render stability and report actual state. This does not promise that CSS
exit animations have finished. Browser checks additionally await portal removal and finish a held
child exit through the native Web Animations API before checking late focus behavior.

## Verify

Use Node from `.nvmrc` and pnpm:

```bash
pnpm playground:build
pnpm build-site
pnpm exec playwright test -c apps/visual-regression/playwright.playground.config.ts --project=chromium
# Focus and transition behavior also needs the other supported engines:
pnpm exec playwright test -c apps/visual-regression/playwright.playground.config.ts
```

`pnpm test-browser:agents` combines the composed-site build and browser run. The Playwright config
serves `dist/radix-site` with a plain static HTTP server, without an SPA fallback. Tests verify the
on-disk `playground/agents/index.html`, direct loading, refresh, JS/CSS responses, a missing-route 404,
shell navigation and theme. `tools/scripts/build-site.mjs` lists the route explicitly.
The registry table keeps names readable and scrolls within its section at narrow widths.

`agents-playground.behavior.spec.ts` uses the window API for commands, real keyboard/UI interactions,
and waiting assertions. It covers snapshot purity, exact/ambiguous lookup, events and form models,
cancellation, disabled/read-only behavior, modal focus, nested Escape, late exits, stale IDs and repeated
navigation with an open Dialog/Select. It installs page/console error listeners before loading.
macOS WebKit uses Option+Tab for native full-keyboard navigation, matching existing project checks.

This is runtime integration coverage. It does not evaluate LLM generation, screen-reader behavior,
or a general adapter for arbitrary consumer applications.
