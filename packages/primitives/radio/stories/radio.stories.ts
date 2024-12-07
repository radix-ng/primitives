import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxLabelDirective } from '../../label';
import { RdxRovingFocusGroupDirective, RdxRovingFocusItemDirective } from '../../roving-focus';
import { RdxRadioIndicatorDirective } from '../src/radio-indicator.directive';
import { RdxRadioItemInputDirective } from '../src/radio-item-input.directive';
import { RdxRadioItemDirective } from '../src/radio-item.directive';
import { RdxRadioGroupDirective } from '../src/radio-root.directive';
import { RadioGroupComponent } from './radio-group.component';

const html = String.raw;

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelDirective,
                RdxRadioItemDirective,
                RdxRadioIndicatorDirective,
                RdxRadioItemInputDirective,
                RdxRadioGroupDirective,
                RdxRovingFocusGroupDirective,
                RdxRovingFocusItemDirective,
                RadioGroupComponent
            ]
        }),
        componentWrapperDecorator(
            (story) => html`
                <div class="radix-themes light light-theme" data-radius="medium" data-scaling="100%">${story}</div>

                <style>
                    /* reset */
                    button {
                        all: unset;
                    }

                    .RadioGroupRoot {
                        display: flex;
                        flex-direction: column;
                        gap: 10px;
                    }

                    .RadioGroupItem {
                        background-color: white;
                        width: 25px;
                        height: 25px;
                        border-radius: 100%;
                        box-shadow: 0 2px 10px var(--black-a7);
                    }
                    .RadioGroupItem:hover {
                        background-color: var(--violet-3);
                    }
                    .RadioGroupItem:focus {
                        box-shadow: 0 0 0 2px black;
                    }

                    .RadioGroupIndicator {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 100%;
                        position: relative;
                    }
                    .RadioGroupIndicator::after {
                        content: '';
                        display: block;
                        width: 11px;
                        height: 11px;
                        border-radius: 50%;
                        background-color: var(--violet-11);
                    }

                    .RadioGroupIndicator[data-state='unchecked'] {
                        display: none;
                    }

                    .Input {
                        transform: translateX(-100%);
                        position: absolute;
                        pointer-events: none;
                        opacity: 0;
                        margin: 0;
                        width: 25px;
                        height: 25px;
                    }

                    .Label {
                        color: white;
                        font-size: 15px;
                        line-height: 1;
                        padding-left: 15px;
                    }
                </style>
            `
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <form>
                <div class="RadioGroupRoot" rdxRadioRoot orientation="vertical" aria-label="View density">
                    <div style="display: flex; align-items: center;">
                        <button class="RadioGroupItem" id="r1" rdxRadioItem value="default">
                            <div class="RadioGroupIndicator" rdxRadioIndicator></div>
                            <input class="Input" rdxRadioItemInput feature="fully-hidden" />
                        </button>
                        <label class="Label" rdxLabel htmlFor="r1">Default</label>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <button class="RadioGroupItem" id="r2" rdxRadioItem [required]="true" value="comfortable">
                            <div class="RadioGroupIndicator" rdxRadioIndicator></div>
                            <input class="Input" rdxRadioItemInput feature="fully-hidden" />
                        </button>
                        <label class="Label" rdxLabel htmlFor="r2">Comfortable</label>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <button class="RadioGroupItem" id="r3" rdxRadioItem value="compact">
                            <div class="RadioGroupIndicator" rdxRadioIndicator></div>
                            <input class="Input" rdxRadioItemInput feature="fully-hidden" />
                        </button>
                        <label class="Label" rdxLabel htmlFor="r3">Compact</label>
                    </div>
                </div>
            </form>
        `
    })
};

export const RadioGroup: Story = {
    render: () => ({
        template: `<radio-groups-forms-example></radio-groups-forms-example>`
    })
};
