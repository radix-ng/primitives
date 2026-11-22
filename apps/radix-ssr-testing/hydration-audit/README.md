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
The hydrated form blocks an empty required group, focuses the original radio and submits
after a selection.
Moving the hydrated Field outside the native form keeps the original inputs and required focus.
The declaring Form emits the portaled value through its submit callback.
The moved group preserves its selection on canceled reset and restores its default on accepted reset.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-radio
```

The `reverse-checkbox-group` case renders two CheckboxGroups in deferred views. It checks that
hydrating the second group first preserves both groups' generated IDs, native inputs and Field
relationships. It also checks select-all event replay, native label activation and native form reset.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=reverse-checkbox-group
```

The `eager-label` case checks standalone Label with an authored `for`, a wrapping label and a
bound `htmlFor`. It checks server node reuse, stable IDs, accessible names and native activation.
After hydration it exercises disabled controls, nested buttons and links, replacement of the
label and control, and retargeting through `htmlFor`.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-label
```

The `eager-progress` case verifies reuse of the Progress Root and its four parts, stable generated
IDs and label association. Server text starts in `en-US`. The hydrated view adopts
the browser's locale, accepts value updates and reestablishes its Label after replacement.

```bash
node apps/radix-ssr-testing/hydration-audit/audit.mjs --case=eager-progress
```
