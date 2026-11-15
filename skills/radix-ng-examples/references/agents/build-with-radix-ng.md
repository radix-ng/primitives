# Build with Radix NG

#### Build your application's styled components on top of headless primitives.

Start with the version check in [Getting started](getting-started.md).
Use the local bundle for focused retrieval rather than loading the complete documentation each time.

## From a request to your AppSelect

One recorded task asked an agent to build a reusable selection control inside a Project settings
Dialog. The result was a standalone `AppSelect` with typed `value` / `valueChange` bindings plus
`disabled` and `label` inputs, public Select imports and an application-owned Dialog composition.

The application supplies the options, selected value, disabled state, content and CSS tokens. It
retains the value when Dialog closes. The checks covered external updates, one change callback per
selection, disabled navigation, keyboard selection, nested `Escape` and return to the appropriate
Select or Dialog trigger. See [the recorded result](verify-the-result.md#recorded-generation-results),
including the correction to its disabled tests.

Start from the maintained [Select focus-management example](../components/select.md)
and its bundled source, `references/examples/select--focus-management.md`. A design system is not
required: one wrapper and an explicit styling approach are enough to begin.

### Prompt: AppSelect inside Dialog

Replace bracketed values with your application's files, data and labels. This is an adaptable
product task based on the completed experiment, not a promise that another run will pass.

```text
Use the installed radix-ng and radix-ng-examples skills. Check the installed Radix NG and
Angular versions, then read the Select/Dialog contracts and the closest nesting example.
When versions differ, verify the API against installed exports and types.

Create a reusable standalone AppSelect inside a Dialog for [route or feature].
Styles: [paths to our tokens/styles and CSS or utility conventions]. Use application-owned
styles for the control, popup, Dialog, focus and disabled states; replace Storybook helpers.
Data: [our typed options and labels; for example Private/private and Public/public].
Dialog title: [Project settings]. Select label: [Visibility].

Expose typed value/valueChange, disabled and label bindings using public Radix NG imports.
The parent owns the selected value and disabled state; use explicit parent value bindings.
Keep selection after closing/reopening Dialog. Add a small demo with external value updates
and a disabled toggle. Preserve the primitives' composition and interaction behavior.

Check strict Angular template compilation, public imports and accessible names.
Verify keyboard selection and one valueChange per user selection, with no extra emission
for external updates. Tab/Shift+Tab must skip a disabled Select; enabling restores selection.
Escape closes Select before Dialog. Closing each overlay returns focus to its trigger,
including after exit transitions; focus stays within the modal Dialog while it is open.
Return the component/integration changes, commands and check results, and anything unverified.
```

## AppEmailField with a parent-owned FormControl

A separate recorded task produced a standalone `AppEmailField` over Radix NG Field. Its required
inputs are `control: FormControl<string>`, `label` and `description`. The wrapper associates a native
email input with Field's label, description and error messages, using Angular Reactive Forms.

The application creates the control, owns its value and validators, calls `disable()` / `enable()`,
handles submission/reset and supplies CSS. The wrapper binds that control directly. Checks covered
label/description relationships, initially hidden errors, required/email feedback after blur or
submission, correction, two-way control updates, disabled behavior, reset and exactly-once delivery
of the current value. See [the recorded result](verify-the-result.md#recorded-generation-results).

The maintained [Field Reactive Forms example](../components/field.md), bundled as
`references/examples/field--reactive-forms.md`, supplies a starting pattern; it is separate from the
agent-generated wrapper.

### Prompt: AppEmailField

```text
Use the installed radix-ng and radix-ng-examples skills. Check the installed Radix NG and
Angular versions, then read the Field contracts and Reactive Forms example.
When versions differ, verify the API against installed exports and types.

Create a standalone AppEmailField over Radix NG Field for [route or feature].
Styles: [paths to our tokens/styles and CSS or utility conventions]. Use application-owned
focus, disabled and error styles; replace Storybook helpers.
Content: label [Project email], description [where and why this address is used].
Data/delivery: [our initial value and submit handler; use a local list for a standalone demo].

Required inputs: control: FormControl<string>, label: string and description: string.
Use Angular Reactive Forms and public Radix NG Field imports. Bind the supplied control
directly; the parent owns its value, validators and disabled state. Do not duplicate its
model or replace its validators. Connect the native email input to its label/description.

In a demo form, the parent creates a nonNullable control with required/email validators.
Show separate required/email errors only after blur or an attempted submission that marks
the controls touched. Provide submit, reset, external setValue and disable/enable controls.
Reset restores the initial value, pristine/untouched and hidden errors. Invalid submission
shows errors without delivery; each valid submission delivers the current value once.

Compile both the demo and a separate parent against this public API with strict templates.
Verify label/description associations, error timing/correction and two-way value updates.
Check that disabled prevents editing and is skipped by Tab/Shift+Tab, external setValue
still renders while disabled, and enable restores keyboard editing. Verify reset and submit.
Return the implementation, commands and check results, and anything still unverified.
```

Both prompts ask for code in your application and evidence from its checks. Recorded outcomes apply
to the earlier skills snapshot listed in Verify the result, not to every later bundle or generated UI.

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

Agent Playground's experimental `snapshot` / `query` / `act` operates an already running UI. It does
not generate these wrappers and is not installed with the consumer skills.
