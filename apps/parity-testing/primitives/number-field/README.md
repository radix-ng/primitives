# Number Field behavioral comparisons

```sh
pnpm test-parity number-field
```

The suite compares Angular Number Field with Base UI 1.9.0 at
`cf696d6f6e08c699c5bda24d5a033430909f2285` in Chromium, Firefox and WebKit.

Six cases cover standalone defaults, initial absence, zero, and bound zero, null and positive
values. Each changes the default after initialization and after a native keyboard edit. Bound
cases also write a value from the parent. The checks read the visible input, native `FormData`,
change reasons and commit counts. Both fixtures accept edits through their public model APIs.
The Angular fixture uses an authored native number input for submission.

Angular form adapters and reset ownership are covered in the
[Number Field matrix](../../../../packages/primitives/number-field/PARITY.md#form-precedence-cases).
