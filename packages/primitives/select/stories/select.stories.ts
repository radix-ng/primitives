import { BrowserAnimationsModule, provideAnimations } from '@angular/platform-browser/animations';
import {
    RdxSelectComponent,
    RdxSelectContentDirective,
    RdxSelectGroupDirective,
    RdxSelectIconDirective,
    RdxSelectItemDirective,
    RdxSelectItemIndicatorDirective,
    RdxSelectLabelDirective,
    RdxSelectSeparatorDirective,
    RdxSelectTriggerDirective,
    RdxSelectValueDirective
} from '@radix-ng/primitives/select';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { ChevronDown, LucideAngularModule } from 'lucide-angular';

const html = String.raw;

export default {
    title: 'Primitives/Select',
    decorators: [
        moduleMetadata({
            imports: [
                RdxSelectComponent,
                RdxSelectSeparatorDirective,
                RdxSelectLabelDirective,
                RdxSelectItemIndicatorDirective,
                RdxSelectItemDirective,
                RdxSelectGroupDirective,
                BrowserAnimationsModule,
                RdxSelectContentDirective,
                RdxSelectTriggerDirective,
                RdxSelectValueDirective,
                RdxSelectIconDirective,
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
                /* reset */
button {
    all: unset;
}

.SelectTrigger {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 4px;
    padding: 0 15px;
    font-size: 13px;
    line-height: 1;
    height: 35px;
    gap: 5px;
    background-color: white;
    color: var(--violet-11);
    box-shadow: 0 2px 10px var(--black-a7);
}
.SelectTrigger:hover {
    background-color: var(--mauve-3);
}
.SelectTrigger:focus {
    box-shadow: 0 0 0 2px black;
}
.SelectTrigger[data-placeholder] {
    color: var(--violet-9);
}

.SelectIcon {
    color: Var(--violet-11);
}

.SelectContent {
    overflow: hidden;
    background-color: white;
    border-radius: 6px;
    box-shadow:
    0px 10px 38px -10px rgba(22, 23, 24, 0.35),
    0px 10px 20px -15px rgba(22, 23, 24, 0.2);
}

.SelectViewport {
    padding: 5px;
}

.SelectItem {
    font-size: 13px;
    line-height: 1;
    color: var(--violet-11);
    border-radius: 3px;
    display: flex;
    align-items: center;
    height: 25px;
    padding: 0 35px 0 25px;
    position: relative;
    user-select: none;
}
.SelectItem[data-disabled] {
    color: var(--mauve-8);
    pointer-events: none;
}
.SelectItem[data-highlighted] {
    outline: none;
    background-color: var(--violet-9);
    color: var(--violet-1);
}

.SelectLabel {
    padding: 0 25px;
    font-size: 12px;
    line-height: 25px;
    color: var(--mauve-11);
}

.SelectSeparator {
    height: 1px;
    background-color: var(--violet-6);
    margin: 5px;
}

.SelectItemIndicator {
    position: absolute;
    left: 0;
    width: 25px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
}

.SelectScrollButton {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 25px;
    background-color: white;
    color: var(--violet-11);
    cursor: default;
}
                </style>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <span rdxSelect>
                <button class="SelectTrigger" rdxSelectTrigger>
                    <span rdxSelectValue placeholder="Select a fruit…"></span>
                    <lucide-icon class="SelectIcon" size="16" name="chevron-down" rdxSelectIcon />
                </button>
                <div class="SelectContent" rdxSelectContent>
                    <div class="SelectGroup" rdxSelectGroup>
                        <div class="SelectLabel" rdxSelectLabel>Fruits</div>
                        <div class="SelectItem" rdxSelectItem value="apple">Apple</div>
                        <div class="SelectItem" rdxSelectItem value="banana">Banana</div>
                        <div class="SelectItem" rdxSelectItem value="blueberry">Blueberry</div>
                        <div class="SelectItem" rdxSelectItem value="grapes">Grapes</div>
                        <div class="SelectItem" rdxSelectItem value="pineapple">Pineapple</div>
                    </div>

                    <div class="SelectSeparator" rdxSelectSeparator></div>

                    <div class="SelectGroup" rdxSelectGroup>
                        <div class="SelectLabel" rdxSelectLabel>Vegetables</div>
                        <div class="SelectItem" rdxSelectItem value="aubergine">Aubergine</div>
                        <div class="SelectItem" rdxSelectItem value="broccoli">Broccoli</div>
                        <div class="SelectItem" rdxSelectItem value="carrot" disabled>Carrot</div>
                        <div class="SelectItem" rdxSelectItem value="courgette">Courgette</div>
                        <div class="SelectItem" rdxSelectItem value="leek">Leek</div>
                    </div>

                    <div class="SelectSeparator" rdxSelectSeparator></div>

                    <div class="SelectGroup" rdxSelectGroup>
                        <div class="SelectLabel" rdxSelectLabel>Meat</div>
                        <div class="SelectItem" rdxSelectItem value="beef">Beef</div>
                        <div class="SelectItem" rdxSelectItem value="chicken">Chicken</div>
                        <div class="SelectItem" rdxSelectItem value="lamb">Lamb</div>
                        <div class="SelectItem" rdxSelectItem value="pork">Pork</div>
                    </div>
                </div>
            </span>
        `
    })
};
