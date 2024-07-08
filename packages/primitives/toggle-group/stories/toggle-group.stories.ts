import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { AlignCenter, AlignLeft, AlignRight, LucideAngularModule } from 'lucide-angular';

import { RdxToggleGroupButtonDirective } from '../src/toggle-group-button.directive';
import { RdxToggleGroupMultiDirective } from '../src/toggle-group-multi.directive';
import { RdxToggleGroupDirective } from '../src/toggle-group.directive';

export default {
    title: 'Primitives/Toggle Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToggleGroupDirective,
                RdxToggleGroupButtonDirective,
                RdxToggleGroupMultiDirective,

                LucideAngularModule,
                LucideAngularModule.pick({ AlignRight, AlignLeft, AlignCenter })
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}

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

                      </div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `

    <div rdxToggleGroup value="center" aria-label="Text alignment" class="ToggleGroup">
        <button rdxToggleGroupButton value="left" aria-label="Left aligned" class="ToggleGroupItem" >
            <lucide-icon name="align-left" size="16"></lucide-icon>
        </button>
        <button rdxToggleGroupButton value="center" aria-label="Center aligned" class="ToggleGroupItem">
            <lucide-icon name="align-center" size="16"></lucide-icon>
        </button>
        <button rdxToggleGroupButton value="right" aria-label="Right aligned" class="ToggleGroupItem">
            <lucide-icon name="align-right" size="16"></lucide-icon>
        </button>
    </div>

`
    })
};
