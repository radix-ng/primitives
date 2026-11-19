# Radio differential comparison

Run `pnpm test-parity radio` from the workspace. The fixtures use the Angular public Radio entry point
and the pinned Base UI `RadioGroup` and `Radio.Root` implementations. The runner verifies the reference
digest and builds both fixtures before launching Chromium, Firefox and WebKit.

The six G1 scenarios cover an omitted default, a string or empty-string default, and a bound string,
empty string or null with a conflicting default. They check initial selection, late defaults,
a rejected and accepted click, and the settled DOM and FormData. Bound cases exercise an external
write and use Angular's editable two-way model with an accepting React parent.

The nine G2 scenarios cover strict parent selection with successive ignored requests, null selection,
delayed application, replacement with the empty-string item, clearing, refusal and veto of native
label clicks, accepted editable label activation and native button Space release. In the native
button case Angular uses generated form serialization and React uses its own native radios. The
paired checkpoints compare visible selection and submitted values for this case.

Twelve G3 scenarios compare native Tab entry and re-entry, LTR/RTL and Shift arrows, wrap,
disabled/read-only groups and items, parent updates and vetoes. The custom-host cases check
Space release timing and keyup prevention. The suite checks focus and the roving stop separately
from the checked item and FormData.

Ten G4 scenarios cover native constraints and visible focus in an externally owned form,
disabled and unmounted selections, Field/Field.Item label and description associations, and
Field interaction flags on the group, radio and indicator. They also compare Fieldset legend
fallback, label precedence and live legend identity. The Angular hydration audit exercises
accepted and canceled reset with a Radio Group in Field and Form.
The two ref cases compare group fallback and selected input, callback replacement and cleanup,
item input ownership, and group and item detachment.
The three validation cases check first whole-group blur, committed writes in `onChange`, and
submit gating with error recovery. The raw submit observation records the focused radio.

Three G5 scenarios compare structural Indicator lifetimes with interrupted CSS exit, retained
unchecked views and unmounting without motion. They assert the transient hooks and reuse of the
same node during exit reversal. An already completed exit creates a new node on selection unless
the view is retained.

Two G6 scenarios cover values whose identities differ despite identical serialized strings,
object and array serialization, group isolation across form owners, tracked reorder, focused
node identity and healing an orphaned selection by restoring its option value. The Angular-only
[hydration audit](../../../radix-ssr-testing/hydration-audit/README.md) covers eager hydration.

The initial Chromium run reproduced Angular's late-default and explicit-null defects. The full suite
now passes **126 comparisons** with no expected-difference entries. Callback value and reason
participate in comparison. Event type/trust and native input/change notifications are retained as raw
observations. Angular assertions check that controlled requests emit no native edit notifications
and that an accepted editable click with an authored input emits one of each.

Open scope includes paired browser reset, dynamic form ownership, native constraint registration with Field and Form,
additional host and collection combinations, and deferred hydration. The
[Radio matrix](../../../../packages/primitives/radio/PARITY.md) distinguishes Angular-only form and
SSR evidence from paired results. Reports live under `dist/parity-testing/radio/results/`.
