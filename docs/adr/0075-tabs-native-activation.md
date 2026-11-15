# ADR 0075: Activate Tabs through native and composite clicks

- Status: Accepted
- Date: 2026-11-15
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [ADR 0074](0074-tabs-native-identities.md)

## Context

Tab committed Enter/Space on keydown. A native button could subsequently emit its own click, retrying
a canceled selection in the same physical press. Non-button hosts did not receive a keyboard click,
Space could scroll the page, descendant keys activated the enclosing Tab, and disabled links retained
navigation defaults. Pointer presses also left the unused half of their document listener pair
registered, including when the Tab was destroyed.

The Base UI 1.9.0 pin (`cf696d6f6e08c699c5bda24d5a033430909f2285`) uses composite button behavior.
Native button/link Enter belongs to the browser; composite Space dispatches one click on keydown.
Disabled composite tabs suppress native defaults while remaining arrow-focusable.

## Decision

- Keep Root's native Angular model and cancelable output as selection owners. Tab requests selection
  from click or automatic focus, with the original native event.
- Leave Enter on native buttons and links to browser activation. With `nativeButton=false`, other
  hosts dispatch a keyboard click for Enter, respecting a prevented keydown default.
- Dispatch composite Space through the owned `dispatchClickWithModifiers` utility. Prevent its
  scrolling default and the native button's keyup default. Preserve modifiers and synthesized click
  trust/target rather than substituting the originating keyboard event in the change callback.
- Ignore activation keys from descendants. Disabled Tab handlers prevent click/pointer defaults and
  every keydown default except Tab; Composite still processes arrow navigation. Enabled native button
  hosts expose `aria-disabled=false`, as in the pin's focusable composite button contract.
- Use actual `focusin` for automatic activation. A held secondary press suppresses activation; its
  release allows subsequent keyboard focus to activate again.
- Use the host's owner document for press listeners. Release both listeners together on pointerup,
  pointercancel, replacement of a pending press, or `DestroyRef` cleanup.

Angular's existing optional `eventDetails.trigger` remains the initiating native Tab. Pinned Tabs
leaves that property unset. The driver retains both actual values in raw measurements and asserts
each framework's policy separately. Callback equivalence covers native event type, trust, target,
modifiers, reason, direction, cancellation and ordering; it does not claim equal trigger availability.
No React event wrapper or controlled-state mirror is introduced.

## Evidence and limits

Forty activation cases exercise actual Enter/Space/down/up/repeat, native button/div/link/anchor
hosts, canceled requests followed by a second physical request, modifiers, consumer-prevented Enter,
disabled keyboard/pointer defaults, descendant keys, form non-submission and held secondary presses.
All forty Chromium comparisons failed before the runtime change with all reference assertions
passing. Eight unit regressions also failed before the change, including paired listener disposal.
The baseline remains in `dist/parity-testing/tabs/before-activation-fix/`.

Native event capture/bubble stages and change callbacks are compared without changing either
implementation's state or events. Link Enter repeat follows the browser's native repeat policy;
all callbacks must still carry clicks and keyup cannot add a request. The existing six exact G5
identity exception fields remain unchanged; activation adds no differential exception.

Secondary-press fixtures prevent the OS context-menu default and require a captured native pointerup
before the next focus request. Without that consumer policy, WebKit could consume the release in its
native menu; no release had reached the Angular page. This keeps the tested press/release premise
observable. Native OS context-menu interaction remains a separate combination. These guards were
added after the saved Chromium baseline, whose failure verdict is unchanged.

Real touch/pen and devices, native pointer cancellation/removal during a held gesture, authored
submit/reset button types, auxiliary link activation and native browser shortcuts remain separate
combinations. Unit disposal checks establish listener ownership; they are not native gesture evidence.
