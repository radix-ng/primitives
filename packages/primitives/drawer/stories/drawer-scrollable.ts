import { ChangeDetectionStrategy, Component } from '@angular/core';
import { drawerImports } from '@radix-ng/primitives/drawer';
import {
    RdxScrollAreaContent,
    RdxScrollAreaRoot,
    RdxScrollAreaScrollbar,
    RdxScrollAreaThumb,
    RdxScrollAreaViewport
} from '@radix-ng/primitives/scroll-area';
import { cn, demoButton, demoCard, demoDrawer, demoFocusRing } from '../../storybook/styles';

const ITEMS = [
    { href: '/react/overview', label: 'Overview' },
    { href: '/react/components', label: 'Components' },
    { href: '/react/utils', label: 'Utilities' },
    { href: '/react/overview/releases', label: 'Releases' }
] as const;

const LONG_LIST = [
    { href: '/react/components/accordion', label: 'Accordion' },
    { href: '/react/components/alert-dialog', label: 'Alert Dialog' },
    { href: '/react/components/autocomplete', label: 'Autocomplete' },
    { href: '/react/components/avatar', label: 'Avatar' },
    { href: '/react/components/button', label: 'Button' },
    { href: '/react/components/checkbox', label: 'Checkbox' },
    { href: '/react/components/checkbox-group', label: 'Checkbox Group' },
    { href: '/react/components/collapsible', label: 'Collapsible' },
    { href: '/react/components/combobox', label: 'Combobox' },
    { href: '/react/components/context-menu', label: 'Context Menu' },
    { href: '/react/components/dialog', label: 'Dialog' },
    { href: '/react/components/drawer', label: 'Drawer' },
    { href: '/react/components/field', label: 'Field' },
    { href: '/react/components/fieldset', label: 'Fieldset' },
    { href: '/react/components/form', label: 'Form' },
    { href: '/react/components/input', label: 'Input' },
    { href: '/react/components/menu', label: 'Menu' },
    { href: '/react/components/menubar', label: 'Menubar' },
    { href: '/react/components/meter', label: 'Meter' },
    { href: '/react/components/navigation-menu', label: 'Navigation Menu' },
    { href: '/react/components/number-field', label: 'Number Field' },
    { href: '/react/components/otp-field', label: 'OTP Field' },
    { href: '/react/components/popover', label: 'Popover' },
    { href: '/react/components/preview-card', label: 'Preview Card' },
    { href: '/react/components/progress', label: 'Progress' },
    { href: '/react/components/radio', label: 'Radio' },
    { href: '/react/components/scroll-area', label: 'Scroll Area' },
    { href: '/react/components/select', label: 'Select' },
    { href: '/react/components/separator', label: 'Separator' },
    { href: '/react/components/slider', label: 'Slider' },
    { href: '/react/components/switch', label: 'Switch' },
    { href: '/react/components/tabs', label: 'Tabs' },
    { href: '/react/components/toast', label: 'Toast' },
    { href: '/react/components/toggle', label: 'Toggle' },
    { href: '/react/components/toggle-group', label: 'Toggle Group' },
    { href: '/react/components/toolbar', label: 'Toolbar' },
    { href: '/react/components/tooltip', label: 'Tooltip' }
] as const;

@Component({
    changeDetection: ChangeDetectionStrategy.Eager,
    selector: 'rdx-drawer-scrollable',
    imports: [
        ...drawerImports,
        RdxScrollAreaRoot,
        RdxScrollAreaViewport,
        RdxScrollAreaContent,
        RdxScrollAreaScrollbar,
        RdxScrollAreaThumb
    ],
    template: `
        <div rdxDrawerRoot>
            <button [class]="cn(b.base, b.primary, 'h-8 px-3 text-sm leading-none font-normal')" rdxDrawerTrigger>
                Open mobile menu
            </button>

            <ng-template rdxDrawerPortal>
                <div
                    [class]="cn(d.backdrop, d.overlayAnimated, 'opacity-[calc(1-var(--drawer-swipe-progress))]')"
                    rdxDrawerBackdrop
                ></div>

                <div class="group fixed inset-0 z-50" rdxDrawerViewport>
                    <div class="pointer-events-auto h-full overscroll-contain" rdxScrollAreaRoot>
                        <div class="h-full touch-auto overscroll-contain" rdxScrollAreaViewport>
                            <div
                                class="flex min-h-full items-end justify-center pt-8 min-[42rem]:px-16 min-[42rem]:py-16"
                                rdxScrollAreaContent
                            >
                                <div
                                    [class]="
                                        cn(
                                            card,
                                            'data-[state=open]:animate-drawer-in-bottom data-[state=closed]:animate-drawer-out-bottom',
                                            'w-full max-w-[42rem] rounded-t-2xl rounded-b-none border-x-0 border-b-0',
                                            '[--drawer-swipe-movement-x:0px] [--drawer-swipe-movement-y:0px]',
                                            '[transform:translate3d(var(--drawer-swipe-movement-x),var(--drawer-swipe-movement-y),0)]',
                                            'transition-transform duration-300 outline-none data-[swiping]:transition-none',
                                            'min-[42rem]:rounded-2xl min-[42rem]:border'
                                        )
                                    "
                                    rdxDrawerPopup
                                >
                                    <nav class="relative flex flex-col px-6 pt-4 pb-6" aria-label="Navigation">
                                        <div class="grid grid-cols-[1fr_auto_1fr] items-start">
                                            <svg class="h-9 w-9" aria-hidden="true" />
                                            <div class="bg-muted h-1.5 w-12 justify-self-center rounded-full"></div>
                                            <button
                                                [class]="cn(b.base, b.ghost, 'h-8 w-8 justify-self-end p-0')"
                                                aria-label="Close menu"
                                                rdxDrawerClose
                                            >
                                                <svg
                                                    class="block"
                                                    aria-hidden="true"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 16 16"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    stroke-linecap="square"
                                                    stroke-linejoin="round"
                                                >
                                                    <path d="m2.5 2.5 11 11m-11 0 11-11" />
                                                </svg>
                                            </button>
                                        </div>

                                        <div class="w-full" rdxDrawerContent>
                                            <h2 [class]="cn(d.title, 'm-0 mb-1')" rdxDrawerTitle>Menu</h2>
                                            <p [class]="cn(d.description, 'm-0 mb-5')" rdxDrawerDescription>
                                                Scroll the long list. Flick down from the top to dismiss.
                                            </p>

                                            <div class="pb-8">
                                                <ul class="m-0 grid list-none gap-1 p-0">
                                                    @for (item of items; track item.label) {
                                                        <li class="flex">
                                                            <a [class]="link" [href]="item.href">
                                                                {{ item.label }}
                                                            </a>
                                                        </li>
                                                    }
                                                </ul>

                                                <ul
                                                    class="m-0 mt-6 grid list-none gap-1 p-0"
                                                    aria-label="Component links"
                                                >
                                                    @for (item of longList; track item.label) {
                                                        <li class="flex">
                                                            <a [class]="link" [href]="item.href">
                                                                {{ item.label }}
                                                            </a>
                                                        </li>
                                                    }
                                                </ul>
                                            </div>
                                        </div>
                                    </nav>
                                </div>
                            </div>
                        </div>

                        <div
                            class="bg-foreground/10 pointer-events-none m-px flex w-4 touch-none justify-center opacity-0 transition-opacity duration-200 hover:pointer-events-auto hover:opacity-100 hover:duration-75 data-[scrolling]:pointer-events-auto data-[scrolling]:opacity-100 data-[scrolling]:duration-75"
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
export class RdxDrawerScrollableComponent {
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly card = demoCard;
    protected readonly d = demoDrawer;
    protected readonly items = ITEMS;
    protected readonly longList = LONG_LIST;
    protected readonly link = cn(
        demoCard,
        demoFocusRing,
        'text-foreground hover:bg-muted active:bg-muted flex h-12 w-full items-center px-4 text-sm no-underline shadow-none transition-colors'
    );
}
