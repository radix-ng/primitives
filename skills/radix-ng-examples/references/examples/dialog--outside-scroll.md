# Dialog — Outside scroll

> One example from the [Dialog](../components/dialog.md) index — imports, anatomy, and links to the API and styling contracts are there.

> Generated from `@radix-ng/primitives@1.1.2` — if the installed version differs, verify the API against the installed package.

Make the `rdxDialogViewport` fill the screen and compose a custom [Scroll Area](?path=/docs/primitives-scroll-area--docs)
inside it, so the whole dialog scrolls — with a styled overlay scrollbar — when it is taller than the
screen. Center the popup with the scroll-area content's `min-h-full items-center` layout and give it
vertical margin so it can grow past the bottom edge.

```typescript
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { LucideX } from '@lucide/angular';
import { dialogImports } from '@radix-ng/primitives/dialog';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoDialog } from '../../storybook/styles';

/**
 * Outside-scroll dialog — a 1-1 port of the Base UI example.
 *
 * The dialog `Viewport` fills the screen and hosts a {@link RdxScrollAreaRoot custom scroll area}
 * instead of a native `overflow: auto` container, so a styled overlay scrollbar (with a draggable
 * thumb) appears while scrolling. The popup is centered by the scroll-area content's
 * `min-h-full items-center` layout and given `my-16` breathing room, so it can grow past the bottom
 * edge while the whole page (not an inner region) scrolls.
 */
@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-dialog-outside-scroll',
    imports: [
        ...dialogImports,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb,
        LucideX
    ],
    template: `
        <div rdxDialogRoot>
            <button [class]="cn(b.base, b.primary, b.size.md)" rdxDialogTrigger>Open dialog</button>

            <ng-template rdxDialogPortal>
                <div [class]="cn(d.backdrop, d.backdropAnimated)" rdxDialogBackdrop></div>

                <!-- Full-screen viewport hosting a custom scroll area (not native overflow). -->
                <div class="group/dialog fixed inset-0 z-50" rdxDialogViewport>
                    <!--
                        Modal dialogs set \`body { pointer-events: none }\`, which the scroll surface inherits —
                        re-enable it here so the wheel works anywhere in the viewport (not only over the popup),
                        and drop it again during the exit animation. Outside-press dismissal still fires.
                    -->
                    <div
                        class="pointer-events-auto h-full overscroll-contain group-data-[ending-style]/dialog:pointer-events-none"
                        rdxScrollAreaRoot
                    >
                        <div class="h-full overscroll-contain" rdxScrollAreaViewport>
                            <div class="flex min-h-full items-center justify-center" rdxScrollAreaContent>
                                <div
                                    [class]="
                                        cn(
                                            card,
                                            'relative mx-auto my-16 flex w-[min(40rem,calc(100vw-2rem))] flex-col gap-4 p-6 focus:outline-none',
                                            d.popupAnimated
                                        )
                                    "
                                    rdxDialogPopup
                                >
                                    <div class="relative flex flex-col gap-1 pr-8">
                                        <h2 [class]="d.title" rdxDialogTitle>Dialog</h2>
                                        <p [class]="d.description" rdxDialogDescription>
                                            This layout keeps an outer container scrollable while the dialog can extend
                                            past the bottom edge.
                                        </p>
                                        <button [class]="d.close" aria-label="Close" rdxDialogClose>
                                            <svg aria-hidden="true" lucideX size="16" />
                                        </button>
                                    </div>

                                    <div class="flex flex-col gap-4">
                                        @for (item of contentSections; track item.title) {
                                            <section class="flex flex-col gap-1">
                                                <h3 class="text-card-foreground text-sm font-semibold">
                                                    {{ item.title }}
                                                </h3>
                                                <p class="text-muted-foreground text-sm">{{ item.body }}</p>
                                            </section>
                                        }
                                    </div>

                                    <!-- prettier-ignore -->
                                    <p class="text-muted-foreground text-sm">Related docs:
                                        @for (item of relatedLinks; track item.href; let last = $last) {<a class="text-card-foreground underline decoration-1 underline-offset-2 hover:no-underline" [href]="item.href">{{ item.label }}</a>{{ last ? '.' : ',' }} }
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-foreground/10 pointer-events-none flex w-4 touch-none justify-center opacity-0 transition-opacity duration-200 hover:pointer-events-auto hover:opacity-100 hover:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75"
                            rdxScrollAreaScrollbar
                            orientation="vertical"
                        >
                            <div class="bg-foreground/50 w-full rounded-full" rdxScrollAreaThumb></div>
                        </div>
                    </div>
                </div>
            </ng-template>
        </div>
    `
})
export class RdxDialogOutsideScrollComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly d = demoDialog;
    protected readonly card = demoCard;

    protected readonly contentSections = [
        {
            title: 'What a dialog is for',
            body: 'Use a dialog when you need the user to complete a focused task or read something important without navigating away. It opens on top of the page and returns focus back where it started when closed.'
        },
        {
            title: 'Anatomy at a glance',
            body: 'Root, Trigger, Portal, Backdrop, Viewport, Popup, Title, Description, Close. Keep the title short and the first paragraph specific so screen readers announce something meaningful.'
        },
        {
            title: 'Opening and closing',
            body: 'Control it using external state via the `open` and `onOpenChange` props, or let it manage state for you internally.'
        },
        {
            title: 'Keyboard and focus behavior',
            body: 'Focus moves inside the dialog when it opens. Tab and Shift+Tab loop within, and Esc requests close.'
        },
        {
            title: 'Accessible labeling',
            body: 'Set an explicit title and description using the `Dialog.Title` and `Dialog.Description` components.'
        },
        {
            title: 'Backdrop and page scrolling',
            body: 'The backdrop visually separates layers while background content is inert. Don’t rely on dimness alone—keep copy clear and buttons obvious so actions are easy to choose.'
        },
        {
            title: 'Portals and stacking',
            body: 'Dialogs render in a portal so they sit above the `isolation: isolate` app content and avoid local z-index wars.'
        },
        {
            title: 'Viewport overflow',
            body: 'Let long content overflow the bottom edge and reveal as you scroll the page container. Keep generous padding at the top and bottom so the dialog doesn’t feel jammed against the edges.'
        },
        {
            title: 'Nested dialogs and confirmations',
            body: 'If closing a dialog needs confirmation, open a child alert dialog rather than mutating the current one. The parent stays visible behind it; only the topmost layer should feel interactive.'
        },
        {
            title: 'Transitions that respect motion settings',
            body: 'Use small, fast transitions (opacity plus a few pixels of Y translation or scale). Subtle motion helps people notice what changed without slowing them down.'
        },
        {
            title: 'Controlled vs. uncontrolled',
            body: 'Controlled state is best when other parts of the page need to react to open/close. Uncontrolled is fine for local cases where only the dialog matters.'
        },
        {
            title: 'Close affordances',
            body: 'Always offer a visible close button in the corner. Don’t rely only on Esc or the backdrop for pointer outside presses. Touch screen readers and accessibility users benefit from a clear, targetable control to click to close the dialog.'
        },
        {
            title: 'Forms inside dialogs',
            body: 'Keep forms short; longer flows usually deserve a full page. Validate inline, keep button text specific (“Create project”), and disable destructive actions until the input is valid.'
        },
        {
            title: 'Content guidelines',
            body: 'Lead with the outcome (“Rename project?”) and follow with one or two short, concrete sentences. Avoid long prose; link out for details instead.'
        },
        {
            title: 'SSR and hydration notes',
            body: 'Because dialogs render in a portal, make sure your portal container exists on the client.'
        },
        {
            title: 'Mobile ergonomics',
            body: 'Use larger touch targets and keep the close button reachable with the thumb. Avoid full-screen modals unless the task truly needs a whole screen.'
        },
        {
            title: 'Theming and density',
            body: 'Match spacing and corner radius to your system. Use a slightly denser layout than pages so the dialog feels purpose-built, not like a mini web page.'
        },
        {
            title: 'Internationalization',
            body: 'Plan for longer text. Buttons can grow to two lines; titles should wrap gracefully. Keep destructive terms consistent across locales.'
        },
        {
            title: 'Performance',
            body: 'Children are mounted lazily when the dialog opens. If the dialog can reopen often, consider the `keepMounted` prop sparingly to perform the work only once on mount to avoid re-initializing complex trees on each open.'
        },
        {
            title: 'When a popover is better',
            body: 'If the content is a small hint or a few quick actions anchored to a control, use a popover or menu instead of a dialog. Dialogs interrupt on purpose—use that sparingly.'
        },
        {
            title: 'Follow-up and cleanup',
            body: 'After a successful action, close the dialog and show confirmation in context (toast, inline message, or updated UI) so people can see the result of what they just did.'
        }
    ];

    protected readonly relatedLinks = [
        { href: '/components/scroll-area', label: 'Scroll Area' },
        { href: '/components/drawer', label: 'Drawer' },
        { href: '/components/popover', label: 'Popover' }
    ];
}
```
