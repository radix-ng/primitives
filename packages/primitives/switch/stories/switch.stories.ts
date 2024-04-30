import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';

import { RdxLabelRootDirective } from '../../label';
import { RdxSwitchRootDirective } from '../src/switch-root.directive';
import { RdxSwitchThumbDirective } from '../src/switch-thumb.directive';

export default {
    title: 'Primitives/Switch',
    decorators: [
        moduleMetadata({
            imports: [RdxLabelRootDirective, RdxSwitchRootDirective, RdxSwitchThumbDirective]
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
<style>
button {
    all: unset;
}

.SwitchRoot {
    width: 42px;
    height: 25px;
    background-color: var(--black-a9);
    border-radius: 9999px;
    margin-left: 15px;
    position: relative;
    box-shadow: 0 2px 10px var(--black-a7);
    -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
}
.SwitchRoot:focus {
    box-shadow: 0 0 0 2px black;
}
.SwitchRoot[data-state='checked'] {
    background-color: black;
}

.SwitchThumb {
    display: block;
    width: 21px;
    height: 21px;
    background-color: white;
    border-radius: 9999px;
    box-shadow: 0 2px 2px var(--black-a7);
    transition: transform 100ms;
    transform: translateX(2px);
    will-change: transform;
}
.SwitchThumb[data-state='checked'] {
    transform: translateX(19px);
}

.Label {
    color: white;
    font-size: 15px;
    line-height: 1;
    display: flex;
    align-items: center;
}

</style>

<label LabelRoot htmlFor="airplane-mode" class="Label">
    Airplane mode
    <button SwitchRoot checked="checked" id="airplane-mode" class="SwitchRoot">
        <span SwitchThumb class="SwitchThumb"></span>
    </button>
</label>
`
    })
};
