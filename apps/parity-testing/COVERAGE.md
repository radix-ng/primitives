# Primitive comparison coverage

Updated 2026-11-17. All pinned comparisons use `reference.json` (Base UI 1.9.0).
“Regression” means Angular-only evidence and must not be described as full Base UI parity.

| Family                                               | Pinned differential suite                                          | Browser regression scope                                                                                                                                                         | Next comparison increment                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| [Button](../../packages/primitives/button/PARITY.md) | 126 scenarios; 378 comparisons                                     | Native/custom hosts, consumer cancellation, Composite/Toolbar ownership, keyboard phases, disabled focus, modifiers, submit/reset                                                | Other compound families, authored host overrides, realms and real AT/devices                  |
| Select                                               | 118 scenarios; 338 comparisons, 16 capability skips                | Forms, focus, presence, geometry, touch emulation                                                                                                                                | Real AT/devices; remaining lifecycle/API audit                                                |
| Popover                                              | 28 scenarios; 84 comparisons                                       | Portal, Arrow, dismissal, presence, scroll lock, live anchor                                                                                                                     | Hover/grace areas, handles/payloads, RTL/Arrow                                                |
| Menu                                                 | 460 scenarios; 1320 comparisons, 60 capability skips               | Native hosts, indicators, highlights, handles, exits, Dialog/Popover composition                                                                                                 | Filtering; real AT/devices                                                                    |
| Context Menu                                         | 61 scenarios; 165–166 comparisons; native capability skips         | Independent Roots, keyboard/submenu ownership, dismissal, retained portals                                                                                                       | Modal forward Tab; further composition, real touch/AT devices                                 |
| Menubar                                              | 87 scenarios; 261 comparisons                                      | Popup/bar axes, mixed submenus, RTL, return focus, presence                                                                                                                      | Further API/lifecycle combinations, touch and real AT/devices                                 |
| [Tabs](../../packages/primitives/tabs/PARITY.md)     | 290 scenarios; 870/870 Linux; 81/81 rapid macOS; 4 reviewed fields | Defaults, whole-Panel exits, direction, native IDs/activation, Indicator geometry, dynamic collections/focus, arbitrary values, controlled ownership, native Tab render boundary | macOS WebKit native scroll variation; continuous motion, realms/hydration, remaining gestures |
| Combobox, Autocomplete                               | None                                                               | Input/list navigation, dismissal, projection, live anchor                                                                                                                        | Value/query/highlight and form contracts, then composition                                    |
| Tooltip, Preview Card                                | None                                                               | Portal, dismissal, live anchor and clipping                                                                                                                                      | Delays, hover/focus ownership, grace areas                                                    |
| Navigation Menu                                      | None                                                               | Composite navigation, nested layers, focus races, live anchor                                                                                                                    | Audit pin API before differential scenarios                                                   |
| Anchored Toast                                       | None                                                               | Live anchor, resize and clipping                                                                                                                                                 | Lifetime, announcement and manager contracts                                                  |
| Dialog, Alert Dialog                                 | None                                                               | Portal, focus, nested ownership, modal scrolling and presence                                                                                                                    | Independent modal/return-focus comparison suite                                               |
| Checkbox, Radio, Switch and remaining primitives     | None                                                               | Existing units/stories vary; no global certification                                                                                                                             | Inventory each source/API contract, then native forms and keyboard suites                     |

`pnpm test-browser:floating` runs the selected floating consumer Storybook checks in Chromium,
Firefox and WebKit. `pnpm test-parity` discovers every pinned suite. Both commands run in CI.
Shared infrastructure validates exception uniqueness, scenario ownership and exact browser scope.
Per-family drivers retain their own DOM/interaction contract; extraction follows concrete reuse.

Menu host integration is counted in Menu's suite; it does not expand the independent Popover/Dialog audits.

The [Menu API/deviation audit](../../packages/primitives/menu/AUDIT.md) is complete for the pin;
it identified five defect/contract groups and the missing filtering family. Indicator lifecycle and
semantics (A1) are covered by ten pinned scenarios. Contextual placement covers eighteen geometry
cases, collision boundaries fourteen, and method/sticky ten native-wheel cases. Forced Context Menu
policies are covered. Six viewport cases execute in Chromium, with twelve explicit zoom capability
skips in Firefox/WebKit. A2 positioning and A3 initial models are addressed; A4 native/pending Portal destinations and A5 GroupLabel identity are covered in ADRs 0072–0073, with native tree/document limits; filtering A6 remains open. The targeted exception run also exposed a
WebKit reference assertion failure that passed
five isolated repeats; Linux-only exceptions still require Linux CI.

Priority after this increment: the separate Menu filtering capability. Popover hover/RTL
coverage and Combobox/Autocomplete follow. Native controls can follow independently; React event/store mechanics are
not API requirements. Real-device/AT and saved-profile autofill remain explicit external gaps.
