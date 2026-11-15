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
a runtime fix. Current evidence confirms the timing sensitivity, not its ownership or a skill defect.
