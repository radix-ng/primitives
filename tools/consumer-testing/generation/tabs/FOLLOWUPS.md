# AppTabs follow-up

## Chromium: Enter followed by Tab before selection rendering

The original `tabs-consumer/1` matrix remains **34/36**. Both failures are the Tab-exit case in Chromium
on the generated demo and independent parent. The trace matrix is
`dist/consumer-generation/2026-11-15-tabs-first/matrix.md`.

The frozen test sends Tab immediately after Enter without observing the new selected state. The
separate diagnostic reproduces focus entering the old panel and then falling to body when Angular
hides it. Waiting for selected-tab, visible-panel and parent-state observations before Tab passes
both focus assertions on all six engine/consumer pairs.

For a separate reevaluation, preserve the frozen test and raw result, add observable state assertions
before dependent navigation in a versioned copy, and run the complete matrix on unchanged code. Do
not replace the original verdict with the six supplemental passes. No new generation is needed.

If rapid pre-render input must be supported, investigate the same sequence with a direct primitive
reference to distinguish framework scheduling, primitive behavior and wrapper effects before proposing
a runtime fix. At the time of that experiment, the evidence confirmed timing sensitivity rather
than primitive ownership or a skill defect.

## Direct primitive comparison, 2026-11-16

The [Tabs keyboard matrix](../../../../packages/primitives/tabs/PARITY.md#keyboard-matrix--settled-navigation-covered-rapid-handoff-unresolved)
now exercises real Angular and pinned Base UI parts, without generated wrappers. Native Enter/Space
or an automatic-selection arrow is followed by Tab without a selection-render wait. Raw key records
retain the actual selected DOM tab at each key capture; the complete native focusin sequence is
compared rather than repaired.

The macOS baseline passes 146/150 comparisons: all 37 ordinary-navigation cases pass in three
engines, while four rapid cases lose Angular focus to BODY in Chromium. No reference assertion
fails. Controlled/uncontrolled and retained/structural cases reproduce the old-Panel handoff before
Angular renders the new selection. This establishes the race in direct primitive composition;
it does not change the frozen consumer result or attribute a defect to consumer-skill generation.

A synchronous-render policy remains undecided. The primitive runtime has not been changed, the new
rapid comparisons currently fail, and no reviewed differential exception accepts that behavior.
See the linked matrix and `dist/parity-testing/tabs/keyboard-native-baseline/` for the exact scope.

The same fixtures pass 143/150 on Linux/arm64, with all seven failures in rapid Chromium cases
and no reference assertion failures. Automatic selection can also revert: native Tab visits the old
tabindex-0 Tab and triggers an additional focus request before rendering. The direct primitive issue
therefore includes selection/callback parity, not only focus loss. Linux observations remain in
`dist/tabs-keyboard-linux/results/`.
