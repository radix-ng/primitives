Use the installed radix-ng and radix-ng-examples consumer skills to implement this task in this application.
Read both .agents/skills/radix-ng/SKILL.md and .agents/skills/radix-ng-examples/SKILL.md. Look up the Tabs API/styling contracts and the closest installed example for content projection through a wrapper. Check installed Angular/library versions and types; installed exports/types win if the bundle differs.

Create our own reusable standalone AppTabs using public Radix NG imports and this application's CSS tokens in src/styles.css. No finished design system or visual reference is provided. Do not use Storybook helpers, workspace aliases, NgModules or a custom reimplementation of Tabs keyboard logic.

Public component contract, also consumed by an independent parent after your session:

- Export AppTabs from src/app/app-tabs.ts with selector app-tabs.
- Compose RdxTabsRoot on the AppTabs host through hostDirectives. Render RdxTabsList in the wrapper's own template, followed by its panels. Accept the consumer's projected [rdxTabsTab] buttons in the inner List and projected [rdxTabsPanel] elements after it. Preserve the documented Root/List DI ownership for those projected parts.
- Expose value: RdxTabsValue | undefined and onValueChange: RdxTabsValueChangeEvent, preserving the primitive event payload. The parent owns selected value and updates it from event.value. Expose a required label: string for the inner tablist's accessible name, and activateOnFocus: boolean defaulting to false. The demo uses manual activation, activateOnFocus=false.
- Consumers own the tab/panel values, labels, content and disabled bindings. Use the installed Tabs disabled contract: a disabled tab can receive focus through arrow navigation but cannot activate. Do not copy Select's rule of skipping disabled controls.
- Tab and panel roles, ids, names and relationships must remain correct for multiple wrapper instances, even when they use the same values. Preserve the primitive's actual state hooks and use application-owned styling, including selected, focus and disabled states.

Create a root demo with two independent AppTabs instances:

- Use data-testid="primary-tabs" and "secondary-tabs" on their AppTabs hosts. Their tablist labels are Primary sections and Secondary sections.
- Each has Account/account, Billing/billing and Security/security tabs with matching panels. Billing is disabled in both. Both start at account. Project all tab buttons and all three panels from the parent, with ordinary panel text and an action button in each panel. The List comes before the panels in DOM order.
- The first instance's panel texts are Primary account content, Primary billing content and Primary security content. The second uses Secondary account content, Secondary billing content and Secondary security content.
- Provide buttons Set primary Security externally, Set primary Account externally and Set secondary Security externally. They set the corresponding parent's selected value without calling a user-change handler.
- Expose real parent state in output elements: data-testid="primary-value", "secondary-value", "primary-event-count", "secondary-event-count", "primary-event-value", "secondary-event-value", "primary-event-reason" and "secondary-event-reason". Counts start at 0; last-event outputs are empty initially. Store actual onValueChange events, including event.value and event.eventDetails.reason; never synthesize debug outputs from the DOM.

Check that in manual mode arrows and Home/End only move focus, Enter/Space activate an enabled tab, and Tab leaves the list for its active panel. Disabled Billing must receive arrow focus, while activation through Enter, Space or pointer is refused. External value changes must update the selected tab/panel without extra callbacks. Interacting with one instance must not alter or steal focus from the other.

Run strict Angular template compilation, report checks actually performed, and fix your own issues within this one session. Do not claim browser checks passed without running them.

Environment note established for this pinned toolchain: pnpm build aborted with exit 134 inside the macOS sandbox even for a blank scaffold. The strict compiler pnpm exec ngc -p tsconfig.app.json --noEmit works here. Use it to check/fix templates and record any builder limitation. Independent production builds and browser checks will run outside the sandbox after your session, without evaluator repairs.

Only this clean consumer, installed dependencies and its two installed skills are task context. Do not read other repositories, global skills, ready consumer/check fixtures, source clones or outside files. Shell tools have no network access; dependencies are installed. Keep package.json, pnpm-lock.yaml, Angular/TypeScript configuration and installed skills unchanged. Do not commit. Finish with a concise report of implementation, checks/results and anything unverified.
