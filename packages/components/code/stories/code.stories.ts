import { CommonModule } from '@angular/common';
import { RdxThemeDirective } from '@radix-ng/components/theme';
import { componentWrapperDecorator, Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { RdxCodeComponent } from '../src/code.component';

const html = String.raw;

export default {
    title: 'Typography/Code',
    component: RdxCodeComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [RdxCodeComponent, CommonModule, RdxThemeDirective]
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
        <rdx-code>console.log()</rdx-code>
    `
});
export const Basic = TemplateBasic.bind({});

const TemplateSize: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code size="1">console.log()</rdx-code>
            <rdx-code size="2">console.log()</rdx-code>
            <rdx-code size="3">console.log()</rdx-code>
            <rdx-code size="4">console.log()</rdx-code>
            <rdx-code size="5">console.log()</rdx-code>
            <rdx-code size="6">console.log()</rdx-code>
            <rdx-code size="7">console.log()</rdx-code>
            <rdx-code size="8">console.log()</rdx-code>
            <rdx-code size="9">console.log()</rdx-code>
        </div>
    `
});
export const Size = TemplateSize.bind({});

const TemplateVariant: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code variant="solid">console.log()</rdx-code>
            <rdx-code variant="soft">console.log()</rdx-code>
            <rdx-code variant="outline">console.log()</rdx-code>
            <rdx-code variant="ghost">console.log()</rdx-code>
        </div>
    `
});
export const Variant = TemplateVariant.bind({});

const TemplateColor: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code color="indigo">console.log()</rdx-code>
            <rdx-code color="crimson">console.log()</rdx-code>
            <rdx-code color="cyan">console.log()</rdx-code>
            <rdx-code color="orange">console.log()</rdx-code>
        </div>
    `
});
export const Color = TemplateColor.bind({});

const TemplateWeight: StoryFn = (args) => ({
    props: args,
    template: html`
        <div class="rt-Flex rt-r-fd-column rt-r-ai-start rt-r-gap-2">
            <rdx-code weight="regular">console.log()</rdx-code>
            <rdx-code weight="bold">console.log()</rdx-code>
        </div>
    `
});
export const Weight = TemplateWeight.bind({});
