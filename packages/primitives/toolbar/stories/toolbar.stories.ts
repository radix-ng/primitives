import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { AlignCenter, AlignLeft, AlignRight, Bold, Italic, LucideAngularModule, Strikethrough } from 'lucide-angular';
import { RdxToolbarButtonDirective } from '../src/toolbar-button.directive';
import { RdxToolbarLinkDirective } from '../src/toolbar-link.directive';
import { RdxToolbarRootDirective } from '../src/toolbar-root.directive';
import { RdxToolbarSeparatorDirective } from '../src/toolbar-separator.directive';
import { RdxToolbarToggleGroupDirective } from '../src/toolbar-toggle-group.directive';
import { RdxToolbarToggleItemDirective } from '../src/toolbar-toggle-item.directive';

const html = String.raw;

export default {
    title: 'Primitives/Toolbar',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToolbarRootDirective,
                RdxToolbarSeparatorDirective,
                RdxToolbarLinkDirective,
                RdxToolbarButtonDirective,
                RdxToolbarToggleGroupDirective,
                RdxToolbarToggleItemDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ Italic, Bold, Strikethrough, AlignLeft, AlignCenter, AlignRight })
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">
                    ${story}

                    <style>
                        a,
                        button {
                            all: unset;
                        }

                        .ToolbarRoot {
                            display: flex;
                            padding: 10px;
                            width: 100%;
                            min-width: max-content;
                            border-radius: 6px;
                            background-color: white;
                            box-shadow: 0 2px 10px var(--black-a7);
                        }

                        .ToolbarToggleItem,
                        .ToolbarLink,
                        .ToolbarButton {
                            flex: 0 0 auto;
                            color: var(--mauve-11);
                            height: 25px;
                            padding: 0 5px;
                            border-radius: 4px;
                            display: inline-flex;
                            font-size: 13px;
                            line-height: 1;
                            align-items: center;
                            justify-content: center;
                        }

                        .ToolbarToggleItem:hover,
                        .ToolbarLink:hover,
                        .ToolbarButton:hover {
                            background-color: var(--violet-3);
                            color: var(--violet-11);
                        }

                        .ToolbarToggleItem:focus,
                        .ToolbarLink:focus,
                        .ToolbarButton:focus {
                            position: relative;
                            box-shadow: 0 0 0 2px var(--violet-7);
                        }

                        .ToolbarToggleItem {
                            background-color: white;
                            margin-left: 2px;
                        }

                        .ToolbarToggleItem:first-child {
                            margin-left: 0;
                        }

                        .ToolbarToggleItem[data-state='on'] {
                            background-color: var(--violet-5);
                            color: var(--violet-11);
                        }

                        .ToolbarSeparator {
                            width: 1px;
                            background-color: var(--mauve-6);
                            margin: 0 10px;
                        }

                        .ToolbarLink {
                            background-color: transparent;
                            color: var(--mauve-11);
                            display: none;
                            justify-content: center;
                            align-items: center;
                        }

                        .ToolbarLink:hover {
                            background-color: transparent;
                            cursor: pointer;
                        }

                        @media (min-width: 520px) {
                            .ToolbarLink {
                                display: inline-flex;
                            }
                        }

                        .ToolbarButton {
                            padding-left: 10px;
                            padding-right: 10px;
                            color: white;
                            background-color: var(--violet-9);
                        }

                        .ToolbarButton:hover {
                            background-color: var(--violet-10);
                            color: white;
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
            <div style="display: flex; flex:1;max-width:600px">
                <div class="ToolbarRoot" rdxToolbarRoot aria-label="Formatting options">
                    <div rdxToolbarToggleGroup orientation="horizontal" type="multiple" aria-label="Text formatting">
                        <button class="ToolbarToggleItem" rdxToolbarToggleItem value="bold" aria-label="Bold">
                            <lucide-angular name="bold" size="16" strokeWidth="2" style="display: flex" />
                        </button>
                        <button class="ToolbarToggleItem" rdxToolbarToggleItem value="italic" aria-label="Italic">
                            <lucide-angular name="italic" size="16" strokeWidth="2" style="display: flex" />
                        </button>
                        <button
                            class="ToolbarToggleItem"
                            rdxToolbarToggleItem
                            value="strikethrough"
                            aria-label="Strike through"
                        >
                            <lucide-angular name="Strikethrough" size="16" strokeWidth="2" style="display: flex" />
                        </button>
                    </div>
                    <div class="ToolbarSeparator" rdxToolbarSeparator></div>
                    <div rdxToolbarToggleGroup type="single" aria-label="Text alignment">
                        <button class="ToolbarToggleItem" rdxToolbarToggleItem value="left" aria-label="Left aligned">
                            <lucide-angular name="align-left" size="16" strokeWidth="1" style="display: flex" />
                        </button>
                        <button
                            class="ToolbarToggleItem"
                            rdxToolbarToggleItem
                            value="center"
                            aria-label="Center aligned"
                        >
                            <lucide-angular name="align-center" size="16" strokeWidth="1" style="display: flex" />
                        </button>
                        <button class="ToolbarToggleItem" rdxToolbarToggleItem value="right" aria-label="Right aligned">
                            <lucide-angular name="align-right" size="16" strokeWidth="1" style="display: flex" />
                        </button>
                    </div>
                    <div class="ToolbarSeparator" rdxToolbarSeparator orientation="vertical"></div>
                    <a class="ToolbarLink" href="#" target="_blank" style="margin-right: 10px;">Edited 2 hours ago</a>
                    <button class="ToolbarButton" style="margin-left: auto;">Share</button>
                </div>
            </div>
        `
    })
};
