# Field parity

Run `pnpm test-parity field` to compare plain native Field controls with the pinned Base UI Field.
The scenarios cover submit blocking, constraint-specific errors and focus, disabled state inherited
from Fieldset, and independent Form server errors for nested Fields. The Field and Signal Forms unit
suites cover Angular adapter precedence and teardown.

Angular keeps nested Field descriptions scoped to their own controls. The pinned Base UI
LabelableProvider also passes down the parent Field's error ID. The nested scenario records both
description contracts and verifies that editing the inner control preserves the outer error.
