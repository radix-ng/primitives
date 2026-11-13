# Pointer movement

core `createPointerMoveGuard` tracks scope-local viewport coordinates to
distinguish real travel from stationary scroll/leave events, including real WebKit travel with zero
movement deltas. Select observes moves in document capture while open and reuses the same event
classification in items. Other consumers of the existing pure `isStationaryWebKitPointer` are unchanged.
