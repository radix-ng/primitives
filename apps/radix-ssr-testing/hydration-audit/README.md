# Portal hydration regression

Regression coverage for [ADR 0085](../../../docs/adr/0085-hydration-owned-identity-and-view-ranges.md).
The dated [investigation](../../../docs/engineering/mechanisms/portal-hydration-audit.md) preserves
the original findings and documents the Angular cancellation limitation.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs
node apps/radix-ssr-testing/hydration-audit/audit.mjs --project=chromium --case=pending-lazy-retarget
```

Run from the workspace root. The command builds real Angular AOT client/server fixtures and records
browser observations in Chromium, Firefox and WebKit by default. It exits with code 1 when a
regression invariant fails. `--port=4492` selects another unused port; `--skip-build` reuses only
fresh matching client/server builds. The target is also available as
`pnpm exec nx run radix-ssr-testing:hydration` and participates in affected CI browser jobs.

Results, SSR HTML, module hashes, checkpoints and framework-limit observations are written to
`dist/portal-hydration-audit/results/runtime-<engine>.json`. A failed run never passes by falling
back to client rendering: assertions check saved server node identities, values and ID relationships.

Accordion coverage includes `reverse-accordion-presence` and `eager-accordion-retained`. These
check generated IDs, native server-node reuse, pre-bootstrap input edits, initial keyframe
suppression and post-hydration close/reopen. Default Panels recreate children; retained Panels keep
their native input. The reverse case hydrates the second island before the first. These are Angular
hydration regressions, separate from the pinned React comparisons.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=reverse-accordion-presence
node apps/radix-ssr-testing/hydration-audit/audit.mjs --skip-build --case=eager-accordion-retained
```

The `detached-dialog-close-before-trigger-hydration` case closes the eager Dialog Root via its
handle before an external Trigger hydrates. It checks server button identity, stable IDs, the ARIA
update on hydration and a single open request from the next click.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=detached-dialog-close-before-trigger-hydration
```

The `eager-radio` case verifies server node reuse, stable group, input and legend IDs, label and
description associations, focus and form selection. After hydration it checks keyboard selection,
interrupted Indicator exit, removal after completed exit, native label activation and Field
state on accepted and canceled native reset.
Group and item `inputRef` callbacks also resolve to the hydrated inputs and the group follows
post-hydration selection.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-radio
```
