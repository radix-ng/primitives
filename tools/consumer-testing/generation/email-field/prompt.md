Use the installed radix-ng and radix-ng-examples consumer skills to implement this task in this application.
Read both .agents/skills/radix-ng/SKILL.md and .agents/skills/radix-ng-examples/SKILL.md, then choose relevant contracts and examples. Check the installed library and Angular versions; installed exports/types win if bundle versions differ.

Create our own standalone Angular AppEmailField on top of Radix NG Field using this application's CSS tokens in src/styles.css and Angular Reactive Forms. There is no finished design system or visual reference. Use plain application CSS and public @radix-ng/primitives imports; do not add Tailwind, Storybook helpers, workspace aliases, NgModules or Signal Forms. ReactiveFormsModule from Angular may be imported by standalone components.

Public reusable component contract (also used by an independent parent after your session):

- Export AppEmailField from src/app/app-email-field.ts with selector app-email-field.
- Required inputs: control: FormControl<string>, label: string, description: string.
- The parent owns the FormControl, its value, validators and disabled state. Bind to that supplied control. Do not replace it, install/remove its validators, duplicate the value in another model, or require a separate disabled input.
- Render a native email input associated with the visible label and description using Radix NG Field parts. Clicking the label focuses the input.
- Show validation errors only when the supplied control is touched (blur or the parent's markAllAsTouched on submit). Use the message "Email is required." for required and "Enter a valid email address." for email. Initial untouched invalid state must not show errors. Correction hides obsolete errors. Reset must restore pristine/untouched and hide errors again.
- Respect control.disable()/enable(), including native editing and focus behavior. External control.setValue must render even when disabled.
- Use this application's CSS tokens and visible focus/disabled/error styles. No exact visual appearance is prescribed.

Build a demonstration form in the root App:

- The parent creates a nonNullable FormControl<string> with initial value '' and Validators.required and Validators.email, in a FormGroup. Angular owns validation; use novalidate so invalid submission reaches the Angular handler.
- AppEmailField label: Project email. Description: We will send project updates to this address.
- Provide these controls in this tab order: a type=button named Set external email, AppEmailField, a submit button named Save email, a type=button named Reset form, and a checkbox named Disable email.
- Set external email calls setValue('external@example.com') on the parent's control, including when disabled.
- Save email marks all controls touched. If valid, deliver the current email once to a local submissions list, without network requests. Invalid submission must not add a delivery. The submit button stays enabled so errors can be shown.
- Reset form restores the empty default, pristine/untouched and hides errors, including after a failed submission. Keep the submission history so its count remains inspectable.
- Disable email calls control.disable()/enable(); component state comes from that control.
- Expose actual parent state in output elements for inspection: data-testid="control-value", "control-touched", "control-pristine", "control-disabled", "control-status" (Angular status), "submission-count" and "submitted-value" (last delivered email, empty initially). Boolean outputs use true/false; the input's rendered value is not a substitute for the parent state.

Run pnpm build with strict Angular template checking. You may add focused checks and fix your own implementation within this one session. Report what you implemented, checks actually run and unverified behavior. Do not claim browser checks passed without running them.

Environment note from the pinned experiment: the Angular production builder aborted with exit 134 inside this macOS sandbox even on the blank scaffold. The strict compiler pnpm exec ngc -p tsconfig.app.json --noEmit works here. Use it to check/fix templates; record any builder limitation. The independent evaluator will run both production builds and browser checks outside the coding sandbox afterward.

Only this consumer project, installed dependencies and the two installed skills are task context. Do not read other repositories, global skills, ready consumer fixtures, GitHub clones or outside files. No web lookup, dependency installation or network access is available to shell tools. Keep package.json, pnpm-lock.yaml, Angular/TypeScript configuration and installed skills unchanged. Do not commit. Finish with a concise report.
