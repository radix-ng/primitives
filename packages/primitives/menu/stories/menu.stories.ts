import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { Check, Dot, LucideAngularModule } from 'lucide-angular';
import { MenuModule } from '../index';
import { MenuCheckboxItemsStory } from './components/menu-checkbox-items';
import { MenuRadioItemsStory } from './components/menu-radio-items';
import { MenuWithLabelsItemsStory } from './components/menu-with-labels-items';
import { MenuWithSubMenuStory } from './components/menu-with-sub-menu';

const html = String.raw;

export default {
    title: 'Primitives/Menu [In Progress]',
    decorators: [
        moduleMetadata({
            imports: [
                MenuModule,
                LucideAngularModule,
                MenuRadioItemsStory,
                MenuCheckboxItemsStory,
                MenuWithLabelsItemsStory,
                MenuWithSubMenuStory,
                LucideAngularModule.pick({ Check, Dot })
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div
                    class="radix-themes light light-theme radix-themes-default-fonts rt-Flex rt-r-ai-start rt-r-jc-center rt-r-position-relative"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}

                    <style>
                        /* reset */
                        button {
                            all: unset;
                        }

                        .MenuRoot {
                            display: flex;
                            background-color: white;
                            padding: 3px;
                            border-radius: 6px;
                            box-shadow: 0 2px 10px var(--black-a7);
                        }

                        .MenuTrigger {
                            padding: 8px 12px;
                            outline: none;
                            user-select: none;
                            font-weight: 500;
                            line-height: 1;
                            border-radius: 4px;
                            color: var(--violet-11);
                            font-size: 13px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            gap: 2px;
                        }

                        .MenuTrigger[data-highlighted],
                        .MenuTrigger[data-state='open'] {
                            background-color: var(--violet-4);
                        }

                        .MenuContent,
                        .MenuSubContent {
                            min-width: 220px;
                            background-color: white;
                            border-radius: 6px;
                            padding: 5px;
                            box-shadow:
                                0px 10px 38px -10px rgba(22, 23, 24, 0.35),
                                0px 10px 20px -15px rgba(22, 23, 24, 0.2);
                            animation-duration: 400ms;
                            animation-timing-function: cubic-bezier(0.16, 1, 0.3, 1);
                            will-change: transform, opacity;
                        }

                        .MenuItem,
                        .MenuSubTrigger,
                        .MenuCheckboxItem,
                        .MenuRadioItem {
                            all: unset;
                            font-size: 13px;
                            line-height: 1;
                            color: var(--violet-11);
                            border-radius: 4px;
                            display: flex;
                            align-items: center;
                            height: 25px;
                            padding: 0 10px;
                            position: relative;
                            user-select: none;
                        }

                        .MenuItem.inset,
                        .MenuSubTrigger.inset,
                        .MenuCheckboxItem.inset,
                        .MenuRadioItem.inset {
                            padding-left: 20px;
                        }

                        .MenuItem[data-state='open'],
                        .MenuSubTrigger[data-state='open'] {
                            background-color: var(--violet-4);
                            color: var(--violet-11);
                        }

                        .MenuItem[data-highlighted],
                        .MenuSubTrigger[data-highlighted],
                        .MenuCheckboxItem[data-highlighted],
                        .MenuRadioItem[data-highlighted] {
                            background-image: linear-gradient(135deg, var(--violet-9) 0%, var(--violet-10) 100%);
                            color: var(--violet-1);
                        }

                        .MenuItem[data-disabled],
                        .MenuSubTrigger[data-disabled],
                        .MenuCheckboxItem[data-disabled],
                        .MenuRadioItem[data-disabled] {
                            color: var(--mauve-8);
                            pointer-events: none;
                        }

                        .MenuItemIndicator {
                            position: absolute;
                            left: 0;
                            width: 20px;
                            display: inline-flex;
                            align-items: center;
                            justify-content: center;
                        }

                        .MenuSeparator {
                            height: 1px;
                            background-color: var(--violet-6);
                            margin: 5px;
                        }

                        [data-highlighted] > .RightSlot {
                            color: white;
                        }

                        [data-disabled] > .RightSlot {
                            color: var(--mauve-8);
                        }
                    </style>
                </div>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="MenuRoot" MenuRoot>
                <div class="MenuTrigger" MenuItem MenuTrigger [menuTriggerFor]="file">File</div>
            </div>

            <ng-template #file>
                <div class="MenuContent" MenuContent>
                    <div class="MenuItem" MenuItem>Undo</div>
                    <div class="MenuItem" MenuItem>Redo</div>
                    <div class="MenuSeparator" MenuSeparator></div>
                    <div class="MenuItem" MenuItem>Cut</div>
                    <div class="MenuItem" MenuItem>Copy</div>
                    <div class="MenuItem" MenuItem>Paste</div>
                </div>
            </ng-template>
        `
    })
};

export const ItemDisabled: Story = {
    render: () => ({
        template: html`
            <div class="MenuRoot" MenuRoot>
                <div class="MenuTrigger" MenuItem MenuTrigger [menuTriggerFor]="file">File</div>
            </div>

            <ng-template #file>
                <div class="MenuContent" MenuContent>
                    <div class="MenuItem" MenuItem disabled>Undo</div>
                    <div class="MenuItem" MenuItem>Redo</div>
                    <div class="MenuSeparator" MenuSeparator></div>
                    <div class="MenuItem" MenuItem>Cut</div>
                    <div class="MenuItem" MenuItem disabled>Copy</div>
                    <div class="MenuItem" MenuItem>Paste</div>
                </div>
            </ng-template>
        `
    })
};

export const RadioItem: Story = {
    render: () => ({
        template: html`
            <menu-radio-items-story />
        `
    })
};

export const CheckboxItem: Story = {
    render: () => ({
        template: html`
            <menu-checkbox-items-story />
        `
    })
};

export const WithLabels: Story = {
    render: () => ({
        template: html`
            <menu-with-labels-items-story />
        `
    })
};

export const WithSubMenu: Story = {
    render: () => ({
        template: html`
            <menu-with-sub-menu-story />
        `
    })
};
