# Floating focus readiness and composition (ADR 0032)

Popover/Menu supply Positioner readiness to
the shared manager. A render effect and per-open linked latch wait for layout without reactivating
autofocus on resize. Portal tab order is restored before default candidates are collected. Managed
modal scopes loop; logical close releases traps immediately. Paused parents cannot race child
return focus. Default interaction-driven return uses the actual trigger behind the moved-focus
guard; programmatic opens retain previous-focus semantics. The independent Select/Popover pinned
suites and three-engine floating consumer regressions are tracked in `apps/parity-testing/COVERAGE.md`.

Menu item editors use persistent anchors or keep their trigger mounted. Popover family boundaries,
trigger-only transient blur protection, and separate marker/control isolation keeps are documented
in [ADR 0066](../../adr/0066-menu-item-popover-focus-boundaries.md).

Restore-focus policies repair removed or hidden content only. The popup target policy must preserve
an ordinary blur of a still-visible field, including a secondary outside press which produces no
click. Popover's three secondary-press comparisons retain native focus and outside-close reasons.
The queued initial-focus fallback also honors the scope's existing paused state, so a parent's
remaining animation-frame retry cannot take focus during a child's close/return handoff.
