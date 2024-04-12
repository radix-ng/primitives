import { LabelDirective } from '../../label';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { CommonModule } from '@angular/common';
import { SeparatorDirective } from '../src/separator.directive';

export default {
    component: SeparatorDirective,
    title: 'Primitives/Separator',
    decorators: [
        moduleMetadata({
            imports: [SeparatorDirective, CommonModule]
        })
    ]
} as Meta<LabelDirective>;

type Story = StoryObj<LabelDirective>;

export const Default: Story = {
    parameters: {
        backgrounds: {
            default: 'black',
            values: [
                {
                    name: 'black',
                    value: 'linear-gradient(330deg,color(display-p3 0.523 0.318 0.751) 0,color(display-p3 0.276 0.384 0.837) 100%)'
                }
            ]
        }
    },
    render: () => ({
        template: `
<style>

.SeparatorRoot {
  background-color: white;
}
.SeparatorRoot[data-orientation='horizontal'] {
  height: 1px;
  width: 100%;
}
.SeparatorRoot[data-orientation='vertical'] {
  height: 100%;
  width: 1px;
}

.Text {
  color: white;
  font-size: 15px;
  line-height: 20px;
}

</style>
<div style="width: 100%; max-width: 300px; margin: 0 15px;">
    <div class="Text">
      Radix Primitives
    </div>
    <div class="Text" style="font-weight: 500;">
      An open-source UI component library.
    </div>
    <div rdxSeparator
        class="SeparatorRoot"
        style="margin: 15px 0;"
    ></div>
    <div style="display: flex; height: 1.25rem; align-items: center;">
      <div class="Text">
        Blog
      </div>
      <div rdxSeparator
        class="SeparatorRoot"
        rdxSeparatorDecorative="decorative"
        rdxSeparatorOrientation="vertical"
        style="margin: 0 15px;"
      ></div>
      <div class="Text">
        Docs
      </div>
      <div rdxSeparator
        class="SeparatorRoot"
        rdxSeparatorDecorative="decorative"
        rdxSeparatorOrientation="vertical"
        style="margin: 0 15px;"
      ></div>
      <div class="Text">
        Source
      </div>
    </div>
  </div>

`
    })
};
