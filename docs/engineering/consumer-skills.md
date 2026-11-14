# Consumer skills and public documentation

`skills/` distributes `radix-ng` and `radix-ng-examples` to consumers via `npx skills add radix-ng/primitives/skills`. The subpath keeps contributor skills out of consumer installation. Contributor setup under `.agents/skills/` is maintained separately.

Public API metadata comes from primitive source through compodoc; public prose and examples come from Storybook MDX/CSF and standalone demo files. The renderer reads both `packages/primitives/` and `apps/radix-storybook/docs/`, including Agents, Overview, Learn and Guides. `tools/scripts/skills/generate.mjs`, `storybook-docs.mjs`, `styling-contract.mjs` and `api-contract.mjs` combine them into the offline bundle. Source files remain authoritative when checking whether an API or state attribute exists.

- `radix-ng/SKILL.md` and its prose references are hand-authored. API and styling contracts are generated per-primitive JSON shards, with version stamps. Deprecated whole-library monoliths remain during the migration window.
- `radix-ng-examples/SKILL.md` is a small generated router. Per-component indexes link to per-example source shards; `llms.txt` and `llms-full.txt` support discovery and complete export.
- Storybook serves the same generated files through `staticDirs` in `.storybook/main.ts`: `/llms.txt`, `/llms-full.txt`, `/<section>/<slug>.md`, `/api-contract/<slug>.json` and `/styling-contract/<slug>.json`, relative to its base. The composed site mounts Storybook at `https://radix-ng.com/docs/`.

## Styling extraction

The styling parser reads documented Markdown tables, not guessed attributes from anatomy or example CSS.
It accepts legacy global tables (`Attribute | Parts | Values`), per-part API tables (`Attribute |
Present when`, `Data attribute | Value`), bold labels and heading labels. It preserves each part,
splits explicitly named combined hooks, and unescapes quoted union values without treating them as
table separators. Code fences and CSS-variable tables are excluded.

Use complete attribute names and explicit owners in shared tables. Per-part ownership comes from
the API heading or its `ArgTypes` declaration. If prose lists hooks that must enter the structured
contract, document them in a table with their real values or presence conditions. A missing table
is a documentation gap; the generator must not invent it from another primitive's behavior.

`styling-contract.test.mjs` exercises the formats above against actual MDX and checks that all
documented attribute-table rows survive extraction. Generation rejects incomplete hook records.
Empty lists are valid for parts with no public styling hooks; inherited or composed hooks need
explicit documentation too. Keep internal DOM markers out of the public styling contract.

Storybook's Nx cache inputs include the generated Markdown and both JSON shard directories. They
are external `staticDirs`, outside the Storybook project; omitting them can restore a build with
stale contracts even after generation succeeds. The browser export check compares served files
with the committed bundle, including content changes within the same package version.

## Agents tasks and verification

The public Agents guides are maintained in `apps/radix-storybook/docs/agents/`. Their rendered
Markdown lives in `radix-ng-examples/references/agents/` and is indexed by both LLM exports.
The renderer retains Storybook destinations until `markdown-bundle.mjs` has assembled the final
component indexes and example shards. Links to examples then target their source shards; linked
narrative sections omitted by the compact index are retained. Both Markdown links and HTML card
`href`s become relative links, resolved from each exported file (including the full dump).
`markdown-links.mjs` validates local files and heading anchors in that final output, excluding code
examples. A file existing without the requested section is a build failure too.

`apps/radix-storybook/tsconfig.agents.json` compiles the four referenced consumer examples with strict
Angular template checks. `apps/visual-regression/tests/agents.behavior.spec.ts` checks their browser
contracts and the public exports through the existing docs Playwright configuration. Run:

```bash
pnpm exec ngc -p apps/radix-storybook/tsconfig.agents.json
pnpm exec nx run radix-storybook:build-storybook
pnpm exec playwright test -c apps/visual-regression/playwright.docs.config.ts agents.behavior --project=chromium
```

These are reference-fixture checks. They do not run an agent, measure generation quality, or establish
an accessibility certification. Exact prompts and observable criteria live once in the public
Verify the result page; real generation runs must additionally retain model/bundle/package versions,
generated diffs and test evidence.

Consumer instructions give installed exports and `.d.ts` files precedence when a bundle's version
differs. Version stamps describe generation provenance, not compatibility with every consumer install.

## Packed consumer integration

`pnpm test-consumer` checks skill discovery and installation from the public GitHub subpath, then
builds the four Agents tasks in a fresh Angular application outside the workspace, using a packed
library and public imports. It records the installed bundle's matching Git revision, versions and
hashes, verifies build isolation, and runs the existing Playwright engines against that app.
See [the reproducible consumer check](../../tools/consumer-testing/README.md) for commands, observed
criteria and the recorded result. This exercises maintained integration fixtures; it does not measure
agent generation quality. The source-backed Storybook checks above remain useful for faster iteration.

## Next experiments

For version-matched npm delivery, generate after the release version is assigned and include the
contracts, Markdown and example shards as package assets. Record the package version, source revision
and content digest in a manifest, verify the `npm pack` contents, and exercise a consumer against the
packed artifact. This task keeps the existing Git-distributed skills; npm delivery is a later change.

A separate opt-in snapshot/query/act experiment can cover only Input, Select and Dialog. Read semantic
state (role, name, value, disabled, expanded and selection), query explicitly registered component
instances, and expose a small set of documented interactions. Check the result with the same compiler
and browser criteria as the public tasks. Keep the adapter experimental and separate from primitive
events; this stage adds neither a runtime adapter nor WebMCP integration.

Run `pnpm skills:build` after public API, MDX or example-source changes. It refreshes compodoc metadata when missing/stale, then generates the bundle. CI runs the generator tests, checks size/integrity guards, and fails on generated drift. Guards cover version stamps, missing/orphan contract/example shards, relative links and public routes.

Generated output is committed and excluded from Prettier; add new generated directories to `.prettierignore`. Hand-authored skill files are not overwritten. See [the consumer README](../../skills/README.md) and [deployment](deployment.md).

## Compodoc and production ArgTypes

- **compodoc gotcha — never use an inline `transform` arrow together with explicit generic union type arguments on `input()`.** A signal input written as `input<boolean | 'always', BooleanInput | 'always'>(false, { transform: (v) => … })` makes compodoc 1.2.1 **hang at 100% CPU while parsing that file** (it never finishes, so `documentation.json`, `build-storybook`, and `skills:build` all stall). This silently breaks both Storybook's ArgTypes and the generated API contract (shards + monolith). Fix: extract the transform to a **named module-level function** and drop the explicit generics — `function coerce(v: BooleanInput | 'always') { … }` then `input(false, { transform: coerce })`. Angular infers the same read/write types and compodoc parses it instantly. (Plain `input<boolean, BooleanInput>(false, { transform: booleanAttribute })` — simple generics + a function reference — is fine; the trigger is the inline arrow _combined with_ string-literal union generics.) See `combobox-root.ts` / `autocomplete-root.ts` `coerceAutoHighlight`.
- **ArgTypes empty on the built/deployed site but fine locally = class-name mangling, NOT compodoc.** Storybook matches `<ArgTypes of={Directive} />` to its compodoc entry by the runtime **`class.name`** (`findComponentByName`). The production `build-storybook` minifies with Rolldown/Oxc, which renames every directive class (`RdxSwitchRoot` → `k`) and mangles `.name`, so **every** ArgTypes table silently renders nothing on `radix-ng.com` (console: `Component not found in compodoc JSON: 'k'`). The dev server doesn't minify, so `documentation.json` looks complete and it appears to work — the "compodoc generated nothing" symptom is a false lead; the data is there, the lookup key is mangled. The AnalogJS builder's own `oxc: { keepNames: true }` only covers the per-file transform pass, not the output-minify pass. Fix lives in `apps/radix-storybook/.storybook/main.ts` `viteFinal`: pin the Oxc minifier with `build.rollupOptions.output.minify = { compress: true, codegen: true, mangle: { keepNames: { function: true, class: true } } }` (only name renaming is relaxed; compression stays on). Verify in a real browser against `dist/` — the jsdom/dev path can't catch it.
