# Menu portal Tab handoff (ADR 0053)

Structural portals provide their ViewContainerRef declaration
comment through a neutral DI token, avoiding a portal-instance cycle during immediate embedded-view
mounting. Floating Focus Manager owns outside guards at that logical position for enabled, open,
non-modal popups. Existing content guards honor explicit neighbor overrides before using the
logical boundary. Native Tab traverses nested body-sibling portals and native parent controls;
Shift+Tab retains the owning trigger policy. Document close-on-focus-out sources must belong to
the current layer/descendants, not ancestor surfaces. Outside guards own their handoff and close
request without a duplicate focusout request. Menu retains SubTrigger identity on explicit native
guard focus; chain closes are parent-first. Guards disappear on close/modal change/destruction.
A fresh child's dropped close completion extends the existing exact pin lifecycle exception;
retained/backward focus and requests match. Cancellation and finalFocus are refined by ADR 0054
below. Forward Tab stays native; no React portal store is introduced.
