# Radio differential comparison

Run `pnpm test-parity radio` from the workspace. The fixtures use the Angular public Radio entry point
and the pinned Base UI `RadioGroup` and `Radio.Root` implementations. The runner verifies the reference
digest and builds both fixtures before launching Chromium, Firefox and WebKit.

Six cases cover an omitted default, a string or empty-string default, and a bound string,
empty string or null with a conflicting default. Each checks initial selection, late defaults,
a rejected and accepted click, and the settled DOM and FormData. Bound cases reflect accepted
updates and exercise a separate external write. This represents Angular's editable two-way model
and a React parent that accepts requests. It does not certify refusal by an Angular one-way binding.

The initial Chromium run reproduced Angular's late-default and explicit-null defects. After the fix,
all **18 comparisons** passed with no expected-difference entries. Callback value and reason
participate in the comparison. Native event type/trust are retained as observations for the later
activation increment. The matched snapshots include visible Item selection, authored/generated
radio input checked state and native serialization, without equating input placement.

Open scope includes browser reset, native labels and validation, keyboard and RTL, refusal and
replacement by a controlled parent, Field state and Indicator view lifetime. The
[Radio matrix](../../../../packages/primitives/radio/PARITY.md) distinguishes Angular-only form/SSR
evidence from paired results. Reports live under `dist/parity-testing/radio/results/`.
