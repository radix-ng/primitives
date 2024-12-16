import { componentWrapperDecorator, Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxThemeDirective } from '../../theme';
import { RdxThemeSwitchComponent } from '../src/switch';

const html = String.raw;

export default {
    title: 'Components/Switch',
    component: RdxThemeSwitchComponent,
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

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <rdx-theme-switch defaultChecked />
        `
    })
};

export const Size: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; align-items: center; gap: 8px;">
                <rdx-theme-switch size="1" defaultChecked />
                <rdx-theme-switch size="2" defaultChecked />
                <rdx-theme-switch size="3" defaultChecked />
            </div>
        `
    })
};

export const Variant: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; gap: 8px;">
                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <rdx-theme-switch variant="surface" />
                    <rdx-theme-switch variant="classic" />
                    <rdx-theme-switch variant="soft" />
                </div>

                <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                    <rdx-theme-switch variant="surface" defaultChecked />
                    <rdx-theme-switch variant="classic" defaultChecked />
                    <rdx-theme-switch variant="soft" defaultChecked />
                </div>
            </div>
        `
    })
};
