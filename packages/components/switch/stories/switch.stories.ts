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
            <button rdxThemeSwitch defaultChecked></button>
        `
    })
};

export const Size: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; align-items: center; gap: 8px;">
                <button rdxThemeSwitch size="1" defaultChecked></button>
                <button rdxThemeSwitch size="2" defaultChecked></button>
                <button rdxThemeSwitch size="3" defaultChecked></button>
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

export const Color: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; align-items: center; gap: 8px;">
                <rdx-theme-switch color="indigo" defaultChecked />
                <rdx-theme-switch color="cyan" defaultChecked />
                <rdx-theme-switch color="orange" defaultChecked />
                <rdx-theme-switch color="crimson" defaultChecked />
            </div>
        `
    })
};

export const Radius: Story = {
    render: () => ({
        template: html`
            <div style="display: flex; align-items: center; gap: 8px;">
                <rdx-theme-switch radius="none" defaultChecked />
                <rdx-theme-switch radius="small" defaultChecked />
                <rdx-theme-switch radius="full" defaultChecked />
            </div>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <div class="rt-Flex rt-r-fd-column rt-r-gap-2">
                <label style="font-size: 1rem; align-items: center; display: flex; gap: 8px;">
                    <rdx-theme-switch class="rt-Flex" size="1" />
                    Off
                </label>
                <label style="font-size: 1rem; align-items: center; display: flex; gap: 8px;">
                    <rdx-theme-switch size="1" defaultChecked />
                    On
                </label>
                <label style="font-size: 1rem; align-items: center; display: flex; gap: 8px;">
                    <rdx-theme-switch size="1" disabled />
                    On
                </label>
                <label style="font-size: 1rem; align-items: center; display: flex; gap: 8px;">
                    <rdx-theme-switch size="1" disabled defaultChecked />
                    Off
                </label>
            </div>
        `
    })
};
