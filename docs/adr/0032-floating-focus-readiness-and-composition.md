# 0032 — Activate floating focus after layout and preserve nested scope ownership

Status: Accepted
Date: 2026-11-10

## Context

Select-only checks did not protect other consumers of shared Popper/focus changes. A pinned Popover
suite and nested Select/Dialog/Popover scenarios exposed autofocus before positioning, portal
tabindex suppression, missing modal Tab loops, and a parent restoration racing a child's return.
Navigation Menu also had an independent queued entry-focus request that could outlive a Tab move.

## Decision

Use an Angular render effect and a linked readiness latch in FloatingFocusManager. Popover/Menu
provide their actual Positioner's readiness. Once ready, an open scope stays active through layout
updates; resizing does not trigger another autofocus. Restore portal tab order before enumerating
the default initial-focus candidates. A false initial-focus policy remains authoritative.

Compose managed modal looping through FocusScope configuration. Gate traps and looping on logical
open immediately while preserving teardown/return-focus timing. A paused parent does not restore
focus over its active child. Interaction-driven default return may use the native trigger when it
was never focused (Safari button click preference); the existing moved-focus guard and explicit
return policies remain authoritative. Programmatic opening retains previous-focus semantics.

Navigation Menu abandons queued entry focus when focus has moved, the item has closed or its view
has been destroyed. Do not reimplement these policies with a React-style store, clone event order,
or add artificial tabindex to all native Angular buttons. Select's default virtual focus and
close-on-focus-out policy stay behind their existing real-AT verification gate.

Dialog forwards the manager's existing `getInsideElements` input for explicit external controls.
The outside-scroll story keeps its scrollbar in the modal isolation keep-set and registers it with
`rdxFloatingInside` for dismissal containment. Do not exempt every trigger or the whole viewport
from background isolation; an empty viewport press must still dismiss.

## Evidence and limits

Run independent pinned Select and Popover suites plus floating consumer Storybook checks across
three engines in CI. The exact exceptions remain failures if their values change or disappear.
See [coverage](../../apps/parity-testing/COVERAGE.md). Browser regression coverage alone does not
establish API parity; real devices and assistive technology remain pending.
