import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { PresenceExample } from './presence';
import { PresenceWaapiSpinner } from './presence-waapi-spinner';
import spinnerSource from './presence-waapi-spinner?raw';
import { PresenceWaapiSubtree } from './presence-waapi-subtree';
import subtreeSource from './presence-waapi-subtree?raw';
import { PresenceWaapiTransition } from './presence-waapi-transition';
import transitionSource from './presence-waapi-transition?raw';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

export default {
    title: 'Utilities/Presence',
    decorators: [
        moduleMetadata({
            imports: [PresenceExample, PresenceWaapiTransition, PresenceWaapiSubtree, PresenceWaapiSpinner]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: `<presence-example />`
    })
};

/**
 * ADR 0011 behavior fixtures — exercised by
 * `apps/visual-regression/tests/presence-waapi.behavior.spec.ts` in a real browser (jsdom runs no
 * CSS). Tagged `!visual` so they are skipped by the per-story screenshot sweep; their value is the
 * interaction, not a static frame.
 */

export const WaapiTransitionExit: Story = {
    tags: ['!visual'],
    parameters: source(transitionSource),
    render: () => ({
        template: `<presence-waapi-transition />`
    })
};

export const WaapiSubtreeKeyframeExit: Story = {
    tags: ['!visual'],
    parameters: source(subtreeSource),
    render: () => ({
        template: `<presence-waapi-subtree />`
    })
};

export const WaapiInfiniteSpinnerNoDelay: Story = {
    tags: ['!visual'],
    parameters: source(spinnerSource),
    render: () => ({
        template: `<presence-waapi-spinner />`
    })
};
