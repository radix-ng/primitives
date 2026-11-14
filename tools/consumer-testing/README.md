# Packed consumer integration

This opt-in check follows the consumer path: GitHub skill installation, versioned context lookup,
an installed Radix NG tarball, strict Angular compilation, and browser interaction. The four
maintained fixtures adapt the tasks in [Agents / Verify the result](../../apps/radix-storybook/docs/agents/verify-the-result.docs.mdx).
They are consumer integration checks, not independent coding-agent generation evaluations.

## Run

Use the Node version in `.nvmrc` and the repository's pnpm version. Install the repository dependencies
and Playwright browsers, then run from the repository root:

```bash
pnpm exec playwright install chromium firefox webkit
pnpm test-consumer
```

For focused iteration, forward Playwright options, for example `pnpm test-consumer --project=chromium`.
Each run creates a new directory under the operating system's temporary directory and prints its path.
It leaves the app, tarball, dependency lock, installed skills, GitHub snapshot, build statistics,
browser results and command logs there. `report.json` records versions, hashes and exit codes.

The script runs these steps:

1. Copy `fixture/` outside the repository. Its TypeScript config has no workspace `extends` or `paths`;
   both TypeScript strict mode and Angular `strictTemplates` are enabled.
2. Run the documented pnpm equivalent of `npx skills add radix-ng/primitives/skills`, using the pinned
   `skills@1.8.1` installer. `--list` checks discovery; `--agent codex --yes --copy` installs into the
   temporary project. Only `radix-ng` and `radix-ng-examples` may be installed. Global skills are untouched.
3. Clone the current GitHub source and compare every installed skill file by a deterministic tree
   digest. The report records the matching commit and whether its bundle also matches the local tree.
   If GitHub advances during installation and the bytes differ, the check fails rather than assigning
   an unverified revision. Retry to capture a consistent snapshot.
4. Run `pnpm primitives:build`, pack `dist/primitives`, and install the resulting `.tgz` into the app.
   The library is resolved from that app's `node_modules`; its source is not linked into the app.
5. Read the installed API/styling contract versions for Field, Select, Dialog, Menu and Tabs, and hash
   the four installed example shards used as context. A version mismatch is reported explicitly;
   installed package types and the consumer build determine actual compatibility.
6. Run the app's production Angular build and inspect its input statistics to reject workspace imports.
7. Use the repository's existing Playwright dependency and shared browser projects to run the four
   consumer scenarios in Chromium, Firefox and WebKit. No Storybook server or helpers are used.

The fixture's small `pnpm-workspace.yaml` only allows the Angular toolchain's native dependency build
scripts required by pnpm 11. It defines no links to repository packages. Its CSS is owned by the consumer.
The fixture's Angular/toolchain versions are pinned in its own manifest; this is a tested version pair,
not a claim about every supported Angular version.

## Browser contracts

| Task             | Observed behavior                                                                                                                                                                  |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email form       | Visible label/description/error association; required/email errors; dirty/touched attributes; keyboard submission and Tab navigation.                                              |
| Select in Dialog | Named modal and combobox; keyboard selection; retained value; Escape closes the child before the parent; modal focus containment and trigger return.                               |
| Dialog from Menu | Keyboard activation; Menu exit preserves Dialog input focus; title/description/label; focus containment; Escape and Cancel restore the Menu trigger.                               |
| Tabs wrapper     | Public `hostDirectives` inputs/outputs compile; projected parts resolve context; roles/panels stay linked; manual Arrow/Home/End/Enter/Space activation; focus can leave the list. |

Tests collect page and console errors. They wait for an opened popup to own focus before sending the
next dismissal key. macOS WebKit uses Option+Tab for native full-keyboard navigation, following the
existing documentation tests' convention. The Menu fixture includes a CSS exit animation.

To rerun browsers against a retained consumer without another installation:

```bash
RADIX_CONSUMER_DIR=/absolute/path/from/the/report/consumer \
  pnpm exec playwright test -c tools/consumer-testing/playwright.config.ts
```

`RADIX_CONSUMER_PORT` overrides the default port. The server always serves the built external app and
does not reuse another running server. [verification.json](verification.json) is a portable record of
the completed check; the full report and logs remain in the printed evidence directory.

Skill distribution remains GitHub / skills.sh. This check adds neither npm documentation assets nor
a runtime adapter, WebMCP, or snapshot/query/act API.
