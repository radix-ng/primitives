# Desktop browser verification

`tools/playwright/browser-projects.mts` is shared by the pinned
React/Angular comparisons and Select Storybook behavior checks. Both run Chromium, Firefox and
WebKit; screenshot baselines retain their existing configuration. Reports preserve per-engine
versions/platform and exact differences. Firefox child processes on macOS use isolated app-data in
the workspace cache rather than the installed browser's protected data. Desktop automation does not
close real-AT, real-device or saved-profile autofill gates.

Select differential fixtures also cover desktop modality/item alignment and whole-page RTL using
native input and independent geometry constraints. Root clears pending pointer origin on logical
close; keyboard opening has no invented origin. Trigger pressing can request a cancelable close.
Keep one native pointer dismissal path rather than reproducing the pinned React compatibility-mouse
retry after cancellation. Anchored Select alignment defaults to `center`; explicit `align="start"`
retains the previous default (Select `PARITY.md`).

Select Popup owns scrolling to the keyboard highlight. The shared `resizeEffect` observes the list
so scroll-button layout changes cannot cover the active option; first/last items include list
padding. Do not add unconditional highlight-scroll effects to individual buttons. The common resize
helper tolerates an unavailable ResizeObserver. Popup also owns scroll-edge signals shared by both
arrow parts; refresh them after native/library offset writes rather than relying on separate arrow
listeners. Item alignment now composes the common Popper wrapper for measurement, collision fallback
and arrow geometry (ADR 0030). A pure Select helper owns initial sizing and scroll expansion; native
height/offset writes are atomic. Render phases settle in-flow chrome before enabling the existing
focus manager. Request versions discard stale placement, and retained reopening measures afresh.
Rendered content side is separate from physical anchor-engine side; keep a single attribute writer.
Numeric geometry cases use a 2px tolerance. Transformed containers use a safe anchored fallback,
with the pin's overflow explicitly recorded; nested modal and real-device coverage remains open.
Shared Popper `disableAnchorTracking` gates native observation (initial placement/window resize still
run). Anchored Select defaults to tracking and 5px collision padding; item alignment defaults to frozen
metrics. Explicit tracking refreshes CSS metrics without continuously recomputing manual coordinates,
as in the pin; use anchored mode for a moving trigger. Select observes an initially unmeasurable trigger only until valid manual placement; there is no
second ongoing resize policy. Preferred side exists during initial measurement so consumer height constraints apply before
freezing. `data-anchor-hidden` is always observable; `hideWhenDetached` independently controls hiding.
Native viewport rectangles keep CSS-scaled trigger text aligned; exact pin limits are recorded in
`scaled-anchor-alignment` (ADR 0031). Native WebKit hover differences from the pin remain explicitly scoped.
