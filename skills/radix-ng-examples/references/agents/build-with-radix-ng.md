# Build with Radix NG

#### Find the smallest documented primitive and adapt a nearby working example.

Start with the version check in [Getting started](getting-started.md).
Use the local bundle for focused retrieval rather than loading the complete documentation each time.

## Choose the interaction

| Need                                            | Start with                                             |
| ----------------------------------------------- | ------------------------------------------------------ |
| A labelled text field with validation feedback  | Input, Field; Form or Fieldset when grouping is needed |
| Select one or more known values                 | Select; Combobox when filtering is needed              |
| Suggest text without committing a selected item | Autocomplete                                           |
| A modal task                                    | Dialog; Alert Dialog for an interrupting confirmation  |
| A list of actions                               | Menu; Menubar for persistent coordinated menus         |
| Layered sections of one page                    | Tabs                                                   |

The `radix-ng-examples` index links to `references/components/<slug>.md`. That component index
contains imports and anatomy and links to `references/examples/<slug>--<example>.md` for the full
source of one example. Prefer the closest form, wrapper or nesting example to a bare default.

## Read the contract before writing bindings

Open these files in the installed `radix-ng` skill for each primitive involved:

- `references/api-contract/<slug>.json`: directive names, selectors, `exportAs`, input types and
  defaults, outputs, and the `twoWay` model bindings.
- `references/styling-contract/<slug>.json`: anatomy and documented hooks with their owning parts
  and authored value descriptions.

Import standalone directives from their public secondary entry points and include template
directives in the component's `imports`. A directive composed through `hostDirectives` belongs in
that metadata instead. Expose the wrapper's intended inputs and outputs explicitly.

Examples may use local story helpers for classes or icons. Replace those with your application's
own tokens and dependencies; repository-only `../../storybook` imports are not an npm API.

## Preserve the part's own state hooks

Select Popup exposes `data-open` / `data-closed`; Accordion Trigger exposes `data-panel-open`.
Tabs Tab uses `data-active`. These are different contracts. Read each part rather than assuming a
universal `data-state`. Presence attributes are normally empty strings when present, so match
presence rather than `data-open="true"`. Toast Root retains its documented `data-state` values.

State attributes describe the primitive's state. Set documented inputs or models to change that
state; adding attributes to your markup does not operate the component.

## Complete one interaction

Compile it in the consumer application before adding variants. Then follow
[Verify the result](verify-the-result.md). For a compound component, read
[Compose components](compose-components.md) before moving parts into wrappers.
