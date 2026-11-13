# Menu mixed input (ADR 0050)

Accepted Root reasons distinguish hover/arrow promotion from press
sessions. A first touch press promotes an arrow-opened child; repeated touch or keyboard activation
toggles a press-opened child. Preserve opening keyboard/ARIA classification on arrow entry into an
already open child and on a vetoed touch promotion. Use Root's accepted request metadata rather than
a second interaction store. Scroll policy follows the initial session input, independently of the
latest promotion request. Hybrid comparisons retain original activation clicks/Pointer Events and trust; keyboard routing
is refined by ADR 0051 below.
