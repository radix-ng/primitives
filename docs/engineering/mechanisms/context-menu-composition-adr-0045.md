# Context Menu composition (ADR 0045)

Shared/nested areas consume the nearest native gesture even
when opening is canceled. Areas are not Menu triggers; their open/pressed state is shared. Sloppy
dismissal permits secondary presses and mousedown retries after a veto, with an active non-touch
pointerdown gate protecting long-press compatibility events. Backdrop hit testing and outside
isolation release through accepted Root events before the next native event, while effects own their
lifetimes. The shared lifecycle distinguishes atomic navigation return from reopening across a
microtask boundary. No forced Angular render or synthetic input is introduced.
