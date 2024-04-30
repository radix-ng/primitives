import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxLabelRootDirective } from '../../label';
import { RdxRadioIndicatorDirective } from '../src/radio-indicator.directive';
import { RdxRadioItemDirective } from '../src/radio-item.directive';
import { RdxRadioGroupDirective } from '../src/radio-root.directive';

export default {
    title: 'Primitives/Radio Group',
    decorators: [
        moduleMetadata({
            imports: [
                RdxLabelRootDirective,
                RdxRadioItemDirective,
                RdxRadioIndicatorDirective,
                RdxRadioGroupDirective
            ]
        }),
        componentWrapperDecorator(
            (story) =>
                `<div class="radix-themes light light-theme"
                      data-radius="medium"
                      data-scaling="100%">${story}</div>`
        )
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `
<form>
    <div RadioRoot [(rdxRadioGroupValue)]="value" class="RadioGroupRoot" aria-label="View density">
        <div style="display: flex; align-items: center;">
            <button RadioItem class="RadioGroupItem" value="default" id="r1">
                <div RadioIndicator class="RadioGroupIndicator"></div>
                <input RadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="default" class="Input">
            </button>
            <label LabelRoot htmlFor="r1" class="Label">
              Default
            </label>
        </div>
        <div style="display: flex; align-items: center;">
            <button RadioItem class="RadioGroupItem" value="comfortable" id="r2">
                 <div RadioIndicator class="RadioGroupIndicator"></div>
                 <input RadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="comfortable" class="Input">
            </button>
            <label LabelRoot htmlFor="r2" class="Label">
              Comfortable
            </label>
        </div>
        <div style="display: flex; align-items: center;">
            <button RadioItem class="RadioGroupItem" value="compact" id="r3">
                 <div RadioIndicator class="RadioGroupIndicator"></div>
                 <input RadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="compact" class="Input">
            </button>
            <label LabelRoot htmlFor="r3" class="Label">
              Compact
            </label>
        </div>
    </div>
</form>

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

.RadioGroupIndicator[data-state="unchecked"] {
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
    })
};
