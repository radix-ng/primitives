import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { LabelDirective } from '../../label';
import { RadioItemDirective } from '../src/radio-item.directive';
import { RadioIndicatorDirective } from '../src/radio-indicator.directive';
import { RadioGroupDirective } from '../src/radio-group.directive';

export default {
    title: 'Primitives/Radio',
    decorators: [
        moduleMetadata({
            imports: [
                LabelDirective,
                RadioItemDirective,
                RadioIndicatorDirective,
                RadioGroupDirective
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
    <div rdxRadioGroup [(rdxRadioGroupValue)]="value" class="RadioGroupRoot" aria-label="View density">
        <div style="display: flex; align-items: center;">
            <button rdxRadioItem class="RadioGroupItem" value="default" id="r1">
                <div rdxRadioIndicator class="RadioGroupIndicator"></div>
                <input rdxRadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="default" class="Input">
            </button>
            <label rdxLabel htmlFor="r1" class="Label">
              Default
            </label>
        </div>
        <div style="display: flex; align-items: center;">
            <button rdxRadioItem class="RadioGroupItem" value="comfortable" id="r2">
                 <div rdxRadioIndicator class="RadioGroupIndicator"></div>
                 <input rdxRadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="comfortable" class="Input">
            </button>
            <label rdxLabel htmlFor="r2" class="Label">
              Comfortable
            </label>
        </div>
        <div style="display: flex; align-items: center;">
            <button rdxRadioItem class="RadioGroupItem" value="compact" id="r3">
                 <div rdxRadioIndicator class="RadioGroupIndicator"></div>
                 <input rdxRadioIndicator type="radio" aria-hidden="true" tabindex="-1" value="compact" class="Input">
            </button>
            <label rdxLabel htmlFor="r3" class="Label">
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
