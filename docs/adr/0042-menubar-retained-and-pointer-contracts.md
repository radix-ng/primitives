# 0042 — Menubar retained portals, pointer cancellation and reference anatomy

Status: Accepted

Date: 2026-11-10

## Context

ADR 0041 left retained Menubar portals and nested pointer/selection cancellation unmeasured.
The public example also used always-mounted positioners and a conditional submenu, whereas the
pinned Base UI hero uses Portal → Positioner → Popup for every root and submenu.

## Decision

Use the pinned hero's File/Export, Edit, View/Layout and disabled Help structure in the Default,
Vertical and KeepMounted stories. Menu items and submenu triggers use div hosts, matching the
reference defaults. Keep Radix NG's shared demo styles, semantic tokens and icons. Angular Roots
remain DI-owned `ng-container`s; structural `ng-template rdxMenuPortal` owns view lifetime.

Extend Menubar to 61 scenarios / 183 comparisons. Five retained cases cover root switching in
LTR/RTL, nested keyboard/pointer paths, canceled closing, actual DOM identity on reopening and Tab
exclusion of settled hidden views. A retained controlled-state case covers external sibling changes.
Four pointer cases cancel child hover opening, parent-item hover closing and child/parent selection
closing, then retry through application policy. Original events and callbacks remain unnormalized.

Submenu hover has separate entry-delay and pointer-rest intents, as in the pin's `hoverIntent.ts`.
A veto leaves the other intent available; an accepted opening makes it a no-op. Leave/out, keyboard
opening, accepted closing and destruction cancel pending timers. These are actual pointer timing
policies, not duplicated callbacks or React state machinery. Hover coordination runs before the
shared stationary-pointer highlight guard so a close veto still receives its actual request.

An already-rendered popup captures actual pre-open DOM focus before a coordinator moves it. A
focus-only opening uses programmatic interaction intent. Default return can then prefer that prior
element; hidden/disconnected elements resolve through the existing Menu DI owner chain to a
surviving visible trigger. This matches the pin's retained return-focus contract without a global
focus history or mirrored open state. Escape uses the same resolved target. Explicit Popup focus
policies remain owned by the existing focus manager.

## Evidence and limitations

The scenarios wait for real parent opening/focus before entering a child. Pointer tests establish a
native cursor position; retained Tab checks preserve the browser's actual next focus rather than
assuming native buttons participate in every platform's Tab order. Saved element handles prove view
reuse. The hover-close retry records trusted pointer coordinates and real movement deltas.

Two exact WebKit focus/highlight pairs extend the existing `zero-delta-pointer-travel` limitation:
the pin drops trusted travel whose movement deltas are zero, while Angular's shared coordinate guard
honors the changed viewport position. The same pair was measured on macOS and Linux. Retained
focus and completion require no new exceptions; the prior nine reviewed pairs remain.

Storybook browser checks cover portal ancestry, the disabled Help trigger, div item hosts, nested
keyboard entry and retained Tab exclusion. Closed Default/Vertical/KeepMounted and open File/Export
screenshots cover the new anatomy. Shared Menu and Context Menu suites guard reuse of the changed
hover and return-focus behavior.

Custom horizontal popup orientation, additional API/lifecycle combinations and real devices/AT
remain separate audits. This increment does not establish complete component certification.
