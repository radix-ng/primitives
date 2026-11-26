# Tooltip comparisons

Run `pnpm test-parity tooltip` to compare Angular with pinned Base UI in Chromium, Firefox, and WebKit.
The suite covers `defaultOpen` initialization, a late default, controlled precedence and release,
delayed hover, keyboard focus and Escape, and ignored, accepted, or canceled requests. It observes
the popup's mount state, `data-popup-open`, request reasons, and the trigger's description.

Angular keeps `role="tooltip"` on its open popup and links it to the trigger via `aria-describedby`.
The pinned Base UI popup renders without that role and description in these fixtures. When `open`
becomes undefined, Angular resumes its local state and pinned Base UI retains the last controlled
value. The suite records both differences at the affected checkpoints. See the
[Tooltip matrix](../../../../packages/primitives/tooltip/PARITY.md) for the remaining cases.
