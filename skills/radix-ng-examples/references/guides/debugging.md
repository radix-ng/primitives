# Debugging

#### Diagnose incorrect part placement and inspect primitive state.

Radix NG diagnostics use a stable `[rdx:<primitive>/<slug>]` code and include a link to the relevant
documentation. Search for the code to identify the part and the markup it expects.

## Development warnings

Warnings report recoverable mistakes through `console.warn` in development mode. Each code is
logged at most once per page load; warnings are silent in production mode.

| Code                                  | Check                                                                                                                            |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| `field/unassociated-label`            | Put `rdxFieldLabel` on a `<label>`, or associate the control another way.                                                        |
| `preview-card/trigger-element`        | Use a native interactive trigger, or supply appropriate semantics and focusability.                                              |
| `autocomplete/virtualized-item-label` | Supply `itemToStringValue` when virtualized Autocomplete uses object items.                                                      |
| `tabs/tab-outside-list`               | Keep tabs inside the rendered `rdxTabsList`, including when projecting them.                                                     |
| `toggle-group/missing-toggle-value`   | Give every `rdxToggle` inside a Toggle Group a `value`.                                                                          |
| `menu/items-outside-composite`        | Keep the owning Menu Root in the projected parts' declaring tree and use Menu item directives so they join the popup collection. |

For wrapper and projection patterns, see [Composition](composition.md).

## Structural errors

These errors identify markup that cannot work:

| Code                            | Fix                                                                                      | When thrown                       |
| ------------------------------- | ---------------------------------------------------------------------------------------- | --------------------------------- |
| `<primitive>/portal-on-element` | Use `*rdx…Portal` microsyntax or an explicit `<ng-template rdx…Portal>`.                 | Development mode.                 |
| `popover/trigger-missing-root`  | Put `rdxPopoverTrigger` inside `rdxPopoverRoot`, or pass a `handle` connected to a root. | Development and production modes. |

Check the documented host element as well. A selector such as `button[rdxSelectTrigger]` only
matches a `<button>`; putting the attribute on another tag does not apply that directive.

## Angular DevTools

Some state signals, computeds, and effects have a `debugName`, such as `RdxPopoverRoot.state` and
`RdxPopoverRoot.applyDefaultOpen`, to help identify them in Angular DevTools.

When investigating a state or styling issue, compare the primitive's inputs with the rendered
`data-*` attributes documented in its API Reference. See
[State & data attributes](../learn/state-data-attributes.md) for the styling contract.
