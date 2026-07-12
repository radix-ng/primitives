# Architecture Decision Records

This directory holds the project's ADRs — one Markdown file per significant decision. To add one, copy
[`template.md`](template.md) to `NNNN-kebab-title.md` (next free number, zero-padded to 4 digits), fill it
in, and run `npx prettier --check "docs/adr/*.md"` before committing.

## Header convention

Every ADR starts with `# ADR NNNN: Title` followed by exactly this metadata block, in this order:

```
- Status: <one token>
- Date: YYYY-MM-DD            # optional suffix: (accepted|implemented|updated YYYY-MM-DD)
- Decision owners: Radix NG maintainers
- Related: <ADR NNNN …, packages/…, apps/…>
```

- **`Status` is one token**, nothing else on the line — no phases, no parentheticals:

  | Token                    | Meaning                                                               |
  | ------------------------ | --------------------------------------------------------------------- |
  | `Proposed`               | Decision written, not yet adopted.                                    |
  | `Accepted`               | Adopted. Also the terminal state for shipped work (no `Implemented`). |
  | `Rejected`               | Considered and declined; kept for the record.                         |
  | `Deprecated`             | Was accepted, no longer the guidance.                                 |
  | `Superseded by ADR-00XX` | Replaced by a later ADR (hyphen, zero-padded).                        |

- Progress, phase breakdown, or what is deferred goes in an **`> **Implementation status (YYYY-MM-DD): …**`**
  note under the block (see ADRs 0009 / 0010 / 0015 / 0017), or an in-body section — **never** in `Status`.
- **`Related:`** is the single label for every reference kind (ADRs, packages, apps), listed inline.

## Index

Keep this table in sync when adding or re-statusing an ADR.

| ADR                                                                          | Status                 | Title                                                                                |
| ---------------------------------------------------------------------------- | ---------------------- | ------------------------------------------------------------------------------------ |
| [0001](0001-angular-composite-navigation-layer.md)                           | Accepted               | Use Angular Composite as the Shared Navigation Layer                                 |
| [0002](0002-popper-arrow-base-ui-alignment.md)                               | Proposed               | Align the Popper Arrow with Base UI (stop hiding the uncentered arrow)               |
| [0003](0003-popover-base-ui-like-angular-anatomy.md)                         | Superseded by ADR-0010 | Prefer a Base UI-like Popover Anatomy with a Template Portal Directive               |
| [0004](0004-field-signal-forms-adapter.md)                                   | Superseded by ADR-0018 | Keep Field Form-Agnostic and Defer Signal Forms Adapter                              |
| [0005](0005-prefer-owned-floating-ui-stack-over-angular-cdk-menu-overlay.md) | Accepted               | Prefer the Owned Floating UI Stack over Angular CDK Menu and Overlay                 |
| [0006](0006-core-data-attribute-helpers.md)                                  | Proposed               | Centralize Headless State → `data-*` Mapping in Core                                 |
| [0007](0007-analogjs-markdown-driven-docs-app.md)                            | Rejected               | Author Documentation as Markdown in a New AnalogJS App                               |
| [0008](0008-cropper-pointer-events-unification.md)                           | Proposed               | Unify Cropper Drag on Pointer Events                                                 |
| [0009](0009-performance-benchmarks-vitest-browser-mode.md)                   | Accepted               | Performance Benchmarks via Vitest Browser Mode                                       |
| [0010](0010-structural-portal-presence.md)                                   | Accepted               | Structural `*rdxXxxPortal` (portal + presence merged) — anatomy flattening           |
| [0011](0011-waapi-presence-exit-detection.md)                                | Accepted               | WAAPI-based exit detection for presence                                              |
| [0012](0012-thin-positioners.md)                                             | Accepted               | Thin positioners — single-source popper inputs, unified CSS variables                |
| [0013](0013-dev-mode-diagnostics.md)                                         | Accepted               | Dev-mode diagnostics & debuggability                                                 |
| [0014](0014-unify-combobox-autocomplete-engine.md)                           | Accepted               | Unify Combobox & Autocomplete on one engine                                          |
| [0015](0015-base-ui-aligned-dismissal-engine.md)                             | Accepted               | Base UI-aligned dismissal engine                                                     |
| [0016](0016-scroll-lock-parity-and-activation-policy.md)                     | Accepted               | Scroll-lock parity and activation policy                                             |
| [0017](0017-floating-focus-manager.md)                                       | Accepted               | Floating focus manager (`RdxFloatingFocusManager`)                                   |
| [0018](0018-signal-forms-adapter.md)                                         | Accepted               | Ship the Signal Forms Adapter (`[rdxSignalField]` + `[rdxSignalForm]`)               |
| [0019](0019-signal-forms-only.md)                                            | Rejected               | Standardize on Signal Forms — Remove CVA, Reactive/Template Support, and RdxFormRoot |
| [0020](0020-signal-forms-submit-delegation.md)                               | Accepted               | Opt-in Angular Signal Forms Submit Delegation                                        |
| [0021](0021-ng-control-field-adapter.md)                                     | Accepted               | Bridge `NgControl` State into Field Explicitly                                       |
| [0022](0022-null-empty-values-for-signal-date-time-fields.md)                | Accepted               | Use `null` for Empty Signal Date and Time Fields                                     |
| [0023](0023-complete-floating-focus-manager-rollout.md)                      | Proposed               | Complete the floating focus manager rollout (remainder of ADR 0017)                  |
