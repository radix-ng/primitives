# Menu focus-out/finalFocus (ADR 0054)

Escape's synchronous default return yields to false and
custom policies. The shared manager resolves callbacks once, but suppresses return after forward
portal handoff; a canceled handoff restores prior suppression and reopening resets it. Root Menu
publishes its existing trailing trigger guard as the forward target. Closing precedes tab-order
resolution; a veto retains logical entry, without a React flushSync equivalent. Shift+Tab is a
cancelable keyboard return request, preserving focus on a veto. Regular/link/checkbox/radio blur
keeps logical highlight; navigation/pointer leave/actual close own clearing, and SubTrigger re-entry
clears child highlight. The common tabbability bridge observes logical external guards while
retaining local shadow capture. A neutral restoreTabIndex callback lets Menu retain its authored
closed -1 policy rather than restoring a stale suspended 0 after an unchanged Angular binding.
Other controls/consumers keep saved attributes. New cases match without new exceptions. Projection,
callback-null/removed targets and Context Menu modal forward Tab remain separate audits.
