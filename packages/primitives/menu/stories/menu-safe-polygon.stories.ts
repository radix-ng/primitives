import { Meta, StoryObj } from '@storybook/angular';

const html = String.raw;

/**
 * Standalone interactive explainer for the submenu safe-polygon traversal. The page is a
 * self-contained static asset (served from `public/`), embedded here via an iframe so its own
 * animation and ON/OFF toggle keep working. Opted out of the visual-regression sweep (`!visual`)
 * since it is an animated explainer, not a settled-state primitive demo.
 */
export default {
    title: 'Primitives/Menu/Safe Polygon',
    tags: ['!visual']
} as Meta;

type Story = StoryObj;

export const Explainer: Story = {
    name: 'Interactive explainer',
    render: () => ({
        template: html`
            <iframe
                class="block h-[1180px] w-full border-0"
                title="Submenu safe polygon — interactive explainer"
                src="/menu-safe-polygon-illustration.html"
            ></iframe>
        `
    })
};
