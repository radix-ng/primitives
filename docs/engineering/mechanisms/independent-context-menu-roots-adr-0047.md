# Independent Context Menu Roots (ADR 0047)

A self-scoped Menu boundary resets disabled/command
ownership while retaining shared floating ancestry. Genuine Menu submenus continue to inherit their
new owner. Internal backdrops register their owning floating context; foreign injected backdrops
do not dismiss an enclosing menu. Isolation keeps registered descendant popup ancestry, including
retained closed portals. Context Menu uses first-tabbable initial focus with popup fallback; menu
items remain unhighlighted. Focus Scope keeps bounded weak return targets per Document so replacing
and removing the previously focused popup can return to a surviving control. Use the composing
manager's captured pre-open target when isolation has already blurred the page. Preserve explicit
final-focus overrides, deliberate moved focus, Angular DI and embedded-view destruction.
