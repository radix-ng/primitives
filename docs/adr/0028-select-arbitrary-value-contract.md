# ADR 0028: Select arbitrary Value contract

- Status: Accepted
- Date: 2026-11-09
- Related: ADR 0025, ADR 0026, ADR 0027, Select parity matrix

## Context

Select's Base UI reference supports arbitrary item values. Radix NG still constrains Root, Item and
DI data to `AcceptableValue`, excluding booleans and symbols despite the shared comparison and
serialization helpers already accepting unknown data.

Removing the constraint alone is insufficient. An array can be one item, so runtime checks that
equate `Array.isArray(value)` with multiple selection produce incorrect labels, selected state and
native submission. A typed Date comparator must also never receive an empty initial selection.

## Decision

Root, Item, item descriptors, metadata, contexts and value-change events accept an unconstrained
`Value`, defaulting to `unknown`. Root retains its existing conditional selection shape:

- single: `Value | null | undefined`;
- multiple: `Value[] | undefined`.

`null` remains the empty single-selection convention and may have an explicit label; `undefined`
remains the unset state. No new value store, cloning, parsing or framework form engine is added.
Angular `model`, CVA and Signal Forms retain their current ownership.

### Angular type boundary

Public Root and Item inputs, events, comparison/label/serialization callbacks and imperative methods
retain their generic types. `provideRdxSelectRoot` and the existing application wrapper accept the
same unconstrained Value.

Angular DI does not carry a parent's inferred template generic into an independently declared child
directive. Internal injection therefore exchanges `RdxSelectRootContext<unknown>`; it does not use
`any` or assert that arbitrary child templates have been checked against the parent. The typed
application wrapper links `options: readonly Value[]` to Root's bindings and renders the Item parts.
Use this pattern when the option collection and selection must be checked together.

Classic `formControl`/`ngModel` still bind through Angular's untyped CVA interface. They do not infer
or enforce a primitive's Value by themselves. Signal Forms and explicitly typed bindings/wrappers
are checked by the strict AOT fixtures.

### Selection mode and browser serialization

The explicit `multiple` flag identifies the outer selection collection throughout Item selection,
popup positioning/highlighting, Value labels, autofill and native form serialization. A single
array is compared and formatted as one item; a multiple selection of array-valued items is flattened
only at its outer selection level.

Extend the existing generic `serializeNativeFormValue` with optional `{ multiple }`. Existing callers
retain automatic array detection; Select passes its actual mode. Serializers receive the complete
item, and native controls still submit strings. Default item serialization remains the shared JSON
fallback followed by `String()`; use `itemToStringValue` for an application's wire identifiers.
For example, Date formatting, symbol descriptions and function source text are not substitutes for
an application's chosen identifier scheme.

Single array-valued items also use the persistent native input. Autofill resolves rendered options
with the whole-item serializer/label and retains the matched item's original reference.

### Shared equality boundary

Add `compareItemEquality` in the existing core item helpers: nullish values compare by identity
without invoking a consumer's non-null comparator. Both Select's equality wrapper and core's
`isItemEqualToValue` consume it. Select retains `Object.is` by default and its strict property-key
comparison. Combobox retains its existing structural comparison defaults and Value constraint.
This increment shares the proven guard and serializer rather than changing other primitives' value
policies or building another control engine.

## Migration

Unparameterized TypeScript references now expose unknown values. Specify
`RdxSelectRoot<MyValue, false>` / `RdxSelectRoot<MyValue, true>` and `RdxSelectItem<MyValue>`, or narrow
unknown values before reading properties. Templates can infer Value from typed bindings and callbacks.

An array with `multiple=false` now represents one item for labels and form submission. Consumers
using an array as a selection collection must set `[multiple]="true"`. A whole-array formatter is
appropriate for an array-valued single item. The shared serialization helper's legacy default is
unchanged for other consumers.

## Verification

- Strict AOT accepts booleans, Dates, symbols, functions, readonly array items and Signal Forms; ten
  invalid value/mode/formatter/event/form/ref bindings are rejected.
- Unit tests cover falsy values, symbol identity, Date equality with an empty selection, functions,
  class instances, single/multiple arrays, cancellation, native submission and reference-preserving reset.
- Browser scenarios cover boolean Reactive Forms, Date Signal Forms, scalar-array and repeated-symbol
  submission, reset and autofill before the popup opens; existing Select/Combobox/Autocomplete suites
  guard shared changes.
- Server rendering covers boolean, Date, array and symbol labels with hydration annotations.

Reference: Base UI commit `cf696d6f6e08c699c5bda24d5a033430909f2285`,
`select/root/SelectRoot.tsx`, `select/item/SelectItem.tsx`, `internals/itemEquality.ts` and
`internals/resolveValueLabel.tsx`. This closes the arbitrary-item-type increment, not the remaining
focus, browser or assistive-technology parity gaps.
