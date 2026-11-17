# Collapsible/Accordion panel lifecycle follows Base UI

`collapsible` was realigned so the `Panel` **unmounts when closed by default** and a _mounted_ panel is kept via `hidden` rather than the old presence directive. The two-directive presence pattern was removed: `RdxCollapsiblePanelPresenceDirective` and `RdxAccordionContentPresenceDirective` are **deleted** (BREAKING); opt back into staying-mounted with the panel/root `keepMounted` input, and use `hiddenUntilFound` (panel `id` + `beforematch`) for find-in-page reveal. `onOpenChange` is now **cancelable** and emits `{ open, eventDetails }` instead of a boolean (BREAKING). Standalone Collapsible triggers stay focusable via `aria-disabled`. Accordion now composes Button and uses native disabled semantics on native buttons. AccordionItem still composes CollapsibleRoot via `hostDirectives`.

Native host detachment does not destroy the Angular child view. Accordion
[tracks complete Panel ownership as G5](../../../packages/primitives/accordion/PARITY.md);
this historical note does not certify child-view lifetime parity.
