# Popover behavioral comparisons

Reference: Base UI 1.9.0, commit `cf696d6f6e08c699c5bda24d5a033430909f2285`,
archive SHA-256 `a54f36f00fe2fbba6a754491764edd77dea627c67efaa6bab1283f57b4bb8d4c`.
The reference is unmodified. Run `pnpm test-parity popover` on Node 24.

Twenty-five scenarios run in Chromium, Firefox and WebKit (75 comparisons): keyboard opening and
Escape/return focus; pointer close; trigger toggling; disabled trigger; canceled open/close;
outside press; modal and trap-focus Tab wrapping; explicit initial focus; trigger switching;
native text editing; live anchor translation/resize; frozen tracking; clipping and recovery.
The same actions observe native focus, expanded triggers, ARIA links, draft value, completion
callbacks, cancelable change payloads and the default clipping flag. Bounds and original event
types are retained in observations. No adapter forces focus, controlled state or completion.

Angular's explicit initial-focus target uses a native template reference. Base UI's `true` policy
is not copied as a new Angular boolean input. Positioning readiness is shared with Menu through
the floating focus manager; it does not reactivate autofocus on later layout updates.

## Exact reviewed differences

- `outside-close-reason`: on the outside button press, Chromium/Firefox (and Linux WebKit) close with Angular
  `outside-press` versus the pin's `focus-out`. Both dismiss once and preserve the same actual
  focus. Keep the native pointer pipeline; do not synthesize React's compatibility dispatch order.
- `native-button-focus`: macOS WebKit keeps focus on Angular's popup when a Close press is canceled,
  whereas the pin focuses Close. Angular leaves native button tabindex unset; Base UI's button
  hook emits explicit tabindex. The cancellation, open state and completions still match.

These four browser/platform-scoped exception pairs (three per tested platform) are exact: changed or disappeared differences fail.
They are limitations, not full parity. See [the source matrix](../../../../packages/primitives/popover/PARITY.md).
Hover delays/grace areas, detached handles/payloads, custom portals, RTL/Arrow and real device/assistive-technology coverage remain separate work.

## Close lifecycle

Ten lifecycle scenarios compare `keepMounted`, natural CSS exit completion, explicit/duplicate
`unmount`, deferred and late holds, cancellation, stale callbacks, modal background recovery and
reopening during both CSS and deferred exits. F8 invokes the real Root close action, F9 the real
unmount action, and F10 the original callback retained from the first close request. Framework
fixtures leave open state uncontrolled and observe native draft/focus; they do not fake CSS finish.
The default autofocus fallback is shared with Select and other floating consumers.
