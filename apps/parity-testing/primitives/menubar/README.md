# Menubar behavioral comparisons

Run `pnpm test-parity menubar` with Node 24; preview port is 4509. Angular fixtures are AOT compiled
and React imports the unmodified Base UI 1.9.0 source pinned in `../../reference.json`.

Seventeen scenarios run in Chromium, Firefox and WebKit (51 comparisons): keyboard opening, native
mouse-down opening before release, closed roving focus, disabled-trigger skipping, keyboard/pointer
sibling switching, RTL direction, whole-bar disabling, item selection, canceled open/close requests,
outside dismissal and Tab. Changes retain their native events and reason/order; popup focus,
highlight, trigger tab order and actual completion outputs are compared.

Menu parts reuse the same native markup and recording as Context Menu; each suite owns its actions.
The fixture keeps uncontrolled Menu roots rather than mirroring state into a coordinator adapter.
Angular composes Menubar through a consumer `hostDirectives` directive, so its original selector
attribute is absent. Focus containment and the backdrop cutout use the registered native host.
Reports retain native events, trusted coordinates, timestamps and source commit/digest. There are
currently no expected differences.

Five collection cases cover insertion, closed focused removal, keyed reordering, unfocused disabling
and labels, followed by forward switching. Native focus repair is shared with floating menus.

This suite does not certify focused-trigger disabling, backward/single-menu switching details, vertical navigation, nested submenu
composition, touch/device behavior or assistive technology. See the
[source matrix](../../../../packages/primitives/menubar/PARITY.md).
