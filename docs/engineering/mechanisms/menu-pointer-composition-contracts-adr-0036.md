# Menu pointer/composition contracts (ADR 0036)

Menu hover focuses the popup, a click promotes it
to press ownership, and native down/move/up drives selection through the 200ms guard. Existing child
Root DI registration closes sibling branches on parent-item hover; grace callbacks retain native
events. Context Menu and Menubar have independent pinned suites and reuse actual Menu parts and
native recording. Menubar inherits disabling through a DI signal and includes the bar in the existing
focus manager's inside elements while switching. Context Menu captures actual pre-open focus for
that manager; its area is not an ordinary Menu trigger or ARIA identity. Preserve Angular queries
and DI ownership when sharing fixtures, rather than introducing a wrapper or React interaction store.
