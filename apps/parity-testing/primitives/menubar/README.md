# Menubar behavioral comparisons

Run `pnpm test-parity menubar` with Node 24; preview port is 4509. Angular fixtures are AOT compiled
and React imports the unmodified Base UI 1.9.0 source pinned in `../../reference.json`.

Fifty-one scenarios run in Chromium, Firefox and WebKit (153 comparisons): keyboard opening, native
mouse-down opening before release, closed roving focus, disabled-trigger skipping, keyboard/pointer
sibling switching, RTL direction, whole-bar disabling, item selection, canceled open/close requests,
outside dismissal and Tab. Changes retain their native events and reason/order; popup focus,
highlight, trigger tab order and actual completion outputs are compared.

Menu parts reuse the same native markup and recording as Context Menu; each suite owns its actions.
Ordinary fixtures keep uncontrolled Menu roots. Eight explicit state cases exercise real external
inputs; they do not mirror primitive internals into a coordinator adapter.
Angular composes Menubar through a consumer `hostDirectives` directive, so its original selector
attribute is absent. Focus containment and the backdrop cutout use the registered native host.
Reports retain native events, trusted coordinates, timestamps and source commit/digest. There are
nine exact expected pairs for the reviewed differences described in the source matrix.

Five collection cases cover insertion, closed focused removal, keyed reordering, unfocused disabling
and labels, followed by forward switching. Native focus repair is shared with floating menus.

Focused/open disabling and backward LTR/RTL and single-menu switching are compared. Angular keeps
an enabled Tab entry. Return arrows now match the close/reopen/focus sequence without exceptions;
a single-menu RTL case also checks direction.

Four cancellation cases compare keyboard/pointer destination-open and source-close vetoes, overlap
and retry. Four vertical cases cover bar roving, LTR/RTL opening, popup items and Escape. Five nested
cases cover child Escape and pointer/forward-key switching, including composed popup hosts. A
three-enabled-destination RTL case checks actual direction. Bar state is recorded alongside focus.

Two return-arrow cases match immediate reopening in LTR/RTL through native trigger focus. The bar
retains interaction mode across sibling/navigation closes and resets it on other accepted closes.
Actual state, highlight, callback order and completion agree without vertical-return or overlap exceptions.
Four child keyboard-cancellation cases compare opening, Escape/arrow closing and retry, including
the independent focus/highlight handoff when an arrow close is canceled. A composed case wraps
popup, item and submenu-trigger directives without their original selector attributes.

Eight input-state cases compare default LTR/RTL/vertical opening, controlled initial opening,
external updates and sibling coordination, canceled requests and retry. F6 toggles File, F7 toggles
Edit and F8 resets application inputs; F5 permits a previously vetoed request. Actual callbacks,
focus and completion are retained, including a source reopening through return focus during an
external sibling open. No state-case exceptions are needed.

This suite does not certify custom popup orientation, nested pointer/selection cancellation, retained
portals, touch/device behavior or assistive technology. See the
[source matrix](../../../../packages/primitives/menubar/PARITY.md).
