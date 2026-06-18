## 1.0.0-beta.5 (2026-06-18)

### 🚀 Features

- **slider:** align with Base UI event and thumb positioning ([fd3cac7c](https://github.com/radix-ng/primitives/commit/fd3cac7c))
- **primitives:** add cancelable value change events ([e02f16b0](https://github.com/radix-ng/primitives/commit/e02f16b0))
- **tooltip:** align nested trigger hover behavior ([e0b1298e](https://github.com/radix-ng/primitives/commit/e0b1298e))
- **primitives:** add floating focus portal bridge and shared trigger interaction ([e4ef0fd6](https://github.com/radix-ng/primitives/commit/e4ef0fd6))

### 🩹 Fixes

- align floating focus and open-change contracts ([063b5ff9](https://github.com/radix-ng/primitives/commit/063b5ff9))
- align select ids and trigger focus guards ([f9ba1a4e](https://github.com/radix-ng/primitives/commit/f9ba1a4e))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 1.0.0-beta.4 (2026-06-16)

### 🚀 Features

- **direction-provider:** add RTL direction context and docs ([4972395c](https://github.com/radix-ng/primitives/commit/4972395c))
- **combobox:** document cancellable open change flow ([03f4bd53](https://github.com/radix-ng/primitives/commit/03f4bd53))
- **select:** add cancelable change details and interaction state ([2752dae7](https://github.com/radix-ng/primitives/commit/2752dae7))
- **core:** add shared floating tree ([#420](https://github.com/radix-ng/primitives/pull/420))
- **core:** dev-mode diagnostics helpers + tag-aware misuse checks (ADR 0013) ([5c9a5c79](https://github.com/radix-ng/primitives/commit/5c9a5c79))
- ⚠️  **popper:** thin positioners — single-source inputs, unified CSS vars, z-index decoupling (ADR 0012) ([#419](https://github.com/radix-ng/primitives/pull/419))

### 🩹 Fixes

- **menu:** safe polygon between trigger and popup ([386a1a49](https://github.com/radix-ng/primitives/commit/386a1a49))
- **menu:** radioGroup API and GroupLabel disabled state ([c61d45e2](https://github.com/radix-ng/primitives/commit/c61d45e2))
- **menu:** disabled state for Root ([5fb4b826](https://github.com/radix-ng/primitives/commit/5fb4b826))
- **menu:** align modal behavior ([a02c3e0b](https://github.com/radix-ng/primitives/commit/a02c3e0b))
- ⚠️  **combobox:** align autocomplete and combobox behavior with Base UI ([715cbbb4](https://github.com/radix-ng/primitives/commit/715cbbb4))
- **combobox:** align async demos, chip nav, Clear & list ([2d607102](https://github.com/radix-ng/primitives/commit/2d607102))

### ⚠️  Breaking Changes

- **combobox:** align autocomplete and combobox behavior with Base UI  ([715cbbb4](https://github.com/radix-ng/primitives/commit/715cbbb4))
- **popper:** thin positioners — single-source inputs, unified CSS vars, z-index decoupling (ADR 0012)  ([#419](https://github.com/radix-ng/primitives/pull/419))
  combobox and autocomplete now default to `sideOffset: 4`, `align: 'start'`;
  select now defaults to `align: 'start'` and `updatePositionStrategy: 'always'` — the values
  already documented (bind these inputs explicitly to keep the old behaviour). Set the
  stacking `z-index` on the popper positioner element, not the popup: consumers who set `z-*`
  on the popup must move that class up one element to the positioner. The per-primitive
  `--radix-<name>-content-*` / `--radix-<name>-trigger-*` CSS variables are deprecated aliases
  of the unified `--anchor-*` / `--available-*` / `--transform-origin` set and will be removed
  next minor.

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 1.0.0-beta.3 (2026-06-13)

### 🚀 Features

- **presence:** subtree-aware WAAPI exit detection (ADR 0011) ([#418](https://github.com/radix-ng/primitives/pull/418))
- **select:** finish ADR 0010 §6 restructure — keyboard a11y + scroll fixes, object-values story ([b4030f5](https://github.com/radix-ng/primitives/commit/b4030f5))
- **select:** finish §6 restructure — popup owns RdxPopperContent (ADR 0010) ([9ac4d43](https://github.com/radix-ng/primitives/commit/9ac4d43))
- **portal:** structural *rdxXxxPortal merging portal + presence (ADR 0010) ([19dc851](https://github.com/radix-ng/primitives/commit/19dc851))
- **autocomplete:** add Autocomplete primitive (modes, grid, virtualized, async, forms) ([f243c92](https://github.com/radix-ng/primitives/commit/f243c92))

### 🩹 Fixes

- **drawer:** refine swipe interactions and animations ([8b8ff31](https://github.com/radix-ng/primitives/commit/8b8ff31))
- **drawer, dialog:** align scrollable and swipe animations ([2694a8c](https://github.com/radix-ng/primitives/commit/2694a8c))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 1.0.0-beta.2 (2026-06-11)

### 🚀 Features

- **core:** link missing-context errors to the primitive docs page ([bd6ed1b](https://github.com/radix-ng/primitives/commit/bd6ed1b))
- **ng-add:** write AI agent instructions to AGENTS.md/CLAUDE.md, add common-mistakes skill ref ([862bc13](https://github.com/radix-ng/primitives/commit/862bc13))
- added Form top layer ([2cee157](https://github.com/radix-ng/primitives/commit/2cee157))
- **combobox:** add external list virtualization (virtualized, items, filteredItems) ([cb9091f](https://github.com/radix-ng/primitives/commit/cb9091f))
- ⚠️  **select:** migrate to Base UI (highlight nav, renamed parts, modal) ([2515f19](https://github.com/radix-ng/primitives/commit/2515f19))
- added Combobox ([#414](https://github.com/radix-ng/primitives/pull/414))
- **input:** upd Signal Forms FormUiControl surface ([47e4d60](https://github.com/radix-ng/primitives/commit/47e4d60))

### 🩹 Fixes

- **form,combobox:** cancel deferred reset on destroy; warn on unlabeled virtualized items ([db346b2](https://github.com/radix-ng/primitives/commit/db346b2))
- form accessors and combobox docs virtualized ([9789cd2](https://github.com/radix-ng/primitives/commit/9789cd2))
- **calendar:** correct getWeekNumber off-by-one at week boundaries ([b1ce583](https://github.com/radix-ng/primitives/commit/b1ce583))
- **date-time:** repair time-field value binding, 12h/AM-PM editing, and locale-aware placeholder ([46d472e](https://github.com/radix-ng/primitives/commit/46d472e))

### ⚠️  Breaking Changes

- **select:** migrate to Base UI (highlight nav, renamed parts, modal)  ([2515f19](https://github.com/radix-ng/primitives/commit/2515f19))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 1.0.0-beta.1 (2026-06-10)

### 🚀 Features

- **cropper:** disabled, SSR safety, keyboard zoom, and signals cleanup ([9c413fc](https://github.com/radix-ng/primitives/commit/9c413fc))
- **menu:** keep submenu open across diagonal hover via safe polygon ([#413](https://github.com/radix-ng/primitives/pull/413))
- **scroll-area:** add headless Scroll Area primitive ([b6864ac](https://github.com/radix-ng/primitives/commit/b6864ac))
- **skills:** serve LLM docs (llms.txt) from Storybook on the main domain ([d633c9c](https://github.com/radix-ng/primitives/commit/d633c9c))
- **toast:** add headless Toast primitive ported from Base UI ([b42be9e](https://github.com/radix-ng/primitives/commit/b42be9e))

### 🩹 Fixes

- toast swipe-to-dismiss not working on mobile ([fde61f1](https://github.com/radix-ng/primitives/commit/fde61f1))
- **popover:** property does not exist on type ([e189d9e](https://github.com/radix-ng/primitives/commit/e189d9e))
- **tooltip:** prevent cursor-tracking flicker and premature close on moving anchors ([596a175](https://github.com/radix-ng/primitives/commit/596a175))
- **calendar:** correct date matchers, focus skipping and prev-button; signals-first refactor ([a4c6217](https://github.com/radix-ng/primitives/commit/a4c6217))
- **date-field:** correct segment a11y attributes and modernize stories ([55b618a](https://github.com/radix-ng/primitives/commit/55b618a))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 1.0.0-beta.0 (2026-06-07)

### 🚀 Features

- ⚠️  **number-field:** rewrite over Base UI architecture ([8c386b8](https://github.com/radix-ng/primitives/commit/8c386b8))
- ⚠️  **checkbox, switch:** add Signal Forms control interfaces and split indeterminate/value ([fcc4e13](https://github.com/radix-ng/primitives/commit/fcc4e13))
- **slider:** rewrite over Base UI architecture ([#411](https://github.com/radix-ng/primitives/pull/411))
- ⚠️  **switch:** rewrite over Base UI architecture ([#6](https://github.com/radix-ng/primitives/issues/6))
- ⚠️  **toggle, toggle-group, toolbar:** rewrite over Base UI architecture ([a011a68](https://github.com/radix-ng/primitives/commit/a011a68))
- ⚠️  **tabs:** rewrite over Base UI architecture ([18875d8](https://github.com/radix-ng/primitives/commit/18875d8))
- ⚠️  **collapsible:** rewrite over Base UI architecture ([bd741ef](https://github.com/radix-ng/primitives/commit/bd741ef))
- ⚠️  **navigation-menu:** rewrite over Base UI architecture ([419fdb7](https://github.com/radix-ng/primitives/commit/419fdb7))
- **drawer:** add Drawer primitive over declarative Dialog ([35446a4](https://github.com/radix-ng/primitives/commit/35446a4))
- **alert-dialog:** rewrite over Dialog with variant profile ([2db2e2d](https://github.com/radix-ng/primitives/commit/2db2e2d))
- **dialog:** add handle, multiple triggers, viewport, nested ([4f05865](https://github.com/radix-ng/primitives/commit/4f05865))
- **dialog:** rewrite off CDK to declarative Base UI compound on shared primitives ([aea5a7b](https://github.com/radix-ng/primitives/commit/aea5a7b))
- **accordion:** align with Base UI, add keepMounted, fix single-mode flicker ([319f1c5](https://github.com/radix-ng/primitives/commit/319f1c5))
- **accordion:** align with Base UI API, fix data-disabled bugs, refactor stories ([c2435c0](https://github.com/radix-ng/primitives/commit/c2435c0))
- **checkbox:** add checkbox group with select-all parent and aria-controls ([ddbe5c8](https://github.com/radix-ng/primitives/commit/ddbe5c8))
- ⚠️  **primitives:** rewrite Context Menu on the owned Menu/Floating UI ([26e73ec](https://github.com/radix-ng/primitives/commit/26e73ec))
- **primitives:** rewrite Menu and Menubar on the owned Floating UI stack ([fc128e7](https://github.com/radix-ng/primitives/commit/fc128e7))
- **primitives:** add Meter primitive ([2930d8a](https://github.com/radix-ng/primitives/commit/2930d8a))
- **progress:** align primitive with Base UI API ([73071a2](https://github.com/radix-ng/primitives/commit/73071a2))
- **primitives:** add fieldset primitive ([e365bbe](https://github.com/radix-ng/primitives/commit/e365bbe))
- **input:** add primitive with field integration and stories ([79b72a0](https://github.com/radix-ng/primitives/commit/79b72a0))
- **primitives:** improve install schematic and align radio with Base UI ([0fbcc70](https://github.com/radix-ng/primitives/commit/0fbcc70))
- **primitives:** improve Angular CLI installation schematic ([b85f51f](https://github.com/radix-ng/primitives/commit/b85f51f))
- add Field primitive ([7cbc0a7](https://github.com/radix-ng/primitives/commit/7cbc0a7))
- **separator:** remove decorative input and upd docs ([aaee58b](https://github.com/radix-ng/primitives/commit/aaee58b))
- **preview-card:** added new primitive and remove old hover-card ([819d5ac](https://github.com/radix-ng/primitives/commit/819d5ac))
- **popover:** updated Lifecycle API, grace-area and Base UI parity ([877d595](https://github.com/radix-ng/primitives/commit/877d595))
- **popover:** add controlled multiple-trigger API ([447e3ae](https://github.com/radix-ng/primitives/commit/447e3ae))
- **popover:** add hover opening and animated viewport ([b391ddb](https://github.com/radix-ng/primitives/commit/b391ddb))
- **tooltip:** per-trigger disabled and Base UI positioner defaults ([e610353](https://github.com/radix-ng/primitives/commit/e610353))
- **tooltip:** added per-trigger delay/closeDelay and data-uncentered ([2a5770e](https://github.com/radix-ng/primitives/commit/2a5770e))
- **checkbox:** review fixes, tests, form examples + Storybook full-source code panel ([4d416f0](https://github.com/radix-ng/primitives/commit/4d416f0))
- **button:** add headless button primitive and centralized demo styles ([ed74fa3](https://github.com/radix-ng/primitives/commit/ed74fa3))
- **arrow:** hide decorative svg from a11y tree, theme via currentColor ([325a26e](https://github.com/radix-ng/primitives/commit/325a26e))
- **portal:** reactive container move with flexible container input ([19cfa48](https://github.com/radix-ng/primitives/commit/19cfa48))

### 🩹 Fixes

- **storybook:** make disabled accordion item visually distinct ([c949ee3](https://github.com/radix-ng/primitives/commit/c949ee3))
- **dialog, popover, drawer:** play exit animations to fix close flicker ([42a6b9d](https://github.com/radix-ng/primitives/commit/42a6b9d))
- **time-field, date-field:** make roots signals-first and reactive ([688f09e](https://github.com/radix-ng/primitives/commit/688f09e))
- unit test for Menu ([c2b7baa](https://github.com/radix-ng/primitives/commit/c2b7baa))
- **calendar:** dayOfWeek was never exported from @internationalized/date's public API ([cbf9c8b](https://github.com/radix-ng/primitives/commit/cbf9c8b))
- typedoc type module ([cd861af](https://github.com/radix-ng/primitives/commit/cd861af))
- **roving-focus:** shift+tab throw bubbling focusout, data-orientation, remove outline ([e1c42ca](https://github.com/radix-ng/primitives/commit/e1c42ca))
- **avatar:** correctness/a11y fixes and migrate stories to shared styles ([cd96cd7](https://github.com/radix-ng/primitives/commit/cd96cd7))
- **visually-hidden:** a11y correctness and single-source input ([5360f43](https://github.com/radix-ng/primitives/commit/5360f43))
- **collapsible, accordion:** deterministic mount animation + accordion correctness fixes ([416a034](https://github.com/radix-ng/primitives/commit/416a034))
- **popper:** improve positioning updates and Storybook examples ([802b8cd](https://github.com/radix-ng/primitives/commit/802b8cd))
- **label:** skip text-selection prevention for nested control elements ([fae76e8](https://github.com/radix-ng/primitives/commit/fae76e8))
- **roving-focus:** correct tab-stop restoration, dynamic focusable and DOM-order navigation ([de7c6a1](https://github.com/radix-ng/primitives/commit/de7c6a1))

### ⚠️  Breaking Changes

- **number-field:** rewrite over Base UI architecture  ([8c386b8](https://github.com/radix-ng/primitives/commit/8c386b8))
  renamed inputs (formatOptions→format, stepSnapping→
  snapOnStep, disableWheelChange→allowWheelScrub, readOnly→readonly) and
  directive classes (dropped the `Directive` suffix); Input/buttons must now
  be wrapped in `[rdxNumberFieldGroup]`.
- **checkbox, switch:** add Signal Forms control interfaces and split indeterminate/value  ([fcc4e13](https://github.com/radix-ng/primitives/commit/fcc4e13))
- **switch:** rewrite over Base UI architecture  ([#6](https://github.com/radix-ng/primitives/issues/6))
- **toggle, toggle-group, toolbar:** rewrite over Base UI architecture  ([a011a68](https://github.com/radix-ng/primitives/commit/a011a68))
  toolbar parts renamed to Root/Button/Link/Input/Group/Separator
  (no "Directive" suffix); toggle wrappers removed; RDX_TOOLBAR_ROOT_TOKEN replaced
  with createContext. Adds @radix-ng/primitives/number-field to tsconfig paths.
- **tabs:** rewrite over Base UI architecture  ([18875d8](https://github.com/radix-ng/primitives/commit/18875d8))
- **collapsible:** rewrite over Base UI architecture  ([bd741ef](https://github.com/radix-ng/primitives/commit/bd741ef))
  rdxCollapsibleContent is now rdxCollapsiblePanel,
    RdxCollapsibleContentDirective -> RdxCollapsiblePanelDirective,
    RdxCollapsibleContentPresenceDirective -> RdxCollapsiblePanelPresenceDirective,
    data-state is removed in favor of data-open/data-closed, and the
    --radix-collapsible-content-* CSS variables are now --collapsible-panel-*.
- **navigation-menu:** rewrite over Base UI architecture  ([419fdb7](https://github.com/radix-ng/primitives/commit/419fdb7))
- **primitives:** rewrite Context Menu on the owned Menu/Floating UI  ([26e73ec](https://github.com/radix-ng/primitives/commit/26e73ec))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.51.0 (2026-05-27)

### 🚀 Features

- upgrade Angular to 21 and NX to 22 ([#402](https://github.com/radix-ng/primitives/pull/402))
- **select2:** added Select v2 impl with Popper ([#372](https://github.com/radix-ng/primitives/pull/372))
- added Collection ([#368](https://github.com/radix-ng/primitives/pull/368))
- **checkbox:** added data-state to root and exports for isIndeterminate ([6b8ad51](https://github.com/radix-ng/primitives/commit/6b8ad51))

### 🩹 Fixes

- **tooltip2:** correct container type as ElementRef ([68b086f](https://github.com/radix-ng/primitives/commit/68b086f))

### ❤️ Thank You

- Claude Sonnet 4.6
- Oleg Pimenov @pimenovoleg

## 0.50.0 (2025-10-13)

### 🚀 Features

- **checkbox:** checked as model ([ef0e4e1](https://github.com/radix-ng/primitives/commit/ef0e4e1))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.44.0 (2025-10-12)

### 🚀 Features

- added Tooltip v2 based on floating-ui and Dismissable layer ([#367](https://github.com/radix-ng/primitives/pull/367))
- added Popper primitive ([#366](https://github.com/radix-ng/primitives/pull/366))
- **checkbox:** added readonly property ([33f8a82](https://github.com/radix-ng/primitives/commit/33f8a82))
- experimentalZoneless is on ([9b47489](https://github.com/radix-ng/primitives/commit/9b47489))
- **radix-storybook:** migrated to vite and supported TailwindCSS 4 ([#364](https://github.com/radix-ng/primitives/pull/364))
- **roving-focus:** updated to Signals ([#362](https://github.com/radix-ng/primitives/pull/362))
- **checkbox:** migrated to Signals ([#361](https://github.com/radix-ng/primitives/pull/361))
- updated Angular to 20.2, Storybook to 9.1 ([#360](https://github.com/radix-ng/primitives/pull/360))
- **calendar:** add getWeekNumber utility function ([#358](https://github.com/radix-ng/primitives/pull/358))
- **number-field:** support readonly ([#357](https://github.com/radix-ng/primitives/pull/357))

### 🩹 Fixes

- **label:** htmlFor attribute ([937c7fa](https://github.com/radix-ng/primitives/commit/937c7fa))
- **visually-hidden:** prevent causing unnecessary container scroll ([d430553](https://github.com/radix-ng/primitives/commit/d430553))
- **core:** compatibility for AM/PM switching ([4eaabeb](https://github.com/radix-ng/primitives/commit/4eaabeb))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.43.0 (2025-07-16)

### 🚀 Features

- **navigation-menu:** add `openOnHover` input trigger to customize toggling the viewport ([#356](https://github.com/radix-ng/primitives/pull/356))
- **visually-hidden:** refactor to signals and updated API ([#355](https://github.com/radix-ng/primitives/pull/355))
- new utilites – Focus Guards ([b58ce01](https://github.com/radix-ng/primitives/commit/b58ce01))

### ❤️ Thank You

- Josh Sullivan @jpsullivan
- Oleg Pimenov @pimenovoleg

## 0.42.0 (2025-07-06)

### 🚀 Features

- new utilites – FocusScope ([#354](https://github.com/radix-ng/primitives/pull/354))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.41.0 (2025-07-04)

### 🚀 Features

- **editable:** added new primitive Editable ([#353](https://github.com/radix-ng/primitives/pull/353))
- **dismissible-layer:** added FocusOutside and PointerDownOutside utils ([#352](https://github.com/radix-ng/primitives/pull/352))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.40.0 (2025-06-27)

### 🚀 Features

- **time-field:** added interval steps ([#351](https://github.com/radix-ng/primitives/pull/351))

### 🩹 Fixes

- update peerDependencies to support Angular 19 and 20 ([#350](https://github.com/radix-ng/primitives/pull/350))
- **number-field:** set value to undefined instead of NaN when clearing ([ca96de6](https://github.com/radix-ng/primitives/commit/ca96de6))
- **createFormatter:** respect hourCycle over locale for dayPeriod ([#349](https://github.com/radix-ng/primitives/pull/349))
- **date-field:** increment minutes/seconds on ARROW_UP/ARROW_DOWN ([581cc98](https://github.com/radix-ng/primitives/commit/581cc98))

### ❤️ Thank You

- Josh Sullivan @jpsullivan
- Oleg Pimenov @pimenovoleg

## 0.39.5 (2025-06-21)

### 🩹 Fixes

- **calendar:** multiple mode, watch value #346 ([#347](https://github.com/radix-ng/primitives/pull/347), [#346](https://github.com/radix-ng/primitives/issues/346))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.39.4 (2025-06-15)

### 🩹 Fixes

- **switch:** added unit test for Reactive Form ([5feffaa](https://github.com/radix-ng/primitives/commit/5feffaa))
- **toggle:** validation in ReactiveForms ([2b59e0d](https://github.com/radix-ng/primitives/commit/2b59e0d))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.39.3 (2025-06-08)

### 🩹 Fixes

- **toggle-group:** the model value was not undefined ([#343](https://github.com/radix-ng/primitives/pull/343))
- **toggle:** ensure open does not trigger when disabled ([222f23d](https://github.com/radix-ng/primitives/commit/222f23d))
- **slider:** keys direction PageUp ([5b93636](https://github.com/radix-ng/primitives/commit/5b93636))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.39.2 (2025-05-22)

### 🩹 Fixes

- **navigation-menu:** prevent accidental menu closing when clicking immediately after hover ([#337](https://github.com/radix-ng/primitives/pull/337))
- **navigation-menu:** clear viewport size when no active content node is present ([#336](https://github.com/radix-ng/primitives/pull/336))

### ❤️ Thank You

- Josh Sullivan @jpsullivan

## 0.39.1 (2025-05-18)

### 🩹 Fixes

- **accordion:** remove unnecessary changeModel ([64d8b28](https://github.com/radix-ng/primitives/commit/64d8b28))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.39.0 (2025-05-18)

### 🚀 Features

- **accordion:** block any animations/transitions when the element renders ([#334](https://github.com/radix-ng/primitives/pull/334))

### 🩹 Fixes

- **accordion:** collapsible property ([6ea14d9](https://github.com/radix-ng/primitives/commit/6ea14d9))
- **accordion:** animation with SSR ([2eb84ef](https://github.com/radix-ng/primitives/commit/2eb84ef))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.38.0 (2025-05-16)

### 🚀 Features

- **accordion:** updated core code, added collapsible ([#332](https://github.com/radix-ng/primitives/pull/332))
- updated Collapse primitive ([#331](https://github.com/radix-ng/primitives/pull/331))
- **select:** enhance overlay width handling and improve item display ([#330](https://github.com/radix-ng/primitives/pull/330))
- **core:** added createContext and cva directive ([#327](https://github.com/radix-ng/primitives/pull/327))
- **time-field:** added primitive Time Field ([#326](https://github.com/radix-ng/primitives/pull/326))
- **select:** observe trigger size to update overlay dimensions ([#325](https://github.com/radix-ng/primitives/pull/325))
- remove old projects ([#324](https://github.com/radix-ng/primitives/pull/324))

### ❤️ Thank You

- Josh Sullivan @jpsullivan
- Oleg Pimenov @pimenovoleg

## 0.37.0 (2025-05-06)

### 🚀 Features

- **cropper:** new primitive Croppper ([#323](https://github.com/radix-ng/primitives/pull/323))
- **avatar:** rewrite effects and fallback ([0b83729](https://github.com/radix-ng/primitives/commit/0b83729))

### 🩹 Fixes

- **checkbox:** rename to RootDirective, remove standalone flag ([722471c](https://github.com/radix-ng/primitives/commit/722471c))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.36.0 (2025-05-04)

### 🚀 Features

- **number-field:** new primitive Number Field ([#317](https://github.com/radix-ng/primitives/pull/317))

### 🩹 Fixes

- storybook markdown tables and exports for Number and Date fields ([e6bc99c](https://github.com/radix-ng/primitives/commit/e6bc99c))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.35.0 (2025-05-03)

### 🚀 Features

- **date-field:** new Primitive Date Field ([#312](https://github.com/radix-ng/primitives/pull/312))
- internal updated - provideValueAccessor and provideToken ([#310](https://github.com/radix-ng/primitives/pull/310))

### 🩹 Fixes

- **navigation-menu:** remove unnecessary triggerEnter handler ([#314](https://github.com/radix-ng/primitives/pull/314))
- **dialog:** ensure `data-state` and `data-side`  are set on CDK backdrop ([#311](https://github.com/radix-ng/primitives/pull/311))

### ❤️ Thank You

- Josh Sullivan @jpsullivan
- Oleg Pimenov @pimenovoleg

## 0.34.0 (2025-04-27)

### 🚀 Features

- **calendar:** new Calendar primitive ([#295](https://github.com/radix-ng/primitives/pull/295))

### ❤️ Thank You

- Oleg Pimenov @pimenovoleg

## 0.33.1 (2025-04-23)

### 🩹 Fixes

- **navigation-menu:** motion state ([#307](https://github.com/radix-ng/primitives/pull/307))
- **hover-card:** remove console log from action handling ([#306](https://github.com/radix-ng/primitives/pull/306))
- **navigation-menu:** simplify viewport content existence validation ([#302](https://github.com/radix-ng/primitives/pull/302))

### ❤️ Thank You

- Josh Sullivan @jpsullivan

## 0.33.0 (2025-04-12)

### 🚀 Features

- **popover:** add the ability to define the element that receives focus first ([#296](https://github.com/radix-ng/primitives/pull/296))
- **navigation-menu:** add navigation menu primitive ([#292](https://github.com/radix-ng/primitives/pull/292))
- **popover:** focus management inside popover ([#285](https://github.com/radix-ng/primitives/pull/285))
- **visually-hidden:** added updated feature effect ([0b2a6b4](https://github.com/radix-ng/primitives/commit/0b2a6b4))

### ❤️ Thank You

- Josh Sullivan
- Oleg Pimenov
- Victor Zubrinkin

## 0.32.4 (2025-03-04)

### 🩹 Fixes

- **radio:** unset data-disabled attr for indicator ([99036a5](https://github.com/radix-ng/primitives/commit/99036a5))

### ❤️ Thank You

- Oleg Pimenov

## 0.32.3 (2025-03-04)

### 🩹 Fixes

- **radio:** unset data-disabled attr for indicator ([af7099e](https://github.com/radix-ng/primitives/commit/af7099e))
- **stepper:** added valuechange event ([dca2dc2](https://github.com/radix-ng/primitives/commit/dca2dc2))

### ❤️ Thank You

- Oleg Pimenov

## 0.32.2 (2025-02-16)

### 🩹 Fixes

- schematic build ([4bc55de](https://github.com/radix-ng/primitives/commit/4bc55de))

### ❤️ Thank You

- Oleg Pimenov

## 0.32.1 (2025-02-16)

### 🩹 Fixes

- **stepper:** package ([d67b685](https://github.com/radix-ng/primitives/commit/d67b685))

### ❤️ Thank You

- Oleg Pimenov

## 0.32.0 (2025-02-16)

### 🚀 Features

- **stepper:** added new primitive - Stepper ([#276](https://github.com/radix-ng/primitives/pull/276))

### ❤️ Thank You

- Oleg Pimenov

## 0.31.0 (2025-02-09)

### 🚀 Features

- **pagination:** added pagination primitive ([#273](https://github.com/radix-ng/primitives/pull/273))
- **config:** added provider for global config ([9b1d5b3](https://github.com/radix-ng/primitives/commit/9b1d5b3))

### ❤️ Thank You

- Oleg Pimenov

## 0.30.0 (2025-02-02)

### 🚀 Features

- **radix-docs:** added Checkbox ([6f32531](https://github.com/radix-ng/primitives/commit/6f32531))
- upd angular to 19.1 ([#266](https://github.com/radix-ng/primitives/pull/266))
- menu ([#258](https://github.com/radix-ng/primitives/pull/258))
- **progress:** updated to signals ([#265](https://github.com/radix-ng/primitives/pull/265))
- **alert:** added alert role to dialog config ([eb8d725](https://github.com/radix-ng/primitives/commit/eb8d725))

### ❤️ Thank You

- Oleg Pimenov

## 0.29.0 (2025-01-12)

### 🚀 Features

- **schematics:** added ng-add ([57e1ad9](https://github.com/radix-ng/primitives/commit/57e1ad9))
- **toolbar:** added Toolbar primitive ([0a1398b](https://github.com/radix-ng/primitives/commit/0a1398b))
- **slider:** added styleClass, updated docs and move emits to signals ([439b594](https://github.com/radix-ng/primitives/commit/439b594))
- **radix-docs:** added Toggle Group ([58e5ef3](https://github.com/radix-ng/primitives/commit/58e5ef3))

### ❤️ Thank You

- Oleg Pimenov

## 0.28.0 (2025-01-08)

### 🚀 Features

- **toggle-group:** rewrite to signals and host as Toggle ([3fd4edb](https://github.com/radix-ng/primitives/commit/3fd4edb))
- **toggle-group:** updated multiple selection ([f396126](https://github.com/radix-ng/primitives/commit/f396126))

### 🩹 Fixes

- **dialog:** set dialogClose for any elements ([c341a9b](https://github.com/radix-ng/primitives/commit/c341a9b))

### ❤️ Thank You

- Oleg Pimenov

## 0.27.0 (2024-12-31)

### 🚀 Features

- **hover-card:** create hover-card primitive ([#242](https://github.com/radix-ng/primitives/pull/242))

### ❤️ Thank You

- pawel-twardziak

## 0.26.0 (2024-12-30)

### 🚀 Features

- **popover:** use input transformers & embrace default standalone ([#230](https://github.com/radix-ng/primitives/pull/230))

### 🩹 Fixes

- **tooltip:** show tooltip on hover ([#234](https://github.com/radix-ng/primitives/pull/234))
- **popover:** position arrow correctly ([#232](https://github.com/radix-ng/primitives/pull/232))
- **tooltip:** added input transforms and remove standalone param ([#228](https://github.com/radix-ng/primitives/pull/228))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.25.0 (2024-12-26)

### 🚀 Features

- updated to Angular 19 ([#226](https://github.com/radix-ng/primitives/pull/226))

### 🩹 Fixes

- **tooltip:** use core positioning utils ([#227](https://github.com/radix-ng/primitives/pull/227))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.24.0 (2024-12-25)

### 🚀 Features

- **popover:** add cdk events service ([#217](https://github.com/radix-ng/primitives/pull/217))

### 🩹 Fixes

- **popover:** close popover on anchor click ([#225](https://github.com/radix-ng/primitives/pull/225))

### ❤️ Thank You

- pawel-twardziak

## 0.23.0 (2024-12-23)

### 🚀 Features

- added typedoc generator ([#218](https://github.com/radix-ng/primitives/pull/218))

### 🩹 Fixes

- **popover:** repair offsets calculation ([#219](https://github.com/radix-ng/primitives/pull/219))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.22.0 (2024-12-21)

### 🚀 Features

- **tabs:** added activation-mode ([2415dab](https://github.com/radix-ng/primitives/commit/2415dab))

### 🩹 Fixes

- **tabs:** roving-focus item active state ([983b984](https://github.com/radix-ng/primitives/commit/983b984))

### ❤️ Thank You

- Oleg Pimenov

## 0.21.0 (2024-12-20)

### 🚀 Features

- **popover:** add anchor directive ([#209](https://github.com/radix-ng/primitives/pull/209))
- **switch:** added inputId and aria labels for screenreader ([#211](https://github.com/radix-ng/primitives/pull/211))
- **switch:** added defaultChecked boolean attr ([ba493d1](https://github.com/radix-ng/primitives/commit/ba493d1))
- **switch:** added Switch components for Radix Theme ([9e8cef4](https://github.com/radix-ng/primitives/commit/9e8cef4))
- **switch:** added cva, updated storybook ([#210](https://github.com/radix-ng/primitives/pull/210))
- **toggle:** rename visually hidden directive for input, upd storybook ([#208](https://github.com/radix-ng/primitives/pull/208))
- **popover:** add animation on open and close ([#200](https://github.com/radix-ng/primitives/pull/200))

### 🩹 Fixes

- **avatar:** fallback display ([7685774](https://github.com/radix-ng/primitives/commit/7685774))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.20.2 (2024-12-13)

### 🩹 Fixes

- **popover:** set align-offset default value to 0 ([#195](https://github.com/radix-ng/primitives/pull/195))
- **popover:** set default Radix values ([#189](https://github.com/radix-ng/primitives/pull/189))
- **popover:** close on outside click by default ([#192](https://github.com/radix-ng/primitives/pull/192))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.20.1 (2024-12-12)

### 🩹 Fixes

- **radio:** indicator data-state ([50ccf4d](https://github.com/radix-ng/primitives/commit/50ccf4d))

### ❤️ Thank You

- Oleg Pimenov

## 0.20.0 (2024-12-12)

### 🚀 Features

- **popover:** create popover directives ([#179](https://github.com/radix-ng/primitives/pull/179))

### 🩹 Fixes

- **popover:** remove unnecesary effect-refs asignments + more ([#187](https://github.com/radix-ng/primitives/pull/187))
- **radio:** updated disabled state ([#186](https://github.com/radix-ng/primitives/pull/186))

### ❤️ Thank You

- Oleg Pimenov
- pawel-twardziak

## 0.19.0 (2024-12-10)

### 🚀 Features

- **avatar:** move to zoneless, upd visibility logic ([c1c15c3](https://github.com/radix-ng/primitives/commit/c1c15c3))
- **radio:** added roving focus ([afdde5d](https://github.com/radix-ng/primitives/commit/afdde5d))
- **roving-focus:** added Roving Focus Direcrivces ([6f22c69](https://github.com/radix-ng/primitives/commit/6f22c69))
- **checkbox:** added prefix rdx to checkbox directives ([1347e8c](https://github.com/radix-ng/primitives/commit/1347e8c))

### 🩹 Fixes

- **radio:** updated input element, added item-input directive ([fe4d69e](https://github.com/radix-ng/primitives/commit/fe4d69e))
- **toggle:** added value for input element ([0be7115](https://github.com/radix-ng/primitives/commit/0be7115))

### ❤️ Thank You

- Oleg Pimenov

## 0.18.2 (2024-12-04)

### 🩹 Fixes

- **slider:** remove root from context service ([d4dac98](https://github.com/radix-ng/primitives/commit/d4dac98))

### ❤️ Thank You

- Oleg Pimenov

## 0.18.1 (2024-12-03)

### 🩹 Fixes

- **slider:** fixed SSR and added ssr test ([6486d80](https://github.com/radix-ng/primitives/commit/6486d80))

### ❤️ Thank You

- Oleg Pimenov

## 0.18.0 (2024-12-03)

### 🚀 Features

- **primitives:** added Slider ([#174](https://github.com/radix-ng/primitives/pull/174))
- **primitives:** added Tooltip ([#91](https://github.com/radix-ng/primitives/pull/91))

### 🩹 Fixes

- **select:** referenceError and track expression ([4e155bf](https://github.com/radix-ng/primitives/commit/4e155bf))

### ❤️ Thank You

- lskramarov
- Oleg Pimenov
- Vitaliy Agoshkov

## 0.17.0 (2024-11-30)

### 🚀 Features

- **primitives:** added Select ([#146](https://github.com/radix-ng/primitives/pull/146))
- **checkbox:** replace cdk visual hidden to hostDirective ([77e4c34](https://github.com/radix-ng/primitives/commit/77e4c34))

### ❤️ Thank You

- lskramarov
- Oleg Pimenov

## 0.16.0 (2024-11-08)


### 🚀 Features

- **radix-docs:** added aspect ration docs ([d98ec13](https://github.com/radix-ng/primitives/commit/d98ec13))

- **radix-docs:** added separator docs ([2a32a3a](https://github.com/radix-ng/primitives/commit/2a32a3a))

- **toggle:** added toggle-input ([6e8a238](https://github.com/radix-ng/primitives/commit/6e8a238))

- **avatar:** added role img ([f8a1228](https://github.com/radix-ng/primitives/commit/f8a1228))


### 🩹 Fixes

- **dialog:** added string[] type for backdropClass ([#153](https://github.com/radix-ng/primitives/pull/153))


### ❤️  Thank You

- Oleg Pimenov

## 0.15.0 (2024-10-22)


### 🚀 Features

- **primitives:** added visual hidden for input ([a28557f](https://github.com/radix-ng/primitives/commit/a28557f))

- **alert-dialog:** added module exports ([a8e2dd9](https://github.com/radix-ng/primitives/commit/a8e2dd9))

- **aspect-ratio:** added AspectRatio primitive ([33d964a](https://github.com/radix-ng/primitives/commit/33d964a))

- **separator:** updated to signals ([3fc6309](https://github.com/radix-ng/primitives/commit/3fc6309))


### ❤️  Thank You

- Oleg Pimenov

## 0.14.0 (2024-10-10)


### 🚀 Features

- **toggle:** migrate o signals, added disable example in storybbok ([3309e6d](https://github.com/radix-ng/primitives/commit/3309e6d))

- **toggle-group:** rename to multiple ([1b955c1](https://github.com/radix-ng/primitives/commit/1b955c1))

- **toggle-group:** added Multiple example ([c8a41e5](https://github.com/radix-ng/primitives/commit/c8a41e5))

- **toggle-group:** added focus-manager ([b30ed2e](https://github.com/radix-ng/primitives/commit/b30ed2e))

- **switch:** use model for checked ([a0e0f58](https://github.com/radix-ng/primitives/commit/a0e0f58))


### 🩹 Fixes

- **toggle:** rename button to rdxToggleGroupItem ([761580c](https://github.com/radix-ng/primitives/commit/761580c))

- **dropdown-menu:** onPointerMove if not highlighted ([97dd5cd](https://github.com/radix-ng/primitives/commit/97dd5cd))

- **accordion:** fixed navigation with TAB key ([#127](https://github.com/radix-ng/primitives/pull/127))


### ❤️  Thank You

- lskramarov
- Oleg Pimenov

## 0.13.0 (2024-09-25)


### 🚀 Features

- added module exports ([9eee903](https://github.com/radix-ng/primitives/commit/9eee903))

- **progress:** added NgModule export ([d2c5875](https://github.com/radix-ng/primitives/commit/d2c5875))

- **radix-docs:** added example of Sheet component ([1feae56](https://github.com/radix-ng/primitives/commit/1feae56))


### ❤️  Thank You

- Oleg Pimenov

## 0.12.2 (2024-09-19)


### 🩹 Fixes

- publish script ([38e43ab](https://github.com/radix-ng/primitives/commit/38e43ab))

## 0.12.1 (2024-09-19)


### 🩹 Fixes

- publish script ([1ecaf0c](https://github.com/radix-ng/primitives/commit/1ecaf0c))

## 0.12.0 (2024-09-19)


### 🚀 Features

- **dialog:** added Dialog primitive ([#101](https://github.com/radix-ng/primitives/pull/101))

- **radio:** added prefix rdx ([e5ebbc6](https://github.com/radix-ng/primitives/commit/e5ebbc6))

- **ci:** added eslint support ([#103](https://github.com/radix-ng/primitives/pull/103))

- **context-menu:** added context menu ([#2865](https://github.com/radix-ng/primitives/pull/2865), [#104](https://github.com/radix-ng/primitives/pull/104))


### 🩹 Fixes

- **avatar:** supported SSR ([c50ce18](https://github.com/radix-ng/primitives/commit/c50ce18))

- **dropdown-menu:** navigation ([#106](https://github.com/radix-ng/primitives/pull/106))

## 0.11.1 (2024-09-10)


### 🩹 Fixes

- shadcn/ui accordion example ([ee300bb](https://github.com/radix-ng/primitives/commit/ee300bb))

- animation in accordion-content.directive ([#94](https://github.com/radix-ng/primitives/pull/94))

## 0.11.0 (2024-09-06)


### 🚀 Features

- radix documentation - Astro and MDX ([#69](https://github.com/radix-ng/primitives/pull/69))

- accordion (#DS-2773) ([#92](https://github.com/radix-ng/primitives/pull/92))

- **collapsible:** rename onOpenChange and added content attributes ([24baf80](https://github.com/radix-ng/primitives/commit/24baf80))


### 🩹 Fixes

- **radio-group:** added focusKeyManager ([#95](https://github.com/radix-ng/primitives/pull/95))

## 0.10.0 (2024-08-21)


### 🚀 Features

- **primitives:** added rdx suffix for separator directive ([be5f9a5](https://github.com/radix-ng/primitives/commit/be5f9a5))


### 🩹 Fixes

- extend in trigger and menu + onEscapeKeyDown ([#86](https://github.com/radix-ng/primitives/pull/86))

## 0.9.1 (2024-08-15)


### 🩹 Fixes

- use extend for CdkMenuItem ([#85](https://github.com/radix-ng/primitives/pull/85))

## 0.9.0 (2024-08-13)


### 🚀 Features

- added stylelint support ([#64](https://github.com/radix-ng/primitives/pull/64))

- added prettier support for ts files ([#80](https://github.com/radix-ng/primitives/pull/80))

- added prettier support for mdx files ([#81](https://github.com/radix-ng/primitives/pull/81))

- **primitives:** dropdown menu, added parameters – side, align and offsets ([#65](https://github.com/radix-ng/primitives/pull/65))

- **primitives:** avatar - added prefix ([908bce1](https://github.com/radix-ng/primitives/commit/908bce1))

- **primitives:** updated prefix and documentation ([a2e5d34](https://github.com/radix-ng/primitives/commit/a2e5d34))

- **primitives:** dropdown menu ([#79](https://github.com/radix-ng/primitives/pull/79))

## 0.8.2 (2024-07-20)


### 🚀 Features

- **primitives:** upd Checkbox added input primitive and upd docs for imdeterminate ([e7d1279](https://github.com/radix-ng/primitives/commit/e7d1279))

- **shadcn:** updated checkbox indeterminate state ([497659d](https://github.com/radix-ng/primitives/commit/497659d))

## 0.8.1 (2024-07-10)

This was a version bump only for primitives to align it with other projects, there were no code changes.

## 0.7.2 (2024-07-06)


### 🚀 Features

- added Menubar base primitive ([0db991f](https://github.com/radix-ng/primitives/commit/0db991f))

- added Menu base primitive ([c7e395e](https://github.com/radix-ng/primitives/commit/c7e395e))

- **menubar:** added MenuBar ([#44](https://github.com/radix-ng/primitives/pull/44))

## 0.7.1 (2024-06-30)

This was a version bump only for primitives to align it with other projects, there were no code changes.

## 0.7.0 (2024-06-29)


### 🚀 Features

- **tabs:** added Tabs ([#38](https://github.com/radix-ng/primitives/pull/38))

## 0.6.0 (2024-06-20)


### 🚀 Features

- based for Textarea ([fcd14e1](https://github.com/radix-ng/primitives/commit/fcd14e1))

- added beta presence ([55b4a75](https://github.com/radix-ng/primitives/commit/55b4a75))

- **alert-dialog:** poc code ([f314588](https://github.com/radix-ng/primitives/commit/f314588))

## 0.5.0 (2024-04-26)


### 🚀 Features

- added Accordion primitive ([2e95121](https://github.com/radix-ng/primitives/commit/2e95121))

- **toggle-group:** added Toggle Group primitive ([88a38d3](https://github.com/radix-ng/primitives/commit/88a38d3))


### 🩹 Fixes

- **label:** added setter for UniqueId ([774c82f](https://github.com/radix-ng/primitives/commit/774c82f))

## 0.4.0 (2024-04-22)


### 🚀 Features

- **toggle:** added Toggle primitive ([f9a98dc](https://github.com/radix-ng/primitives/commit/f9a98dc))

## 0.3.0 (2024-04-20)


### 🚀 Features

- added overlay and tooltip ([e993fb3](https://github.com/radix-ng/primitives/commit/e993fb3))

- **avatar:** added primitive ([f76e8e9](https://github.com/radix-ng/primitives/commit/f76e8e9))

## 0.2.0 (2024-04-16)

### 🚀 Features

-   **radio:** added Radio Group ([f0b0eed](https://github.com/radix-ng/primitives/commit/f0b0eed))

### 🩹 Fixes

-   **checkbox:** updated story and styles ([7999532](https://github.com/radix-ng/primitives/commit/7999532))

-   **styles:** radix variables ([532a6d1](https://github.com/radix-ng/primitives/commit/532a6d1))

## 0.1.1 (2024-04-14)

### 🩹 Fixes

-   nx release publish target ([a27032f](https://github.com/radix-ng/primitives/commit/a27032f))

## 0.1.0 (2024-04-14)

### 🚀 Features

-   **progress:** added progress meter ([17f3ffb](https://github.com/radix-ng/primitives/commit/17f3ffb))
