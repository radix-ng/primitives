# ADR 0044: Select affected browser contracts and run engines concurrently

- Status: Accepted
- Date: 2026-11-11
- Decision owners: Radix NG maintainers
- Related: ADR 0029, ADR 0037, packages/primitives/menu, apps/parity-testing, apps/visual-regression, .github/workflows/ci.yml

## Context

CI ran every pinned suite and all floating Storybook regressions sequentially in one job. A small
primitive change therefore waited more than ten minutes. Repeated RTL submenu failures also showed
that timing stabilization alone did not address real fractional geometry at the popup entry edge.

## Decision

Derive changed paths from the last successful CI base using `nx-set-shas`. Read real primitive
imports, including story composition, and select reverse dependents. Discover pinned suite manifests
and reuse one floating spec catalog in both the planner and Playwright configuration. Helper changes
follow relative imports into browser specs. Documentation, generated skills, unit-only changes and
screenshot baselines skip these browser jobs; MDX edits also run docs navigation.

Shared core, build/configuration and unclassified changes, explicit full mode, or unavailable history
select all existing coverage. Keep full manual dispatch and the local all-suite command. Run selected
pinned suites in separate jobs and floating/docs checks in parallel engine jobs. Retain `parity` as
the required aggregate gate, including a successful empty selection and failure propagation.

Fix readiness races in the affected Autocomplete, Tooltip geometry and Popover lifecycle tests by
waiting for positioning, fonts/entry animation and the opening completion callback respectively.
Do not increase retries or hide failures behind broader expected differences.

Use a one CSS-pixel safe-polygon buffer for Menu. Native Chromium MouseEvent coordinates are integers
while popup geometry/hit testing retain fractions. A half-pixel buffer could reject the diagonal
gesture immediately before native hit testing entered a left-placed child. The regression uses the
fractional sizes measured in the Linux CI trace and real mouse movement with the existing bounded
gesture clock. Keep native close events and the existing hover velocity/rest policy.

## Consequences

Small edits run their relevant contracts in all three engines. Shared infrastructure changes still
pay for broad coverage. Parallel jobs duplicate setup/build work in exchange for shorter wall time.
Selection is guarded by tests covering transitive consumers, deleted helpers, shared changes, empty
selection and missing history. This is selection within existing browser coverage, not a claim that
every primitive already has a pinned suite or browser specification.

## Alternatives Considered

- Test only the edited family: rejected because shared engines and composed demos affect consumers.
- Run Chromium alone: rejected; the existing Firefox/WebKit coverage remains necessary.
- Increase submenu delays or retries: rejected; the reproducible failure was at a geometric boundary.

## Acceptance Criteria

1. Menubar-only changes select Menubar; Menu and Popper changes select transitive consumers.
2. Global changes, unavailable history and full dispatch retain all existing browser checks.
3. Failed or canceled selected jobs fail the required `parity` gate.
4. Fractional RTL diagonal traversal remains open across the three Linux engines.
