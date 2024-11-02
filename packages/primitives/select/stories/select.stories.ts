import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import {
    RdxSelectContentDirective,
    RdxSelectGroupDirective,
    RdxSelectItemDirective,
    RdxSelectItemIndicatorDirective,
    RdxSelectLabelDirective,
    RdxSelectRootComponent,
    RdxSelectSeparatorDirective,
    RdxSelectTriggerDirective
} from '@radix-ng/primitives/select';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';

const html = String.raw;

export default {
    title: 'Primitives/Select',
    decorators: [
        moduleMetadata({
            imports: [
                RdxSelectRootComponent,
                RdxSelectSeparatorDirective,
                RdxSelectLabelDirective,
                RdxSelectItemIndicatorDirective,
                RdxSelectItemDirective,
                RdxSelectGroupDirective,
                BrowserAnimationsModule,
                RdxSelectContentDirective,
                RdxSelectTriggerDirective,
                LucideAngularModule,
                LucideAngularModule.pick({ ChevronDown })
            ],
            providers: [provideAnimations()]
        }),
        componentWrapperDecorator(
            (story) => `
                <div class="radix-themes light light-theme radix-themes-default-fonts"
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>

                <style>
                </style>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="SelectRoot" rdxSelectRoot>
                <div rdxSelectTrigger>
                    Selected value:
                </div>
                <div rdxSelectContent>
                    <div rdxSelectItem>Item 1</div>
                    <div rdxSelectItem>Item 2</div>
                    <div rdxSelectItem>Item 3</div>
                    <div rdxSelectItem>Item 4</div>
                    <div rdxSelectItem>Item 5</div>
                </div>
            </div>
        `
    })
};
