# Preserve initial Menu models over one-time defaults

- Status: Accepted
- Date: 2026-11-15
- Related: Menu API audit A3, [runtime patterns](../engineering/patterns.md)

## Context

Menu Root applied a truthy defaultOpen over a bound open=false model. RadioGroup applied a defined
defaultValue over explicit values, or applied a late default after the user had already selected.
An initially absent/false default was left eligible indefinitely. These are initialization defects,
independent of React's controlled-prop implementation.

The Base UI 1.9.0 reference (`cf696d6f6e08c699c5bda24d5a033430909f2285`) resolves an initial model
before its default and snapshots the uncontrolled default. A defined radio value includes null;
undefined means that an initial default may apply. The local checkout has the same rules.

## Decision

Keep native Angular model signals as the sole state owners, with existing names, types and outputs.
Root keeps `model(false)`; RadioGroup keeps `model<T | undefined>(undefined)`. Use the existing core
watch([], ...) utility for one initialization after bound inputs have been assigned. Its callback
runs untracked, so later default input changes cannot overwrite state. An initially false/undefined
default is consumed too. Initial defaults do not pass through cancelable interaction requests;
Angular's native model outputs retain their existing behavior when a default changes a model.

Root uses the public ngOnChanges hook to observe whether Angular supplied a defined open input,
including false. A model(false) signal value alone cannot distinguish false from omission. This is
a narrow exception to the preference for reactive APIs: the hook records input presence only and
never copies or owns state. Reactive input/default reads and writes stay in the existing signal
mechanisms. HostDirectives and nested Roots use the same implementation. No Angular private input
metadata, model-signal node patch or React controlled/uncontrolled store is introduced.

RadioGroup needs no presence hook: its undefined initial model provides the missing-value distinction.
Every defined value wins, including null, false, zero and object identity. Initial undefined uses the
initial default. A late default is ignored before or after selection.

Angular models remain locally writable and support normal one-/two-way binding; a one-way binding
does not become a React frozen-controlled prop. Bind [(open)]/[(value)] for application state and
use the existing cancelable requests to veto interactions. Default inputs are initialization data;
asynchronous/live state should use model bindings. Other primitives' defaults are separate audits.

## Verification

Seven focused assertions failed before the fix. Eleven unit cases cover root/nested explicit false,
true and later parent writes, initial and late defaults, hostDirectives, defined radio values and
undefined fallback. An SSR render checks both explicit models and default fallbacks before hydration
serialization.

Twelve new differential scenarios use native input and F3 to mutate only application defaults.
Explicit models accept normal transactions through Angular two-way binding or React state. The
unmodified reference keeps its own uncontrolled/default behavior. Comparisons retain DOM focus,
highlight, visibility, values, requests and completions, along with the native event timeline.
No state/focus/completion is forced and no comparison exception is added.

Affected-scope checks passed 292 unit tests, 54 Menu comparisons (36 new model comparisons plus
18 existing keyboard/radio/cancellation checks), 27 Menubar state comparisons and one SSR case.
Twelve focused Storybook consumer checks, library/Storybook builds, consumer generation, focused
lint, parity tools typecheck and agents:check also passed.
All differential cases ran in Chromium, Firefox and WebKit. This addresses A3; Portal targets,
GroupLabel identity and filtering remain open. Full suites and real device/AT work remain separate.

## Alternatives

- Re-read defaults until defined: lets late data overwrite current state.
- Infer binding presence from model(false): loses the explicit false case.
- Widen the boolean model to an undefined sentinel: changes consumer binding/output types.
- Replace native models with a mirrored controlled store: duplicates state ownership and Angular binding behavior.
