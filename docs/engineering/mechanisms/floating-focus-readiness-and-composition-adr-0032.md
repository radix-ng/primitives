# Floating focus readiness and composition (ADR 0032)

Popover/Menu supply Positioner readiness to
the shared manager. A render effect and per-open linked latch wait for layout without reactivating
autofocus on resize. Portal tab order is restored before default candidates are collected. Managed
modal scopes loop; logical close releases traps immediately. Paused parents cannot race child
return focus. Default interaction-driven return uses the actual trigger behind the moved-focus
guard; programmatic opens retain previous-focus semantics. The independent Select/Popover pinned
suites and three-engine floating consumer regressions are tracked in `apps/parity-testing/COVERAGE.md`.
