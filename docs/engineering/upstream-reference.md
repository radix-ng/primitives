# Base UI reference

Use `apps/parity-testing/reference.json` for the shared repository URL, exact commit and package version. Intentional deviations are recorded in ADRs and each suite's `expected-differences.json`; the comparison suites are regression evidence, not full parity certification.

```bash
nvm use
pnpm parity:prepare
```

The prepared source is at `node_modules/.cache/radix-ng-parity/<commit>/`, where `<commit>` comes from the JSON file. The runner validates its content digest. Its archive includes `packages/react`, `packages/utils` and `LICENSE`; generated website docs are not included.

To prepare from an existing checkout, set `BASE_UI_SOURCE` to its path for `pnpm parity:prepare`. The runner archives the pinned committed objects, not working-tree edits. The checkout must contain that commit; its current branch does not select the reference version. Without an override the runner fetches the pin from the configured repository.

Compare `packages/react/src/<name>/` implementation, `*DataAttributes.ts` and `*CssVars.ts`. If using a full checkout's generated `docs/src/app/(docs)/react/components/<name>/types.md`, first verify that checkout matches the pin. Current website content can describe a different version.

For an intentional version upgrade, update the pin and comparison evidence explicitly rather than silently mixing a newer website contract with older tests. See [comparison setup](../../apps/parity-testing/README.md).
