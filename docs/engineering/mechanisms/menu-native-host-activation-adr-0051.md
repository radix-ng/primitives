# Menu native host activation (ADR 0051)

Item/LinkItem/CheckboxItem/RadioItem/SubTrigger share a
Menu-local keydown/keyup helper. Generic key handlers retain modifiers; Enter on actual button/link
uses the browser, while composite Space/custom-host Enter reuse core dispatchClickWithModifiers.
Click handlers own transactions and native application handlers run once. Button Space keyup avoids
a duplicate click. Native item buttons default to type=button only when no explicit type exists.
Popup supplies its existing query through a Root registration getter and clears
query/timer on close, including retained views. Space during search continues typeahead. The old
native-keyboard-events exceptions are superseded by matching activation clicks; hover/focus pairs
remain. Initial disabled-first keyboard focus is covered by ADR 0052.
