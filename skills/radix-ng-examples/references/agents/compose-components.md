# Compose components

#### Preserve Angular ownership while adapting headless parts to your application.

Use the [composition guide](../guides/composition.md) and the chosen primitive's anatomy
for the full patterns. The installed `radix-ng` skill also bundles `references/composition.md` and
`references/forms.md` for offline use.

## Wrappers and hostDirectives

Keep the state-owning Root on the wrapper host when projected children need its context.
`hostDirectives` composes the primitive onto that host; explicitly expose the inputs and outputs
that form your wrapper API. Use standalone components and direct public imports.

Projection moves rendering, not the declaring injector ancestry. A Root hidden inside the wrapper's
template can be out of reach of projected parts. Tabs and Navigation Menu document a bridge for
their projected top-level items; this is a specific contract, not a property of every primitive.

For Tabs, start with [Projected through wrapper](../components/tabs.md). Its source
composes `RdxTabsRoot` onto the wrapper host, keeps `RdxTabsList` in the wrapper view, and projects
the consumer's tabs and panels. The nearest example is bundled as
`references/examples/tabs--projected-through-a-wrapper.md` in `radix-ng-examples`.

## DI and part placement

Keep each part beneath its documented provider-bearing owner. DOM containment alone does not
establish the Angular injection context. A Menu submenu uses its own Menu Root; a trigger, popup or
form part should not acquire an unrelated outer owner's state after a refactor.

Use the documented portal directive and template placement. Moving an overlay into a new wrapper
or replacing its portal with an `@if` can change queries, focus ownership and close completion.
Check the real browser behavior after changing these boundaries.

## Forms

Follow the [forms guide](../guides/forms.md) for your chosen form system. Field groups
a control with its label, description and errors; it does not supply Angular validators itself.
Use `rdxFieldControl` for an ordinary native control, or a control such as `rdxInput` that already
integrates with Field. Avoid stacking both integrations on the same native input.

For Reactive Forms, the documented `rdxNgControlField` adapter reports form state. For Signal Forms,
check the installed Angular version and the [Signal Forms examples](../components/signal-forms.md).
Use `rdxFieldLabel` for Field's automatic association or explicit native `for` / `id` elsewhere.
Displayed invalid state can remain neutral until the configured validation interaction occurs.

## Nested overlays

Treat each overlay as an independent owner. A Select inside Dialog must close without dismissing
its parent; closing the Dialog must restore its own trigger. Read
[Select focus management](../components/select.md) and use the Dialog shell variant.

For a Dialog opened from Menu, start with [Menu's opening-a-dialog example](../components/menu.md).
It composes `rdxMenuItem` with `rdxDialogTrigger` and a shared Dialog handle. Menu close completion
must preserve focus in the new Dialog, including when the Menu is retained or finishing an exit.
Use documented handles and events rather than timeouts or manually focusing a popup after each change.

The four tasks in [Verify the result](verify-the-result.md) make these
composition requirements observable.
