# Adopt Base UI positionMethod and boolean sticky

- Status: Accepted
- Date: 2026-11-15
- Decision owners: Radix NG maintainers
- Related: [ADR 0067](0067-menu-contextual-positioning.md), [ADR 0068](0068-popper-collision-boundaries.md), `packages/primitives/popper`, `packages/primitives/menu`

## Context

The shared wrapper exposed positionStrategy with a fixed default and string sticky modes. Base UI
1.9.0 `cf696d6f6e08c699c5bda24d5a033430909f2285` exposes positionMethod=absolute and sticky=false.
Matching names alone would not establish behavior: document scrolling, live method changes and
an anchor leaving its collision boundary need actual browser evidence.

## Decision

Use positionMethod with absolute/fixed values and an absolute default in shared Popper inputs and
configuration. Use boolean sticky=false. The wrapper owns raw aliased inputs and computed effective
values, retaining the existing reactive-default approach. Explicit values override configuration;
undefined restores defaults. No legacy positionStrategy alias or string sticky mode remains.

Menu specializes two protected policy hooks without redeclaring inputs: Context Menu and its
descendant menus always use fixed positioning, even when absolute was requested. The point-anchored
root always uses zero arrow padding; child menus retain their ordinary arrow-padding input. These
are pin policies, not default overrides that a consumer binding can supersede.

Sticky=false keeps the attachment limiter; true permits side-axis shift without that limiter so the
popup can remain in the boundary after its anchor leaves. Existing Context Menu shift policy still
applies. The limiter accounts for actual arrow bounds and collision padding, including scaled arrows,
through Floating UI limitShift, as the pin does. hideWhenDetached remains a separate visibility policy.

The arrow cases exposed another shared discrepancy: sideOffset automatically included arrow height.
Match Base UI by measuring sideOffset from the popup box and reserving no implicit arrow space.
Keep arrow dimensions for arrow placement/transform origin and the attachment limiter.

## Migration

| Earlier API                            | New API                                               |
| -------------------------------------- | ----------------------------------------------------- |
| positionStrategy                       | positionMethod                                        |
| Omitted method: fixed                  | Omitted method: absolute; author fixed when needed    |
| sticky="partial"                       | [sticky]="false"                                      |
| sticky="always"                        | [sticky]="true"                                       |
| Side offset plus implicit arrow height | Side offset alone; add desired arrow space explicitly |

The same names/types apply to RdxPopperContentConfig. For example, an old sideOffset=8 with a
five-pixel arrow placed the popup thirteen pixels away. The new value places it eight pixels away;
author thirteen to preserve that old popup-box gap. Standard Menu/Popover/Tooltip demos author an
eight-pixel offset.

## Validation and remaining scope

Three focused assertions first failed for the old default method, sticky type and Context Menu arrow
padding. Further units cover config overrides/reset, Angular boolean attributes and forced policies
through Context Menu descendants. Native-wheel comparisons cover document scroll, absolute/fixed
switching while open, sticky on/off on both axes, scaled arrows and a live sticky change.

Fixtures reuse the existing boundary surfaces. App F3 changes only method or sticky values. Wheel
checks wait for measured scroll destinations, avoiding unreliable scrollend delivery in Firefox.
Individual impulses stay below the scrollport height because Firefox caps larger vertical impulses;
the test never assigns scrollTop/scrollLeft or changes primitive state to simulate scrolling.
Comparison state uses rendered bounds and CSS position; raw style top/left/transform remains attached.
Frameworks may encode the same coordinates with different CSS properties. Rounded CSS-pixel metrics
canonicalize signed zero; actual subpixel bounds are retained. No reference state/exception is changed.

Validation: 569 scoped unit tests passed; 126 pinned geometry comparisons passed across Chromium,
Firefox and WebKit (placement, boundaries and method/sticky); 57 shared-consumer browser regressions
and the Storybook ArgTypes check passed. Library/Storybook builds, consumer generation, focused lint
and agents:check passed. These are affected-scope checks; the complete Menu suite was not rerun.

Context Menu's layout-viewport policy during pinch zoom was separate A2 work, subsequently addressed
by [ADR 0070](0070-layout-viewport-shift.md). This increment does not certify real touch/AT behavior
or complete Menu parity.

## Alternatives considered

- Keep duplicate legacy aliases: complicates precedence and retains a second public contract.
- Rename inputs without changing defaults/geometry: leaves the observable parity gaps in place.
- Reimplement sticky positioning per primitive: duplicates Floating UI policy across consumers.
