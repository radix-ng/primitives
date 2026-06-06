import { popoverImports } from '@radix-ng/primitives/popover';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { LearnNotificationsPopover } from './learn-notifications-popover';

const html = String.raw;

/**
 * Live demos for the "Learn / Build a styled component" tutorial. Each story is one step of
 * the same Popover, adding a little more on top of the previous one without ever changing the
 * primitive's behavior. The tutorial page (docs MDX) embeds these via `<Canvas of={...} />`.
 *
 * `!autodocs` keeps the auto-generated docs page from competing with the hand-written MDX that
 * shares this title.
 */
export default {
    title: 'Learn/Build a styled component',
    tags: ['!autodocs'],
    decorators: [
        moduleMetadata({
            imports: [...popoverImports, LearnNotificationsPopover]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

// Step 1 — assemble the parts. Functional and accessible, but intentionally unstyled.
export const Step1Functional: Story = {
    name: '1 · Functional, no styling',
    render: () => ({
        template: html`
            <ng-container rdxPopoverRoot>
                <button rdxPopoverTrigger>Notifications</button>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div sideOffset="8" rdxPopoverPositioner>
                            <div rdxPopoverPopup>
                                <h2 rdxPopoverTitle>Notifications</h2>
                                <p rdxPopoverDescription>You are all caught up.</p>
                                <button rdxPopoverClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        `
    })
};

// Step 2 — style the trigger from its state (`data-open`, `data-disabled`).
export const Step2Trigger: Story = {
    name: '2 · Styled trigger',
    render: () => ({
        template: html`
            <ng-container rdxPopoverRoot>
                <button
                    class="border-border bg-background hover:bg-muted data-[open]:bg-muted rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                    rdxPopoverTrigger
                >
                    Notifications
                </button>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                            <div rdxPopoverPopup>
                                <h2 rdxPopoverTitle>Notifications</h2>
                                <p rdxPopoverDescription>You are all caught up.</p>
                                <button rdxPopoverClose>Close</button>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        `
    })
};

// Step 3 — style the popup like any card you own.
export const Step3Popup: Story = {
    name: '3 · Styled popup',
    render: () => ({
        template: html`
            <ng-container rdxPopoverRoot>
                <button
                    class="border-border bg-background hover:bg-muted data-[open]:bg-muted rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                    rdxPopoverTrigger
                >
                    Notifications
                </button>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                            <div
                                class="border-border bg-popover text-popover-foreground w-72 rounded-lg border p-4 shadow-md"
                                rdxPopoverPopup
                            >
                                <h2 class="text-sm font-medium" rdxPopoverTitle>Notifications</h2>
                                <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                    You are all caught up.
                                </p>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        `
    })
};

// Step 4 — animate enter/exit with CSS keyframes driven by `data-open` / `data-closed`.
export const Step4Animated: Story = {
    name: '4 · Animated',
    render: () => ({
        template: html`
            <ng-container rdxPopoverRoot>
                <button
                    class="border-border bg-background hover:bg-muted data-[open]:bg-muted rounded-md border px-3 py-2 text-sm font-medium transition-colors"
                    rdxPopoverTrigger
                >
                    Notifications
                </button>

                <ng-template rdxPopoverPortalPresence>
                    <div rdxPopoverPortal>
                        <div class="z-50" sideOffset="8" rdxPopoverPositioner>
                            <div
                                class="border-border bg-popover text-popover-foreground data-[open]:animate-popover-popup-in data-[closed]:animate-popover-popup-out w-72 rounded-lg border p-4 shadow-md"
                                rdxPopoverPopup
                            >
                                <h2 class="text-sm font-medium" rdxPopoverTitle>Notifications</h2>
                                <p class="text-muted-foreground mt-1 text-sm" rdxPopoverDescription>
                                    You are all caught up.
                                </p>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </ng-container>
        `
    })
};

// Step 5 — everything wrapped into one reusable component with projected content.
export const Step5Reusable: Story = {
    name: '5 · Reusable component',
    render: () => ({
        template: html`
            <learn-notifications-popover>
                <span trigger>Notifications</span>
                <h2 class="text-sm font-medium">Notifications</h2>
                <p class="text-muted-foreground mt-1 text-sm">You are all caught up.</p>
            </learn-notifications-popover>
        `
    })
};
