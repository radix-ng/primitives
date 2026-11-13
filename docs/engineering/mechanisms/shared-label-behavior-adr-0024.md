# Shared label behavior (ADR 0024)

`core/src/labelable.ts` owns reactive label registration,
registration-owned cleanup, native/non-native interaction and shadow-tree control lookup. Field Root
and Item, Select and the Combobox engine use it; Autocomplete composes Combobox.Label. Primitive
control identity, Field state and popup/value policy remain outside core. Extract proven shared
responsibilities with concrete consumers during parity work, rather than waiting for every primitive
to be finished or building a universal control engine.
