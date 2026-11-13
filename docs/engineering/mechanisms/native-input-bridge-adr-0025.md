# Native input bridge (ADR 0025)

`core/src/dom/use-native-form-control.ts` supports an optional persistent
visually hidden input alongside its existing submission-only entries. It owns browser-only creation
after hydration, ref lifecycle, attributes, input/change coalescing, canceled-event restoration and
listener cleanup. Select configures this for autofill, required constraints and focus redirection;
its item matching and temporary hidden option mounting stay Select-side. Single values submit through
the main named input (including empty strings); multiple values retain repeated hidden entries and a
nameless validation input. Angular forms/Field remain the application validation owners. Extend this
bridge for future consumers rather than copying native-input lifecycle into another primitive.
Reset synchronization runs after native dispatch/default actions in the next task, with teardown
cancellation; WebKit can flush capture-listener microtasks before bubbling cancellation (ADR 0025).
The bridge serves browser behavior: CVA and Signal Forms work independently and need no extra input
for their Angular model connection. Direct access to a button/div does not turn it into an editable
HTML form control. Reuse an existing native input when it represents the submitted value. Prefer
the readonly `nativeInput()` signal; callback `inputRef` is the Base UI naming adaptation. Keep
application validation with Angular and Field, and browser constraints on the native control.
