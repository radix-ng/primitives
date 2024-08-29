import { CommonModule } from '@angular/common';
import { RdxThemeDirective } from '@radix-ng/components/theme';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { RdxKbqComponent } from '../src/kbq.component';

const html = String.raw;

export default {
    title: 'Typography/Kbq',
    component: RdxKbqComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [RdxKbqComponent, CommonModule, RdxThemeDirective]
        }),
        componentWrapperDecorator(
            (story) => `
                <div rdxAppTheme
                    data-accent-color="indigo"
                    data-radius="medium"
                    data-scaling="100%"
                >
                    ${story}
                </div>`
        )
    ],
    argTypes: {}
} as Meta;

const TemplateBasic: StoryFn = (args) => ({
    props: args,
    template: html`
        <rdx-kbq>Shift + Tab</rdx-kbq>
    `
});
export const Basic = TemplateBasic.bind({});

const TemplateSize: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-kbq size="1">Shift + Tab</rdx-kbq>
            <rdx-kbq size="2">Shift + Tab</rdx-kbq>
            <rdx-kbq size="3">Shift + Tab</rdx-kbq>
            <rdx-kbq size="4">Shift + Tab</rdx-kbq>
            <rdx-kbq size="5">Shift + Tab</rdx-kbq>
            <rdx-kbq size="6">Shift + Tab</rdx-kbq>
            <rdx-kbq size="7">Shift + Tab</rdx-kbq>
            <rdx-kbq size="8">Shift + Tab</rdx-kbq>
            <rdx-kbq size="9">Shift + Tab</rdx-kbq>
        </div>
    `
});
export const Size = TemplateSize.bind({});
