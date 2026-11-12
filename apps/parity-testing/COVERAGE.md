# Primitive comparison coverage

Updated 2026-11-12. All pinned comparisons use `reference.json` (Base UI 1.9.0).
“Regression” means Angular-only evidence and must not be described as full Base UI parity.

| Family                                           | Pinned differential suite                                  | Browser regression scope                                                   | Next comparison increment                                                 |
| ------------------------------------------------ | ---------------------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- |
| Select                                           | 118 scenarios; 338 comparisons, 16 capability skips        | Forms, focus, presence, geometry, touch emulation                          | Real AT/devices; remaining lifecycle/API audit                            |
| Popover                                          | 25 scenarios; 75 comparisons                               | Portal, Arrow, dismissal, presence, scroll lock, live anchor               | Hover/grace areas, handles/payloads, RTL/Arrow                            |
| Menu                                             | 139 scenarios; 369 comparisons, 48 capability skips        | Keyboard/pointer/touch and hybrid input, ARIA, hover/grace, exits          | Native/custom-host activation; further API/lifecycle combinations         |
| Context Menu                                     | 61 scenarios; 165–166 comparisons; native capability skips | Independent Roots, keyboard/submenu ownership, dismissal, retained portals | Further overlay composition, real touch/AT devices                        |
| Menubar                                          | 87 scenarios; 261 comparisons                              | Popup/bar axes, mixed submenus, RTL, return focus, presence                | Further API/lifecycle combinations, touch and real AT/devices             |
| Combobox, Autocomplete                           | None                                                       | Input/list navigation, dismissal, projection, live anchor                  | Value/query/highlight and form contracts, then composition                |
| Tooltip, Preview Card                            | None                                                       | Portal, dismissal, live anchor and clipping                                | Delays, hover/focus ownership, grace areas                                |
| Navigation Menu                                  | None                                                       | Composite navigation, nested layers, focus races, live anchor              | Audit pin API before differential scenarios                               |
| Anchored Toast                                   | None                                                       | Live anchor, resize and clipping                                           | Lifetime, announcement and manager contracts                              |
| Dialog, Alert Dialog                             | None                                                       | Portal, focus, nested ownership, modal scrolling and presence              | Independent modal/return-focus comparison suite                           |
| Checkbox, Radio, Switch and remaining primitives | None                                                       | Existing units/stories vary; no global certification                       | Inventory each source/API contract, then native forms and keyboard suites |

`pnpm test-browser:floating` runs the selected floating consumer Storybook checks in Chromium,
Firefox and WebKit. `pnpm test-parity` discovers every pinned suite. Both commands run in CI.
Shared infrastructure validates exception uniqueness, scenario ownership and exact browser scope.
Per-family drivers retain their own DOM/interaction contract; extraction follows concrete reuse.

Priorities after this increment: Menu native/custom-host activation and further lifecycle/API combinations,
Popover hover/RTL coverage, then Combobox/Autocomplete. Native controls can follow independently; React event/store mechanics are
not API requirements. Real-device/AT and saved-profile autofill remain explicit external gaps.
