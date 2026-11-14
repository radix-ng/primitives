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

- `native-button-focus`: macOS WebKit keeps focus on Angular's popup when a Close press is canceled,
  whereas the pin focuses Close. Angular leaves native button tabindex unset; Base UI's button
  hook emits explicit tabindex. The cancellation, open state and completions still match.

This macOS WebKit exception is exact: a changed or disappeared difference fails.
They are limitations, not full parity. See [the source matrix](../../../../packages/primitives/popover/PARITY.md).
Hover delays/grace areas, detached handles/payloads, custom portals, RTL/Arrow and real device/assistive-technology coverage remain separate work.

## Close lifecycle

Ten lifecycle scenarios compare `keepMounted`, natural CSS exit completion, explicit/duplicate
`unmount`, deferred and late holds, cancellation, stale callbacks, modal background recovery and
reopening during both CSS and deferred exits. F8 invokes the real Root close action, F9 the real
unmount action, and F10 the original callback retained from the first close request. Framework
fixtures leave open state uncontrolled and observe native draft/focus; they do not fake CSS finish.
The default autofocus fallback is shared with Select and other floating consumers.

The late-hold case shares Menu's paused CSS exit. F10 requests the hold before the scenario
finishes the real animation through WAAPI, so protocol latency cannot exhaust a short exit first.
Draft value and native focus remain compared with the pin throughout the hold.

## Menu composition and outside-focus refinement

Menu's item-to-Popover suite compares both independent and nested editors, persistent geometry,
completion, hover and native return focus. The shared manager now protects transient trigger blur
without suppressing outside focus-out. The previous outside-close-reason entries are removed: the
actual native reason matches the pin. Marker and control isolation keep-sets remain separate,
keeping a modal trigger usable while unrelated controls stay inert. See
[ADR 0066](../../../../docs/adr/0066-menu-item-popover-focus-boundaries.md).
