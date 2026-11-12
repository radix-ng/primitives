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
| [0002](0002-popper-arrow-base-ui-alignment.md)                               | Accepted               | Align the Popper Arrow with Base UI (stop hiding the uncentered arrow)               |
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
| [0024](0024-share-label-registration-and-interaction.md)                     | Accepted               | Share label registration and interaction                                             |
| [0025](0025-separate-angular-forms-from-browser-input-bridge.md)             | Accepted               | Separate Angular forms from the browser input bridge                                 |
| [0029](0029-select-differential-behavior-checks.md)                          | Accepted               | Compare Select behavior against pinned Base UI sources                               |
| [0030](0030-select-item-alignment-and-anchored-fallback.md)                  | Accepted               | Compose Select item alignment with the common Popper engine                          |
| [0031](0031-select-live-anchor-tracking.md)                                  | Accepted               | Share Select anchor tracking and preserve manual placement sessions                  |
| [0032](0032-floating-focus-readiness-and-composition.md)                     | Accepted               | Activate floating focus after layout and preserve nested scope ownership             |
| [0033](0033-popover-shared-close-lifecycle.md)                               | Accepted               | Reuse popup lifecycle for Popover                                                    |
| [0034](0034-menu-differential-contracts.md)                                  | Accepted               | Compare Menu contracts through shared browser infrastructure                         |
| [0035](0035-menu-shared-close-lifecycle.md)                                  | Accepted               | Reuse popup lifecycle for Menu and preserve nested view ownership                    |
| [0036](0036-menu-pointer-and-composition-contracts.md)                       | Accepted               | Compare Menu pointer gestures, Context Menu and Menubar                              |
| [0037](0037-native-input-and-collection-focus.md)                            | Accepted               | Compare native context input and repair focus through collection changes             |
| [0038](0038-menu-collection-boundaries.md)                                   | Accepted               | Compare empty/nested collections and Menubar navigation boundaries                   |
| [0039](0039-menubar-transactions-and-composition.md)                         | Accepted               | Preserve Menubar cancellation, orientation and nested ownership                      |
| [0040](0040-menu-navigation-return.md)                                       | Accepted               | Share navigation return and compare vertical closing and nested cancellation         |
| [0041](0041-menubar-navigation-and-external-state.md)                        | Accepted               | Align horizontal Menubar return and compare external open state                      |
| [0042](0042-menubar-retained-and-pointer-contracts.md)                       | Accepted               | Compare retained Menubar and nested pointer cancellation with reference demo anatomy |
| [0043](0043-menu-orientation-and-keyboard-ownership.md)                      | Accepted               | Respect Menu orientation and portaled keyboard ownership                             |
| [0044](0044-affected-browser-checks.md)                                      | Accepted               | Select affected browser contracts and run engines concurrently                       |
| [0045](0045-context-menu-composition-and-native-dismissal.md)                | Accepted               | Preserve Context Menu composition through native event boundaries                    |
| [0046](0046-menu-root-removal.md)                                            | Accepted               | Compare Menu-family Root removal, cleanup and recreation                             |
| [0047](0047-independent-context-menu-roots.md)                               | Accepted               | Separate Context Menu state ownership from floating ancestry                         |
| [0048](0048-menu-empty-keyboard-requests.md)                                 | Accepted               | Resolve Menu keyboard requests across empty collections                              |
| [0049](0049-menu-trusted-touch.md)                                           | Accepted               | Compare Menu through trusted touch input                                             |
| [0050](0050-menu-hybrid-input.md)                                            | Accepted               | Preserve Menu sessions across mixed input                                            |
