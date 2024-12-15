import { componentWrapperDecorator, Meta, moduleMetadata, StoryFn } from '@storybook/angular';
import { RdxThemeDirective } from '../../theme';
import { RdxThemeAvatarComponent } from '../src/avatar';

const html = String.raw;

export default {
    title: 'Components/Avatar',
    component: RdxThemeAvatarComponent,
    tags: ['autodocs'],
    decorators: [
        moduleMetadata({
            imports: [RdxThemeDirective]
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
        <div style="display: flex; align-items: center; gap: 1rem;">
            <rdx-theme-avatar
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar fallback="A" />
        </div>
    `
});
export const Basic = TemplateBasic.bind({});

const TemplateSize: StoryFn = (args) => ({
    props: args,
    template: html`
        <div style="display: flex; align-items: center; gap: 1rem;">
            <rdx-theme-avatar
                size="1"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="2"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="3"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="4"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="5"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="6"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="7"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
            <rdx-theme-avatar
                size="8"
                src="https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?&w=256&h=256&q=70&crop=focalpoint&fp-x=0.5&fp-y=0.3&fp-z=1&fit=crop"
                fallback="A"
            />
        </div>
    `
});
export const Size = TemplateSize.bind({});

const TemplateVariant: StoryFn = (args) => ({
    props: args,
    template: html`
        <div style="display: flex; gap: 1rem;">
            <rdx-theme-avatar variant="solid" fallback="A" />
            <rdx-theme-avatar variant="soft" fallback="A" />
        </div>
    `
});
export const Variant = TemplateVariant.bind({});

const TemplateColor: StoryFn = (args) => ({
    props: args,
    template: html`
        <div style="display: flex; gap: 1rem;">
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" />
        </div>
    `
});
export const Color = TemplateColor.bind({});

const TemplateRadius: StoryFn = (args) => ({
    props: args,
    template: html`
        <div style="display: flex; gap: 1rem;">
            <rdx-theme-avatar radius="none" fallback="A" />
            <rdx-theme-avatar radius="large" fallback="A" />
            <rdx-theme-avatar radius="full" fallback="A" />
        </div>
    `
});
export const Radius = TemplateRadius.bind({});

const TemplateHighContrast: StoryFn = (args) => ({
    props: args,
    template: html`
        <div style="display: inline-grid; grid-template-rows: repeat(2, 1fr); gap: 8px; grid-auto-flow: column;">
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" />
            <rdx-theme-avatar variant="solid" color="indigo" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" />
            <rdx-theme-avatar variant="solid" color="cyan" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" />
            <rdx-theme-avatar variant="solid" color="orange" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" />
            <rdx-theme-avatar variant="solid" color="crimson" fallback="A" highContrast />
            <rdx-theme-avatar variant="solid" color="gray" fallback="A" />
            <rdx-theme-avatar variant="solid" color="gray" fallback="A" highContrast />
        </div>
    `
});
export const HighContrast = TemplateHighContrast.bind({});
