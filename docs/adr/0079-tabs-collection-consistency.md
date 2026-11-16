# ADR 0079: Reconcile rendered Tabs collections and preserve Composite focus

- Status: Accepted
- Date: 2026-11-16
- Related: [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [comparison suite](../../apps/parity-testing/primitives/tabs/README.md), [Composite](../../packages/primitives/composite/README.md)

## Context

Composite registered items through an effect after an `afterNextRender` signal. Replacing native
Tabs/List views could publish an empty or partial map before new nodes registered. Root committed
fallbacks from that temporary map, losing a valid selection and emitting unwanted notifications.
Composite also retained an index rather than the highlighted native element. Removal/reorder could
leave the tab stop on another element or outside the collection. Angular `@for` moves can clear
native focus even when the same focused view survives; pinned Base UI retains it in these cases.
The primary reference remains Base UI 1.9.0 at `cf696d6f6e08c699c5bda24d5a033430909f2285`.

## Decision

- Use Angular render phases: Composite items register in `earlyRead`, Tabs List publishes the
  completed map in `write`, and Root reconciles selection in `read`. Metadata still derives from
  signals; no timer, forced render or independent selection mirror is introduced.
- Preserve the pin's distinction between an absent whole List and an existing empty List. Absence
  retains selection; an empty replacement of a previously populated List clears it. Refilling a null
  selection does not select automatically. Controlled roots do not perform consistency fallbacks.
- Keep automatic `initial`/`missing`/`disabled` policy and uncancelable commits with direction `none`.
  An explicit disabled default is honored until first enabled, then normal disabled fallback applies.
- Composite retains the highlighted element across index changes. If it disappears, retain an
  eligible same-index replacement or choose the active eligible item, then the first eligible item.
  List does not move that tab stop merely because the selected value is disabled.
- Composite owns preservation of its existing native focus during DOM moves. Observe child-list
  mutations only while a registered item or its descendant owns focus. Restore only a removed node
  that is connected again inside the same root, while focus is on the document body. Deliberate
  outside focus wins; removal/destruction and ordinary blur do not restore. Flush the current
  mutation records after native blur, release ownership when no move occurred, and clean up observers,
  listeners and pending work on destruction. Use core DOM guards and active-element traversal.
- Mark the synchronous restoration in Composite context. Tabs ignores it as an automatic activation
  request, preventing a second callback after a canceled focus request. Actual native focus events
  remain native and observable; no event or differential snapshot is rewritten.
- Earlier Composite registration also exposes Select metadata-only updates after its first async
  collection. Select now reconciles only changed value collections, preserving its existing
  first-load/cancellation contract instead of retrying on text metadata changes.

## Evidence and limits

The original 34 Chromium collection cases had **10 failures / 24 passes**, with zero reference
assertion failures, retained in `dist/parity-testing/tabs/before-collection-fix/`. Thirty-six final
cases include repeated native view moves with manual, automatic and canceled activation. Fixtures
mutate only application state using native keyboard commands. Assertions compare expected selection,
Panel state and exact callback traces on each framework, alongside differential native focus,
`tabindex`, direction and disabled state. DOM/IDs/IDREFs and native event details remain raw.

All **108 collection comparisons** pass across Chromium, Firefox and WebKit on macOS. All 108 rows also pass in Playwright 1.60.0 Noble Linux/arm64, one worker and original timeouts,
retained in `dist/tabs-collection-linux/results/`. The affected
consumer unit pass has **731 passing tests / five existing skips**, including **63 Tabs** and **31
Composite** tests. Three new Composite units cover removal/replacement/index fallback; three cover
repeated native focus moves, outside focus and deliberate blur. Ten focused Chromium Storybook
checks pass against a fresh build, including Menu and other Composite consumers. Library build,
consumer skill generation, lint, contributor checks and four selected SSR checks pass. All **33
Select dynamic-collection comparisons** also pass across three engines.

No differential exception is added. Full native event equality during focus restoration is not
claimed: Angular may emit an additional native blur/focus pair when its renderer moves the node.
The component contract preserves focus and avoids a duplicate activation callback. Resolved IDREF
parity during whole-List absence, live cross-root movement, actual hydration, nested focus scopes,
assistive technology and real devices remain separate work. Server render hooks remain absent;
server identity/markup checks do not establish client hydration behavior.
