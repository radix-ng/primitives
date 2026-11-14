# Common Mistakes & Stale Knowledge

LLMs reliably know **Radix UI (React)**, **Base UI (React)**, and **older versions of
radix-ng** — and confidently generate the wrong API from that knowledge. This file lists the
known failure modes. When generated code doesn't match an example in `radix-ng-examples`,
compare the bundle's version with the installed package first. Installed exports and types take
precedence over a mismatched example.

## You are not writing React

Radix NG is an Angular port. React patterns do **not** transfer:

| React habit                                   | Radix NG reality                                                                                                          |
| --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `<Dialog.Root>`, `<Select.Trigger>` JSX parts | Attribute directives on your own elements: `<div rdxDialogRoot>`, `<button rdxDialogTrigger>`                             |
| `asChild` to render your own element          | Doesn't exist — and isn't needed. The directive already attaches to whatever element you put it on                        |
| `value` + `onValueChange` prop pair           | A `model()` signal: two-way bind with `[(value)]`. The `(onValueChange)` output also exists, but `[(value)]` is idiomatic |
| `import * from '@radix-ui/react-dialog'`      | Secondary entry points: `import { RdxDialogRoot } from '@radix-ng/primitives/dialog'`                                     |
| `<Portal>` component wrapping children        | Portal parts are directives too (e.g. `rdxSelectPortal`); follow the anatomy in the component's `.md`                     |
| CSS-in-JS / styled parts                      | Nothing ships styles. Style via `data-*` attributes with any CSS approach                                                 |

Also remember Angular mechanics: every directive used in a template must be listed in the
component's `imports: [...]` array (all primitives are standalone), and labels must be
programmatically associated with their control (`for`/`id`, `htmlFor` on `rdxLabel`, or
`rdxFieldLabel` inside `rdxFieldRoot`).

## Renamed / removed API (newer than your training data)

### Select was migrated to Base UI naming

If you generate `rdxSelectContent` or `rdxSelectViewport`, you are using the **removed** API:

| Old (removed)                    | Current                      |
| -------------------------------- | ---------------------------- |
| `rdxSelectContent`               | `rdxSelectPopup`             |
| `rdxSelectViewport`              | `rdxSelectList`              |
| `rdxSelectPopperPositionWrapper` | `rdxSelectPositioner`        |
| `rdxSelectPopperPositionContent` | `rdxSelectPositionerContent` |

New parts that didn't exist before: `rdxSelectBackdrop`, `rdxSelectIcon`, `rdxSelectSeparator`.
Read `radix-ng-examples/references/components/select.md` before assembling a Select.

`rdxSelectLabel` is a current API: it labels the Select trigger before the popup opens.
`rdxSelectGroupLabel` labels an option group inside the popup; these parts serve different purposes.

### Accordion uses Panel

Use `rdxAccordionPanel` / `RdxAccordionPanelDirective`, not the old `rdxAccordionContent` name.
The Trigger exposes `data-panel-open`; the Panel exposes `data-open` and transition hooks, without `data-closed`.

### `@angular/cdk` is gone

Older versions depended on Angular CDK. It has been **fully removed**:

- Do **not** add `@angular/cdk` to the consumer project for radix-ng's sake.
- Do **not** import `@angular/cdk/overlay-prebuilt.css` — overlays work without it.
- Dialogs are a declarative compound (`rdxDialogRoot` → `rdxDialogTrigger` → portal/popup parts),
  not a CDK-Overlay service you call.

### Menubar has no trigger directive of its own

There is no `rdxMenubarTrigger`. Menubar coordinates standard menu parts: use `rdxMenuRoot` +
`rdxMenuTrigger` inside `rdxMenubarRoot` (mirrors Base UI).

### Context Menu has only two parts of its own

`rdxContextMenuRoot` and `rdxContextMenuTrigger`. **All popup parts come from the menu
primitive** (`rdxMenuPopup`, `rdxMenuItem`, …) — there are no `rdxContextMenuItem`-style parts.

### Menu uses Base UI part names

`rdxMenuPopup` / `rdxMenuPositioner` / `rdxMenuGroupLabel` — not the Radix-React-style
`rdxMenuContent` / `rdxMenuLabel`. Check the menu `.md` before writing menu markup.

### Checkbox group lives in the checkbox entry

`RdxCheckboxGroupDirective` is exported from `@radix-ng/primitives/checkbox` — there is no
`/checkbox-group` entry point.

## Signals & state gotchas

- **State ownership**: check that part's documented model and default inputs. Use `[(value)]` /
  `[(open)]` when the application owns state; use default inputs only where the contract lists them.
- **Don't mutate the DOM to change state.** Write to the model (`[(value)]`, `[(open)]`) or call
  the documented methods via `exportAs` references. The primitive owns its state attributes.
- **`data-*` presence attributes** (`data-disabled`, `data-invalid`, …) have an **empty string**
  value when on. Match presence (`[data-disabled]`), not a value (`[data-disabled="true"]` fails).
- **Styling hook ≠ API.** `data-*` attributes are CSS hooks the primitive writes; selectors and
  inputs are the API you write. Setting `data-open` on a template does not open a popup.
