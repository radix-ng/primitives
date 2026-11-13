# Menu-family Root removal (ADR 0046)

Application `@if` destruction uses existing embedded-view
and DestroyRef ownership, including open children, retained portals and unfinished exits. Do not
invent close/completion events when an application removes the Root. The shared parity block checks
native focus and surviving/missing final-focus targets, background accessibility/hit testing, style
restoration and wheel scrolling. Raw inert/aria-hidden and focus-guard markup is recorded separately;
all owned artifacts must disappear after destruction. New Roots survive old hover/exit deadlines.
Presence animation completion reads the current `present` signal before the queued render effect,
so a late hold/reopen preserves the same view and its state. Disposal invalidates pending animation
versions; native completion cannot destroy a renewed view or clean up an already disposed owner.
