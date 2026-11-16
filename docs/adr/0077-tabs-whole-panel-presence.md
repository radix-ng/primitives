# ADR 0077: Own the complete Tabs Panel view through structural presence

- Status: Accepted
- Date: 2026-11-16
- Supersedes: the persistent structural Panel-host policy in [ADR 0074](0074-tabs-native-identities.md)
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [ADR 0076](0076-tabs-indicator-observation.md)

## Context

The former `*rdxTabsPanelPresence` lived inside an `rdxTabsPanel`. It destroyed child views after
exit but left an empty native Panel, its ID and its registration behind. Four reviewed identity
fields differed from the pinned Base UI 1.9.0 behavior. This was a consequence of our template
ownership boundary; Angular can own and destroy the entire embedded Panel view.

## Decision

Apply structural presence to the Panel host and supply its value once:

```html
<div *rdxTabsPanelPresence="'one'" rdxTabsPanel>Panel one</div>
<div *rdxTabsPanelPresence="'two'; keepMounted: true" rdxTabsPanel>Panel two</div>
```

- `RdxTabsPanelPresence` owns the `TemplateRef`/`EmbeddedViewRef` for one complete Panel. Reuse
  `PresenceMachine` to wait for host/descendant exit motion, then destroy that view. Angular removes
  the native host and destroys its directives, components and subscriptions. Returning creates a new
  native host and new child views. No host detachment or manual DOM reattachment is used.
- The structural owner supplies value, mounting policy and a stable generated ID through a typed
  context. Its ID survives native view recreation, matching the pin's persistent Panel component
  identity. An authored native Panel ID still takes precedence. The context is used only within its
  own Tabs Root, so nested Roots do not inherit an outer Panel owner.
- The shared transition ref also belongs to the structural owner. Native hosts register themselves
  with that ref; its activation history survives their destruction. This preserves the actual
  `data-starting-style` phase when a completed exit is followed by a new activation, while keeping
  initially-open markup settled. Ordinary retained Panels continue to own their transition ref.
- A native Panel inherits its value and mounting policy when wrapped. Without a structural owner,
  it keeps the existing retained-host behavior and takes an explicit `value` input.
- Derive the structural exit hold with `linkedSignal` from selection and `keepMounted`. It keeps an
  outgoing view visible and inert until the shared machine disposes it. Turning off `keepMounted`
  on an already-closed view removes it without revealing it or starting another exit.
- Native Panel registration follows actual view lifetime. Destruction removes `aria-controls`;
  returning restores the relationship to the recreated host with the same owner ID.
- Remove the four `persistent-panel-host` exceptions after direct comparisons report them stale.
  Keep the pin's authored-Panel-ID defect and the hidden consumer-owned Indicator adaptation from
  ADRs 0074/0076. No behavior or observation is rewritten to match the reference.

## Migration

This changes the structural directive's public API. Move it from the contents onto the Panel host,
move the Panel value into its structural expression, and move structural `keepMounted` there too.
The old argument-free inner usage fails required-input checking. Equivalent explicit syntax is:

```html
<ng-template [rdxTabsPanelPresence]="value" [rdxTabsPanelPresenceKeepMounted]="keepMounted">
  <div rdxTabsPanel>Panel contents</div>
</ng-template>
```

Existing ordinary retained Panels keep their explicit `value` usage. Public examples, the keyframe
story, SSR fixture and consumer bundle migrate with this change. Indicator remains a hidden host
at null, and the correct authored-ID relationship is preserved.

## Evidence and limits

The first comparison with structural ownership had no assertion failures or unexpected differences;
all four former Panel-host exceptions were stale. That report is retained in
`dist/parity-testing/tabs/panel-owner-stale-exceptions/`. They were then removed explicitly.

Four new browser scenarios cover removal/recreation with fresh input state, full-view retention
with edited state, Root disposal during a held exit and disabling `keepMounted` on a closed panel.
The existing identity presence case now also compares remount ID stability. Raw records include
actual host presence, input values, IDs, focus, callbacks and DOM. All **336 comparisons** (112
scenarios, three engines) pass with four remaining exact exception fields.

Six new units establish Angular child destruction, fresh children on return, retained child state,
actual IDREF cleanup and stable IDs, same-update value/selection edits, exactly-once Root disposal
and nested-Root ownership. The complete Tabs unit suite passes **63 tests**. Four selected SSR checks
pass, including active/absent/kept whole-Panel markup and native relationships.

After final input metadata cleanup, all 48 affected Panel/identity comparisons pass again on macOS
and in the Playwright 1.60.0 Noble Linux/arm64 image, with one Linux worker and the original timeout.
Linux observations are retained in `dist/tabs-panel-owner-linux/results/`. Both public Storybook
checks pass against a fresh build: whole-Panel keyframes and the projected Tabs consumer. Library,
SSR application and Storybook builds and consumer-bundle generation pass.

A focused enter-attribute observation reproduced missing `data-starting-style` on recreated hosts
before the transition ref moved to the structural owner: the remount case failed while the retained
control and all reference assertions passed. Its report is retained in
`dist/parity-testing/tabs/panel-owner-before-enter-fix/`. The two completed-exit cases now observe
actual DOM insertions/attribute mutations and compare the enter sequence for both destinations.
All 48 affected comparisons pass again across the three engines after that correction.

Existing descendant-only exit support remains an Angular capability; the pin waits on its Panel
element. Actual client hydration, late replacement of descendant animations, real devices and
assistive technology remain separate verification work.
