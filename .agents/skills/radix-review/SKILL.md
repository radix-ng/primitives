---
name: radix-review
description: Review Radix NG primitive changes for behavior defects, Base UI contract drift, accessibility, Angular DI/signals and missing regression coverage.
---

# Review a Radix NG primitive

Review the requested scope. Read [patterns](../../../docs/engineering/patterns.md) and relevant [composition](../../../docs/engineering/composition.md) or [mechanism notes](../../../docs/engineering/mechanisms.md), rather than loading the entire project handbook.

- Compare source handlers and per-part attributes with [the pinned upstream reference](../../../docs/engineering/upstream-reference.md). Check accepted ADRs and reviewed expected differences before reporting divergence. Compare event reasons, cancellation, native activation, focus, portals and close completion as well as API names.
- Verify native host semantics, labels, keyboard/RTL, focus restoration and disabled/read-only behavior against the applicable pattern. Native and non-native hosts can legitimately have different disabled semantics.
- Check signal state ownership, default/controlled behavior, typed context interfaces, required/optional injection, cleanup and render timing. Prefer `computed`/`linkedSignal` for derived state; do not demand a particular effect shape without a behavioral reason.
- Check headlessness, boolean per-part state attributes, exported API and shared utility reuse. Thin positioner inheritance and projection owners are documented exceptions to ordinary composition choices.
- Check whether coverage can observe the failure. jsdom cannot establish geometry or real-browser interaction behavior; use [radix-testing](../radix-testing/SKILL.md).
- When the review covers public API, demos or docs, check [radix-storybook](../radix-storybook/SKILL.md) and whether the consumer bundle needs regeneration. A narrowly scoped runtime review need not audit every story.

Report actionable findings in severity order with file/line, concrete trigger, consequence and missing coverage. Distinguish defects from optional suggestions. State checks actually run and any remaining uncertainty; do not infer correctness from placeholder specs.
