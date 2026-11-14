# Getting started

#### Give a coding agent version-aware contracts, focused examples and a verification task.

Radix NG's consumer skills help an agent find the documented Angular API and assemble headless
components with your design system. They provide context; they do not guarantee that generated code
compiles, is accessible, or behaves correctly in your application.

## Install the consumer skills

Install the library using the [installation guide](../overview/installation.md), then
install the two consumer skills:

```bash
npx skills add radix-ng/primitives/skills
```

With pnpm, use `pnpm dlx skills add radix-ng/primitives/skills`. Select the coding agent and scope
offered by the installer. The `/skills` source path distributes the consumer bundle; the repository's
`.agents/skills` directory contains contributor workflows instead.

- `radix-ng` explains API lookup, styling, forms and composition.
- `radix-ng-examples` indexes documented examples and bundles their source offline.

Ask your agent to use both skills explicitly if it does not select them automatically. Find their
installed folders before following the relative reference paths in these guides.

## Check the installed version

In your application, inspect the resolved library version, for example:

```bash
pnpm list @radix-ng/primitives --depth 0
```

Compare it with `version` in `radix-ng/references/api-contract/<slug>.json` and
`radix-ng/references/styling-contract/<slug>.json`. Example shards also carry a generation stamp.
The bundle's version is the source package version, not a certification that it matches your app.

**The installed package wins.** When versions differ, inspect its exported declarations and `.d.ts`
files before applying an example. Check the installed package's Angular peer dependencies as well.
Use documentation from the matching release when available, and let Angular's template compiler
verify selectors, inputs, outputs and value types. Current online docs can be newer than your install.

## Start with a bounded prompt

```text
Use the radix-ng and radix-ng-examples skills.

Task: build [the interaction] in this application's existing design system.
First identify the installed @radix-ng/primitives and Angular versions.
Read the relevant per-primitive API and styling contracts and the closest example.
If the bundle version differs, verify the API against installed exports and types.
Use standalone components and preserve the documented DI and projection boundaries.
Compile the application's Angular templates, then check labels, keyboard and focus.
Report which checks ran, their results and anything still unverified.
```

Provide the application route, form strategy and acceptance criteria with the task. Prefer a small
interaction you can run and inspect before expanding the page.

## Continue

- [Build with Radix NG](build-with-radix-ng.md): select a primitive and example.
- [Compose components](compose-components.md): wrappers, forms and overlays.
- [Verify the result](verify-the-result.md): checks and four reproducible tasks.
- [Reference](reference.md): contracts, Markdown and LLM exports.
