# Menu initial focus (ADR 0052)

Popup activation and trigger recovery share one DOM selector for
first/last enabled entry. All-disabled roots focus Popup without highlight; later arrows/Home/End
continue to include disabled items. An open SubTrigger keeps its Tab entry independent of highlight.
The common portal tabbability bridge sets up after rendering, but an owning-view effect disposes
its current listener/snapshot resource before new host bindings. Idempotent after-render cleanup
still handles replacement/destruction. Untrack initial logical-inside inspection to avoid unrelated
subtree dependencies restarting that resource. Root retained reopening keeps one authored Tab stop.
Nested Tab departure was subsequently covered by ADR 0053 below.
