import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
import { RdxToggleGroupItemDirective } from '../src/toggle-group-item.directive';
import { RdxToggleGroupDirective } from '../src/toggle-group.directive';
import { ToggleGroup } from './toggle-group';

const html = String.raw;

export default {
    title: 'Primitives/Toggle Group',
    decorators: [
        moduleMetadata({
            imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, LucideAngularModule, ToggleGroup]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        button {
                            all: unset;
                        }
                        .ToggleGroup {
                            display: inline-flex;
                            background-color: var(--mauve-6);
                            border-radius: 4px;
                            box-shadow: 0 2px 10px var(--black-a7);
                        }

                        .ToggleGroupItem {
                            background-color: white;
                            color: var(--mauve-11);
                            height: 35px;
                            width: 35px;
                            display: flex;
                            font-size: 15px;
                            line-height: 1;
                            align-items: center;
                            justify-content: center;
                            margin-left: 1px;
                        }
                        .ToggleGroupItem[disabled] {
                            cursor: not-allowed;
                            opacity: 0.5;
                        }
                        .ToggleGroupItem:first-child {
                            margin-left: 0;
                            border-top-left-radius: 4px;
                            border-bottom-left-radius: 4px;
                        }
                        .ToggleGroupItem:last-child {
                            border-top-right-radius: 4px;
                            border-bottom-right-radius: 4px;
                        }
                        .ToggleGroupItem:hover {
                            background-color: var(--violet-3);
                        }
                        .ToggleGroupItem[data-state='on'] {
                            background-color: var(--violet-5);
                            color: var(--violet-11);
                        }
                        .ToggleGroupItem:focus {
                            position: relative;
                            box-shadow: 0 0 0 2px black;
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
            <div class="ToggleGroup" rdxToggleGroup value="center" aria-label="Text alignment">
                <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                    <lucide-icon name="align-left" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                    <lucide-icon name="align-center" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                    <lucide-icon name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Multiple: Story = {
    render: () => ({
        props: {
            selectedValues: ['left', 'center']
        },
        template: html`
            <div
                class="ToggleGroup"
                rdxToggleGroup
                type="multiple"
                [value]="selectedValues"
                aria-label="Text alignment"
            >
                <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                    <lucide-icon name="align-left" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                    <lucide-icon name="align-center" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                    <lucide-icon name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Disable: Story = {
    render: () => ({
        props: {
            selectedValues: ['center']
        },
        template: html`
            <div
                class="ToggleGroup"
                rdxToggleGroup
                type="multiple"
                [value]="selectedValues"
                aria-label="Text alignment"
            >
                <button class="ToggleGroupItem" disabled rdxToggleGroupItem value="left" aria-label="Left aligned">
                    <lucide-icon name="align-left" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                    <lucide-icon name="align-center" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" disabled rdxToggleGroupItem value="right" aria-label="Right aligned">
                    <lucide-icon name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const DisableGroup: Story = {
    render: () => ({
        template: html`
            <div class="ToggleGroup" rdxToggleGroup aria-label="Text alignment" disabled>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                    <lucide-icon name="align-left" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                    <lucide-icon name="align-center" size="12"></lucide-icon>
                </button>
                <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                    <lucide-icon name="align-right" size="12"></lucide-icon>
                </button>
            </div>
        `
    })
};

export const Component: Story = {
    render: () => ({
        template: html`
            <toggle-group />
        `
    })
};
