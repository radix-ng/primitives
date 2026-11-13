# Menu empty keyboard requests (ADR 0048)

An arrow originating from Popup/non-item content enters
the list boundary even if an empty-list request already retained index zero. SubTrigger uses existing
Root.show transactions for first-item requests and Enter hover promotion. Newly mounted keyboard
children hand off through the existing Floating Focus Manager's position-ready scope activation;
its keyboard-only initial-focus policy pauses modal ancestors before entering a child. Discover
items inside activation so later data cannot restart initial focus. Do not restore the two ten-frame retry loops or add a
parallel pending-focus store. A repeated forward request resolves actual child items even if its
logical index is unchanged; exact pin exceptions retain Base UI's stuck focus/highlight in that case.
Return through a closed Menu owner instead of its retained trigger. The shared focus manager skips
hidden default references while preserving explicit and moved-focus policies. Async examples use
Angular resource parameters derived from actual Root.open, with application-owned abortable loading.
