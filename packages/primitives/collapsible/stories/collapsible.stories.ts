import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxCollapsibleAnimationComponent } from './collapsible-animation.component';
import animationSource from './collapsible-animation.component?raw';
import { CollapsibleDefaultExample } from './collapsible-default';
import defaultSource from './collapsible-default?raw';
import { RdxCollapsibleExternalTriggeringComponent } from './collapsible-external-triggering.component';
import externalSource from './collapsible-external-triggering.component?raw';
import { CollapsibleKeepMountedExample } from './collapsible-keep-mounted';
import keepMountedSource from './collapsible-keep-mounted?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code: code.trim(), language: 'typescript', type: 'code' } } });

export default {
    title: 'Primitives/Collapsible',
    decorators: [
        moduleMetadata({
            imports: [
                CollapsibleKeepMountedExample,
                CollapsibleDefaultExample,
                RdxCollapsibleExternalTriggeringComponent,
                RdxCollapsibleAnimationComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({ template: '<collapsible-default-example />' })
};

export const ExternalTrigger: Story = {
    parameters: source(externalSource),
    render: () => ({
        template: html`
            <rdx-collapsible-external-triggering></rdx-collapsible-external-triggering>
        `
    })
};

export const Animation: Story = {
    parameters: source(animationSource),
    render: () => ({
        template: html`
            <rdx-collapsible-animation></rdx-collapsible-animation>
        `
    })
};

/**
 * With `keepMounted`, the closed panel stays in the DOM with the `hidden` attribute after the
 * close transition. During transitions, the data attributes drive a Tailwind grid-rows animation.
 */
export const KeepMounted: Story = {
    parameters: source(keepMountedSource),
    render: () => ({ template: '<collapsible-keep-mounted-example />' })
};
