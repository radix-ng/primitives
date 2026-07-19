# Scroll Area — Combining with Tabs

> One example from the [Scroll Area](../components/scroll-area.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.1` — if the installed version differs, verify the API against the installed package.

Stack `rdxTabsList` and `rdxScrollAreaViewport` on the same element so the tab list _is_ the scrollable
viewport (the Angular equivalent of Base UI's `render` prop). Keeping the scroll state on that element
lets a horizontal `mask-image` fade the tabs at whichever edge still has more to reveal.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxScrollAreaRoot, RdxScrollAreaViewport } from '@radix-ng/primitives/scroll-area';
import { RdxTabsIndicator, RdxTabsList, RdxTabsPanel, RdxTabsRoot, RdxTabsTab } from '@radix-ng/primitives/tabs';

const html = String.raw;

/**
 * Combining Scroll Area with Tabs. The Angular equivalent of Base UI's `render` prop is stacking
 * both directives on a single element: `rdxTabsList` + `rdxScrollAreaViewport` make the tab list
 * itself the scrollable viewport. Because the scroll state (and the `--scroll-area-overflow-x-*`
 * variables) live on that same element, a horizontal `mask-image` gradient fades the tabs at
 * whichever edge still has more tabs to reveal.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'scroll-area-tabs-example',
    imports: [
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxTabsRoot,
        RdxTabsList,
        RdxTabsTab,
        RdxTabsPanel,
        RdxTabsIndicator
    ],
    template: html`
        <div
            class="border-border bg-background text-foreground w-80 overflow-hidden rounded-md border"
            rdxTabsRoot
            defaultValue="overview"
        >
            <div class="border-border border-b" rdxScrollAreaRoot>
                <div
                    class="relative flex w-full [mask-image:linear-gradient(to_right,transparent,#000_var(--scroll-area-overflow-x-start,0px),#000_calc(100%-var(--scroll-area-overflow-x-end,0px)),transparent)]"
                    rdxTabsList
                    rdxScrollAreaViewport
                >
                    @for (tab of tabs; track tab.value) {
                    <button
                        class="text-muted-foreground hover:text-foreground focus-visible:ring-ring data-[active]:text-foreground shrink-0 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors outline-none focus-visible:ring-2"
                        rdxTabsTab
                        [value]="tab.value"
                    >
                        {{ tab.label }}
                    </button>
                    }

                    <!-- Lives inside the scrolling list, so it tracks the active tab even while scrolled. -->
                    <span
                        class="bg-primary pointer-events-none absolute bottom-0 left-[var(--active-tab-left)] h-0.5 w-[var(--active-tab-width)] transition-all duration-300 ease-out"
                        rdxTabsIndicator
                    ></span>
                </div>
            </div>

            @for (tab of tabs; track tab.value) {
            <div class="p-4 text-sm leading-6 outline-none" rdxTabsPanel [value]="tab.value">{{ tab.content }}</div>
            }
        </div>
    `
})
export class ScrollAreaTabsExample {
    readonly tabs = [
        { value: 'overview', label: 'Overview', content: 'A high-level summary of your workspace.' },
        { value: 'activity', label: 'Activity', content: 'Everything that happened recently.' },
        { value: 'settings', label: 'Settings', content: 'Preferences for this workspace.' },
        { value: 'members', label: 'Members', content: 'People with access to the workspace.' },
        { value: 'integrations', label: 'Integrations', content: 'Connect third-party services.' },
        { value: 'billing', label: 'Billing', content: 'Plan, invoices, and payment methods.' },
        { value: 'security', label: 'Security', content: 'Authentication and audit logs.' },
        { value: 'notifications', label: 'Notifications', content: 'Choose what you get notified about.' }
    ];
}
```
