# Native input and collection focus (ADR 0037)

`focus-scope/observeFocusRecovery` observes actual
inside focus and DOM mutations, including removals/moves without focusout in Firefox/WebKit. Floating
Focus Manager and Menubar supply target policies. Boolean restoration does not steal a visible
control's deliberate blur; virtual-focus Select explicitly restores to Popup. Menu highlight remains
index-based and is independent of DOM focus; managed refocus preserves that index. Menubar derives
roving identity from the focused trigger and current composite DOM order. Context Menu uses Pointer
Events with per-axis touch slop, cancels multi-touch, and native keyboard contextmenu focuses Popup.
Its pressed attribute derives from open state. Native input capabilities are probed/skipped explicitly.
Menu collection boundaries (ADR 0038) retain an empty list's first-index request in the existing
highlight signal and resolve a removed submenu trigger through surviving DI owners. The focus
manager excludes disconnected default anchors. Menubar uses the shared Composite search from the
current trigger's full DOM position, even after disabling it. Forward wrap onto itself preserves the
popup/item focus; return arrows match the pin's close/reopen sequence. Exact pin exceptions retain
an enabled Tab entry and actual nested completion.
Menubar transactions (ADR 0039) activate only accepted openings; native focus owns switch requests.
Coordinator inside elements inherit through Menu DI, preserving cancellation across portaled children.
Logical highlight survives those transfers. The shared dismissal Escape predicate receives its original
KeyboardEvent; the coordinator records ownership per native event before earlier listeners mutate
Root state. Synchronous return respects focus on another trigger. Vertical bar roving and cross-axis
opening follow orientation/direction; child forward arrows delegate to their owning Root. The bar interaction
mode observes accepted events from directly owned Roots; exact pin exceptions retain child completion.
Navigation return (ADR 0040/0041) is shared by submenu Popup and Menubar through Menu Root.
It consumes/forwards the original KeyboardEvent, requests closing and focuses a surviving DI owner
trigger. Nested menus clear their highlight even when the arrow close is canceled; a canceled Escape
keeps child focus. Menubar retains open-on-focus mode through accepted sibling/navigation closes
and clears it on other accepted closes, matching Base UI. This mode has independent semantics and
uses one signal rather than an aggregate of open Roots. Native vertical return focus reopens the
same popup without autofocus, preserving highlight/view identity and avoiding close completion.
An `afterRenderEffect` observes default/external open inputs and joins existing sibling activation
once their views exist; a WeakMap of handled per-Root values prevents unchanged open siblings from
re-enabling interaction mode after another menu closes. Default Menu focus targets Popup; native
requests retain their first/last-item policy, including canceled requests. Horizontal return callbacks
retain the original key before the parent bar consumes it. Shared FocusScope returns in a cancelable
post-unmount microtask, before another popup's frame-based autofocus. Remounting cancels the old
return; explicit targets and deliberate outside focus retain their policies. This matches the pin
without synthetic focus, coordinator timers or an interaction store (ADR 0041).
Menubar retention/pointer contracts (ADR 0042) use the pinned hero anatomy with shared Radix NG
styles: all root and child popups are structural Portal → Positioner → Popup views with default div
items. Entry-delay and pointer-rest intents remain distinct on SubTrigger; a veto can leave both
requests observable. Both timers cancel on leave/out, keyboard opening, accepted closing and destroy.
Item hover coordinates sibling closing independently of the highlight guard. A retained popup
captures actual pre-open focus before native trigger transfer; focus-only opening has programmatic
intent. Hidden items resolve through existing DI-owned Menu roots to visible surviving triggers.
There is no global focus history or mirrored open state. Reviewed Menubar differences include
WebKit coordinate-travel focus/highlight limits measured on both macOS/Linux, alongside
Tab-entry and nested-completion limits. Retained focus/completion otherwise match the pin.
Menu orientation (ADR 0043) reuses Composite axis/RTL keys for triggers, popups and submenu
entry. Parent orientation comes from Menu DI or the registered Menubar coordinator. Popup owns
main-axis navigation and cross-axis return; lifecycle-owned handlers relay the original key across
portals. A bubbled child key reaches the bar's delegated handler before that ancestor popup list,
while direct keys stay local. Internal navigation hooks take KeyboardEvent, not a horizontal offset.
Reviewed stale-tabindex differences retain an Angular Tab stop where the pin restores an old one
after synchronous return. Read the [coverage matrix](../../../apps/parity-testing/COVERAGE.md) and
[Menubar differences](../../../apps/parity-testing/primitives/menubar/expected-differences.json) for current scope and exceptions.

Dialog/Drawer shared demo styles use current boolean states; Drawer uses CSS transitions so gesture
updates do not replay entry keyframes. Browser exit tests pause/seek/finish actual WAAPI effects.
