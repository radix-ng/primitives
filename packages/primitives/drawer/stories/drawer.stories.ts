import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxDrawerActionSheetComponent } from './drawer-action-sheet';
import actionSheetSource from './drawer-action-sheet?raw';
import { RdxDrawerControlledComponent } from './drawer-controlled';
import controlledSource from './drawer-controlled?raw';
import { RdxDrawerDefaultComponent } from './drawer-default';
import defaultSource from './drawer-default?raw';
import { RdxDrawerDetachedComponent } from './drawer-detached';
import detachedSource from './drawer-detached?raw';
import { RdxDrawerNestedComponent } from './drawer-nested';
import nestedSource from './drawer-nested?raw';
import { RdxDrawerNonModalComponent } from './drawer-non-modal';
import nonModalSource from './drawer-non-modal?raw';
import { RdxDrawerPageScaleComponent } from './drawer-page-scale';
import pageScaleSource from './drawer-page-scale?raw';
import { RdxDrawerScrollableComponent } from './drawer-scrollable';
import scrollableSource from './drawer-scrollable?raw';
import { RdxDrawerSidesComponent } from './drawer-sides';
import sidesSource from './drawer-sides?raw';
import { RdxDrawerSnapPointsComponent } from './drawer-snap-points';
import snapPointsSource from './drawer-snap-points?raw';
import { RdxDrawerSwipeToOpenComponent } from './drawer-swipe-to-open';
import swipeToOpenSource from './drawer-swipe-to-open?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: {
            code,
            language: 'typescript'
        }
    }
});

export default {
    title: 'Primitives/Drawer',
    decorators: [
        moduleMetadata({
            imports: [
                RdxDrawerDefaultComponent,
                RdxDrawerControlledComponent,
                RdxDrawerSidesComponent,
                RdxDrawerSnapPointsComponent,
                RdxDrawerSwipeToOpenComponent,
                RdxDrawerScrollableComponent,
                RdxDrawerNonModalComponent,
                RdxDrawerActionSheetComponent,
                RdxDrawerNestedComponent,
                RdxDrawerPageScaleComponent,
                RdxDrawerDetachedComponent
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    parameters: source(defaultSource),
    render: () => ({
        template: html`
            <rdx-drawer-default />
        `
    })
};

export const Controlled: Story = {
    name: 'State',
    parameters: source(controlledSource),
    render: () => ({
        template: html`
            <rdx-drawer-controlled />
        `
    })
};

export const Sides: Story = {
    name: 'Position',
    parameters: source(sidesSource),
    render: () => ({
        template: html`
            <rdx-drawer-sides />
        `
    })
};

export const SnapPoints: Story = {
    name: 'Snap points',
    parameters: source(snapPointsSource),
    render: () => ({
        template: html`
            <rdx-drawer-snap-points />
        `
    })
};

export const SwipeToOpen: Story = {
    name: 'Swipe to open',
    parameters: source(swipeToOpenSource),
    render: () => ({
        template: html`
            <rdx-drawer-swipe-to-open />
        `
    })
};

export const Scrollable: Story = {
    name: 'Mobile navigation',
    parameters: source(scrollableSource),
    render: () => ({
        template: html`
            <rdx-drawer-scrollable />
        `
    })
};

export const NonModal: Story = {
    name: 'Non-modal',
    parameters: source(nonModalSource),
    render: () => ({
        template: html`
            <rdx-drawer-non-modal />
        `
    })
};

export const ActionSheet: Story = {
    name: 'Action sheet with separate destructive action',
    parameters: source(actionSheetSource),
    render: () => ({
        template: html`
            <rdx-drawer-action-sheet />
        `
    })
};

export const Nested: Story = {
    name: 'Nested drawers',
    parameters: source(nestedSource),
    render: () => ({
        template: html`
            <rdx-drawer-nested />
        `
    })
};

export const PageScale: Story = {
    name: 'Indent effect',
    parameters: source(pageScaleSource),
    render: () => ({
        template: html`
            <rdx-drawer-page-scale class="block w-full" />
        `
    })
};

export const Detached: Story = {
    name: 'Detached triggers',
    parameters: source(detachedSource),
    render: () => ({
        template: html`
            <rdx-drawer-detached />
        `
    })
};
