# Use the layout viewport for contextual popup shifting

- Status: Accepted
- Date: 2026-11-15
- Related: [ADR 0069](0069-popper-position-method-and-sticky.md), Menu audit A2

## Context

The visual viewport shrinks and pans during pinch zoom. Shifting a point-anchored Context Menu
against that moving boundary adds movement that the pinned Base UI implementation avoids.
Base UI 1.9.0 (`cf696d6f6e08c699c5bda24d5a033430909f2285`) sets shift.rootBoundary=layoutViewport
on a Context Menu root and on Navigation Menu. Ordinary Menu and Context Menu descendants do not
set that shift option. Context Menu's fixed positioning still applies through its entire chain.
The local Base UI checkout has the same policy; it does not select the comparison reference.

Floating UI DOM 1.8.0 supplies this root boundary natively, including scrollbar-gutter handling.
The previous 1.7.6 dependency cannot express it. See the
[upstream release](https://github.com/floating-ui/floating-ui/releases/tag/%40floating-ui%2Fdom%401.8.0).

## Decision

Raise the workspace dependency and the published @radix-ng/primitives peer minimum to ^1.8.0;
regenerate the lockfile. Reuse the existing Popper configuration policy: shift may set
rootBoundary=layoutViewport. The shared wrapper passes that option only to Floating UI shift.
Do not apply it to flip, size or hide. Explicit clipping boundaries continue to intersect the root
boundary normally. This policy does not promise that every coordinate remains fixed when other
middleware, the anchor or available dimensions change.

Menu's owner-dependent defaults select the policy only for the Context Menu point root. Navigation
Menu uses its existing static configuration provider. No new positioning input, custom viewport
rectangle calculation, platform override or React-specific state layer is needed.

## Verification

A focused unit assertion failed before the policy was wired. It verifies that only shift receives
the configured layout boundary and that the default remains the visual viewport.

Six differential cases reuse the placement fixtures, import the unmodified reference and run at
native browser scale 1/2/1 through Chromium CDP. They cover zoom/reset, a native touch scroll that
pans the visual viewport, RTL, an already-open submenu, an explicit Rect collision boundary and an
ordinary Menu control. The root uses the public shift/shift collision preset to isolate shifting
from independent flip behavior. Raw Playwright boxes, DOM client rectangles and viewport metrics
are retained; a panned Playwright box follows the visual origin, so the stability assertion adds
the measured viewport offset. No primitive/reference state is forced and no comparison exception
is added. Submenu keyboard entry/exit completes before the next gesture.

The six cases passed twice. A Storybook browser regression independently verifies Navigation Menu
alignment during page-scale emulation. Existing positioning/boundary and shared-consumer cases
are checked after the dependency update.

Affected-scope validation passed 570 unit tests, 132 pinned positioning comparisons with twelve
explicit capability skips, 60 shared-consumer checks and the separate Navigation Menu zoom check.
Library/Storybook builds, consumer generation, focused lint and agents:check passed. One existing
Popover unit raced the native dismissal-listener timer; it now waits for that task, rather than
treating Angular render stability as listener readiness. The full primitive suites remain CI gates.

Firefox/WebKit cannot perform these CDP actions; their twelve planned zoom comparisons are explicit
capability skips, rather than successful comparisons. Existing non-zoom cases run in all three
engines. This is browser emulation, not a real-device pinch or mobile software-keyboard/AT audit.
The pin remains unchanged. A2's positioning contract is addressed; Menu A3–A6 remain open.

## Alternatives

- Construct a client-size Rect: duplicates viewport/gutter and browser coordinate handling.
- Apply layoutViewport globally: changes the ordinary Menu/submenu contract.
- Use CSS zoom or mocked visualViewport values: fails to exercise native viewport geometry.
