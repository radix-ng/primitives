# Tooltip comparisons

Run `pnpm test-parity tooltip` to compare Angular with pinned Base UI in Chromium, Firefox, and WebKit.
The suite covers `defaultOpen` initialization, late defaults, controlled precedence and release,
and ignored, accepted, or canceled requests. It also covers live provider and trigger delays, the
handoff between siblings, timeout expiry and updates, disabling during a pending hover or an open
tooltip, and focus loss and re-entry. Checkpoints observe the popup's mount state, trigger markers,
request reasons, and the trigger's description.

Trigger-selection scenarios observe the popup's anchor geometry, live payload, and active ID.
They cover controlled and default IDs, implicit selection, late registration, same-ID replacement,
canceled removal, and imperative handoff through a detached handle.

Angular keeps `role="tooltip"` on its open popup and links it to the trigger via `aria-describedby`.
The pinned Base UI popup renders without that role and description in these fixtures. When `open`
becomes undefined, Angular resumes its local state and pinned Base UI retains the last controlled
value. Angular also cancels the hover timer on disable and clears `data-popup-open` whenever the
popup is hidden. In these fixtures, the pin still reports the pending hover and a `disabled` close
after the timer fires, and keeps `data-popup-open` after a disabled close is vetoed. Angular waits
to resolve an implicit anchor until there is exactly one registered trigger. The pin selects the
first registration when an already open root attaches two detached triggers without an ID. The
suite records these differences at the affected checkpoints. See the
[Tooltip matrix](../../../../packages/primitives/tooltip/PARITY.md) for the remaining cases.
