# Select arbitrary Value (ADR 0028)

Root/Item and their public contracts are unconstrained and
default to `unknown`. Angular DI erases family generics; typed application wrappers connect options
to selection and callbacks. Use explicit `multiple` to distinguish a selection collection from an
array-valued item. Select passes that mode to the shared generic `serializeNativeFormValue`; other
callers retain automatic array detection. Core `compareItemEquality` guards nullish selections before
custom comparison; Select keeps identity defaults and Combobox keeps its existing equality policy.
