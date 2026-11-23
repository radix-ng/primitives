# Copyable Storybook examples

Run from the repository root with its Node and pnpm versions:

```sh
pnpm primitives:build
node tools/storybook-portability/check.mjs
```

The check discovers CSF raw component sources using the shared demo classes or semantic colors, follows local wrapper,
helper and HTML dependencies, and copies them into a fresh Angular application outside the workspace.
It installs the built Radix NG tarball and the examples' dependencies, then runs a production AOT build
with strict template checks and Tailwind v4. There are no workspace `paths` or source package links.
`report.json` records every compiled source, dependency version and command; `verification.log` retains
compiler output. The temporary app is retained for inspection.

For iteration, set `RADIX_PORTABLE_DIR` to the printed directory. Sources and CSS are recopied on each
run. The app's local build-script allowlist comes from the existing consumer integration fixture.
Set `RADIX_PORTABLE_RECORD=tools/storybook-portability/verification.json` to refresh the checked-in
[verification record](verification.json): installed versions and SHA-256 hashes identify the exact
examples, supporting files and rendered stylesheet that passed. The negative published-array probe
must also produce Angular's NG1010 diagnostic.

Public MDX presents component and local helper sources through `?raw` and `Source`. Guides → Styling
contains the shared setup and CSS. The Markdown bundle carries the guide link and local **Example
files** section into example shards. Import directives explicitly from their public entry points.
Published arrays such as `popoverImports` lack the declaration initializers Angular needs for
component metadata spreads.

AOT verifies templates and published imports. Browser regressions separately verify appearance,
focus/disabled states, entry/exit motion and reopening during exit against built Storybook/Playground.
