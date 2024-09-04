import { CommonModule } from '@angular/common';
import { RdxThemeDirective } from '@radix-ng/components/theme';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { RdxKbdComponent } from '../src/kbd.component';

const html = String.raw;

export default {
    title: 'Typography/Kbd',
    component: RdxKbdComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [RdxKbdComponent, CommonModule, RdxThemeDirective]
        }),
        componentWrapperDecorator(
            (story) => `
                <div rdxTheme
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
        <rdx-kbd>Shift + Tab</rdx-kbd>
    `
});
export const Basic = TemplateBasic.bind({});

const TemplateSize: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-kbd size="1">Shift + Tab</rdx-kbd>
            <rdx-kbd size="2">Shift + Tab</rdx-kbd>
            <rdx-kbd size="3">Shift + Tab</rdx-kbd>
            <rdx-kbd size="4">Shift + Tab</rdx-kbd>
            <rdx-kbd size="5">Shift + Tab</rdx-kbd>
            <rdx-kbd size="6">Shift + Tab</rdx-kbd>
            <rdx-kbd size="7">Shift + Tab</rdx-kbd>
            <rdx-kbd size="8">Shift + Tab</rdx-kbd>
            <rdx-kbd size="9">Shift + Tab</rdx-kbd>
        </div>
    `
});
export const Size = TemplateSize.bind({});
