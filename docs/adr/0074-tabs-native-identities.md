# ADR 0074: Associate Tabs through registered native identities

- Status: Accepted
- Date: 2026-11-15
- Decision owners: Radix NG maintainers
- Related: [ADR 0010](0010-structural-portal-presence.md), [Tabs matrix](../../packages/primitives/tabs/PARITY.md), [pinned comparisons](../../apps/parity-testing/primitives/tabs/README.md)

The structural Panel-host policy and its four exception fields are superseded by
[ADR 0077](0077-tabs-whole-panel-presence.md). The authored-ID policy remains in force; the evidence
below records the original identity increment.

## Context

Tabs derived both IDs and ARIA references from Root/value strings. This produced dangling references
when a part was absent, duplicate IDs for numeric `1` and string `'1'`, and reused identities when a
panel was replaced. A native custom Panel ID was not part of the registration contract. Indicator
also reconstructed a Tab ID instead of using the registered element.

The pinned Base UI 1.9.0 source (`cf696d6f6e08c699c5bda24d5a033430909f2285`) registers Panel IDs and
protects a replacement from stale cleanup. However, `TabsPanel.tsx` calls `useBaseUiId()` without its
authored `id` and registers that generated value; forwarded element props override the actual DOM ID.
The custom-ID comparison confirms a dangling `aria-controls` target on the reference side.

Angular Panel hosts are consumer-owned and remain mounted after structural contents exit. Removing a
React Panel and retaining an empty native Angular host are different lifetimes, already documented
by the existing two-directive pattern.

## Decision

- Use the owned `injectId` utility for an instance identity per Tab/Panel. Values select parts; they
  do not form DOM IDs. Changing a value preserves the instance ID, while replacing the part creates
  a fresh ID. Keep the existing Tab `id` input and add the equivalent native Panel input.
- Root registers actual Panel IDs by value. Latest registration wins; cleanup can clear only its
  own registration token. It does not restore an older shadowed registration after owner removal.
  Retained panels register again when their hidden state changes, as in the reference lifecycle.
- Register native Tab IDs through DI as well. Client label lookup follows the Composite collection's
  DOM order; native registration supplies labels during SSR and filters out stale collection entries.
  An absent native Tab/Panel removes its corresponding IDREF.
- Keep relationships to a real persistent Panel host even when its structural contents are absent.
  Do not invent a second logical mounting state to impersonate a removed React element.
- Preserve authored Panel IDs in both the DOM and the registered relationship. Do not copy the pin's
  generated-ID mismatch. Record that exact native-ID difference rather than rewriting either fixture.
- Indicator finds the selected registered native Tab, so authored IDs and new default IDs work. This
  change does not certify its remaining resize/transform/visibility behavior.

## Evidence and limits

Fifteen identity scenarios cover absent parts, authored/reactive IDs, replacement/registration
ownership, value edits, two roots, mixed numeric/string values, structural presence and Indicator
lookup. The initial Chromium run failed 13/15 cases with all reference assertions passing. Seven
Angular identity units failed before the change. SSR checks exercise authored and generated native
IDs and reciprocal links, including an empty persistent host.

Six exact exception fields cover two custom-Panel IDREF pairs and four persistent-host relationship/
identity-lifetime pairs. Generated IDs and raw IDREFs remain in the captured DOM; comparisons check
resolved native targets, uniqueness, reuse and identity stability. Exceptions do not suppress changes
to labels, selection, notification arrays or other scenarios.

Arbitrary imperative DOM-ID mutation, live cross-root moves and actual client hydration remain
separate combinations. Arbitrary object/function selection values remain outside the current
`string | number | null` API.
