import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { MenuCheckboxItemsStory } from './components/menu-checkbox-items';
import { MenuRadioItemsStory } from './components/menu-radio-items';
import { MenuWithLabelsItemsStory } from './components/menu-with-labels-items';
import { RdxMenuAnimatedComponent } from './menu-animated';
import animatedSource from './menu-animated?raw';
import { RdxMenuArrowExampleComponent } from './menu-arrow';
import arrowSource from './menu-arrow?raw';
import { RdxMenuAsyncComponent } from './menu-async';
import asyncSource from './menu-async?raw';
import { RdxMenuBackdropExampleComponent } from './menu-backdrop';
import backdropSource from './menu-backdrop?raw';
import { RdxMenuDefaultComponent } from './menu-default';
import defaultSource from './menu-default?raw';
import { RdxMenuEventsComponent } from './menu-events';
import eventsSource from './menu-events?raw';
import { RdxMenuFocusReturnComponent } from './menu-focus-return';
import focusReturnSource from './menu-focus-return?raw';
import { RdxMenuInitialFocusComponent } from './menu-initial-focus';
import initialFocusSource from './menu-initial-focus?raw';
import { RdxMenuKeepMountedComponent } from './menu-keep-mounted';
import keepMountedSource from './menu-keep-mounted?raw';
import { RdxMenuLifecycleComponent } from './menu-lifecycle';
import lifecycleSource from './menu-lifecycle?raw';
import { RdxMenuNativeElementsComponent } from './menu-native-elements';
import nativeElementsSource from './menu-native-elements?raw';
import { RdxMenuNestedComponent } from './menu-nested';
import { RdxMenuNestedRtlComponent } from './menu-nested-rtl';
import nestedRtlSource from './menu-nested-rtl?raw';
import nestedSource from './menu-nested?raw';
import { RdxMenuPointerComponent } from './menu-pointer';
import pointerSource from './menu-pointer?raw';
import { RdxMenuViewportExampleComponent } from './menu-viewport';
import viewportSource from './menu-viewport?raw';

const html = String.raw;

const source = (code: string) => ({
    docs: {
        source: { code, language: 'typescript' }
    }
});

export default {
    title: 'Primitives/Menu',
    decorators: [
        moduleMetadata({
            imports: [
                RdxMenuDefaultComponent,
                RdxMenuInitialFocusComponent,
                RdxMenuFocusReturnComponent,
                RdxMenuNativeElementsComponent,
                RdxMenuNestedComponent,
                RdxMenuNestedRtlComponent,
                RdxMenuArrowExampleComponent,
                RdxMenuBackdropExampleComponent,
                RdxMenuAnimatedComponent,
                RdxMenuKeepMountedComponent,
                RdxMenuViewportExampleComponent,
                RdxMenuAsyncComponent,
                MenuRadioItemsStory,
                MenuCheckboxItemsStory,
                MenuWithLabelsItemsStory
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
            <rdx-menu-default />
        `
    })
};

export const NativeElements: Story = {
    parameters: source(nativeElementsSource),
    render: () => ({
        template: html`
            <rdx-menu-native-elements />
        `
    })
};

export const InitialFocus: Story = {
    parameters: source(initialFocusSource),
    render: () => ({
        template: html`
            <rdx-menu-initial-focus />
        `
    })
};

export const FocusReturn: Story = {
    parameters: source(focusReturnSource),
    render: () => ({
        template: html`
            <rdx-menu-focus-return />
        `
    })
};

export const RadioItem: Story = {
    render: () => ({
        template: html`
            <menu-radio-items-story />
        `
    })
};

export const CheckboxItem: Story = {
    render: () => ({
        template: html`
            <menu-checkbox-items-story />
        `
    })
};

export const WithLabels: Story = {
    render: () => ({
        template: html`
            <menu-with-labels-items-story />
        `
    })
};

export const Nested: Story = {
    parameters: source(nestedSource),
    render: () => ({
        template: html`
            <rdx-menu-nested />
        `
    })
};

export const AsyncItems: Story = {
    parameters: source(asyncSource),
    render: () => ({
        template: html`
            <rdx-menu-async />
        `
    })
};

export const AsyncSubmenu: Story = {
    parameters: source(asyncSource),
    render: () => ({
        template: html`
            <rdx-menu-async [nested]="true" />
        `
    })
};

export const NestedRtl: Story = {
    parameters: source(nestedRtlSource),
    render: () => ({
        template: html`
            <rdx-menu-nested-rtl />
        `
    })
};

export const Arrow: Story = {
    parameters: source(arrowSource),
    render: () => ({
        template: html`
            <rdx-menu-arrow />
        `
    })
};

export const Backdrop: Story = {
    parameters: source(backdropSource),
    render: () => ({
        template: html`
            <rdx-menu-backdrop />
        `
    })
};

export const Animated: Story = {
    parameters: source(animatedSource),
    render: () => ({
        template: html`
            <rdx-menu-animated />
        `
    })
};

export const Viewport: Story = {
    parameters: source(viewportSource),
    render: () => ({
        template: html`
            <rdx-menu-viewport />
        `
    })
};

export const KeepMounted: Story = {
    parameters: source(keepMountedSource),
    render: () => ({
        template: html`
            <rdx-menu-keep-mounted />
        `
    })
};

export const Events: Story = {
    decorators: [moduleMetadata({ imports: [RdxMenuEventsComponent] })],
    parameters: source(eventsSource),
    render: () => ({
        template: html`
            <rdx-menu-events />
        `
    })
};

export const Lifecycle: Story = {
    decorators: [moduleMetadata({ imports: [RdxMenuLifecycleComponent] })],
    parameters: source(lifecycleSource),
    render: () => ({
        template: html`
            <rdx-menu-lifecycle />
        `
    })
};

export const Pointer: Story = {
    decorators: [moduleMetadata({ imports: [RdxMenuPointerComponent] })],
    parameters: source(pointerSource),
    render: () => ({ template: '<rdx-menu-pointer />' })
};
