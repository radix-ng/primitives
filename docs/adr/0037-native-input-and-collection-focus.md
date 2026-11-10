# 0037 — Native input and focus through collection updates

Status: Accepted

Date: 2026-11-10

## Context

Native Context Menu input and dynamic Menu/Menubar lists require evidence beyond static keyboard
and hover fixtures. Browser removal/reparenting can drop focus without focusout, and Angular and
React can move different keyed DOM nodes while applying the same application data update.

## Decision

Extend the independent suites with native input and application-owned collection changes. Fixture
commands update Angular signals or React state with stable keys; they never set primitive focus,
highlight, open state or completion. Share pure collection data operations and native recording.

Context Menu uses Pointer Events for Angular touch handling. Preserve the press origin until
completion, cancel an armed timer on another finger, and apply the pin's per-axis 10px slop. Native
keyboard contextmenu uses popup focus; arrow navigation enters the list. Remove elapsed-time origin
guessing. `data-pressed` derives from open state, as in the reference, instead of a second press model.
Explicit application `openAt(..., 'first')` remains available.

Use trusted Chromium CDP events for hold/move/cancel/multi-touch, and Chromium/WebKit native tap.
Measure keyboard support on an independent plain button. Missing engine/OS input capabilities are
explicit skips, never synthesized DOM events or fixture-failure skips. Keep original native event
types, trust and geometry; Angular need not copy React's TouchEvent plumbing.

`focus-scope/observeFocusRecovery` records real inside focus and DOM mutations and repairs only
focus lost onto body, using a consumer target policy. Floating Focus Manager and Menubar compose
it. A moved surviving node can be restored without changing logical Menu highlight. Numeric
highlight and DOM focus remain separate: item highlight derives from Root, and arrow navigation
uses that index. A synchronous managed-repair flag suppresses changing the index merely because
Angular had to refocus a moved element. This is not a second focus/selection store.

Menubar keeps roving tabindex tied to the actually focused trigger after insertion/reordering.
Removed closed triggers retain native focus loss. Virtual-focus Select explicitly restores to its
popup, preserving its existing blur policy. Boolean `restoreFocus` repairs removal/reparenting and
does not steal an explicit blur of a still-visible control. Existing paused/closed scope guards apply.

## Browser regression timing

Dialog/Drawer demo CSS must use their current boolean state attributes. Drawer transitions support
swipe/snap state without restarting an entry keyframe; Presence already observes native transitions.
Intermediate-exit tests arm an observer before close, pause real effects, inspect state, and finish
through WAAPI. They do not synthesize animation events, retain views or wait on arbitrary short
animation windows. Drawer joins the floating consumer CI set; unavailable native CloseWatcher is
an explicit capability skip.

Angular hover geometry tests deliver native mouse moves with a defined 16ms JS-clock cadence so CI
transport delays do not become a deliberate pause beyond the 40ms rest budget. Differential pointer
scenarios retain real timers and raw pointer travel. Neither approach forces movement deltas.

## Consequences

Units guard removal without focusout and deliberate visible-control blur, while pinned browser
scenarios cover actual keyed DOM updates. The pin loses focus after focused item removal in some
engines; exact measured focus/highlight exceptions retain Angular recovery. Do not port that loss.
Focused-trigger disabling, empty/nested collections, backward switching's interim close/reopen
sequence, additional context areas and real devices/AT remain separate audit work.
