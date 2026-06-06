import {
    RdxTabsIndicator,
    RdxTabsList,
    RdxTabsPanel,
    RdxTabsPanelPresence,
    RdxTabsRoot,
    RdxTabsTab
} from '@radix-ng/primitives/tabs';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { TabsAnimatedExample } from './tabs-animated';
import animatedSource from './tabs-animated?raw';
import { TabsIndicatorExample } from './tabs-indicator';
import indicatorSource from './tabs-indicator?raw';
import { TabsKeyframesExample } from './tabs-keyframes';
import keyframesSource from './tabs-keyframes?raw';

const html = String.raw;

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });

const rootClass = 'border-border bg-background text-foreground w-[420px] overflow-hidden rounded-xl border shadow-sm';
const listClass = 'border-border bg-muted/30 flex border-b';
const tabClass =
    'text-muted-foreground hover:text-foreground data-[active]:text-foreground data-[active]:bg-background focus-visible:ring-ring relative inline-flex h-10 items-center justify-center px-4 text-sm font-medium transition-colors outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50 data-[active]:shadow-[inset_0_-2px_0_0_var(--primary)]';
const panelClass = 'bg-background text-foreground p-6 text-sm leading-6 outline-none';

export default {
    title: 'Primitives/Tabs',
    decorators: [
        moduleMetadata({
            imports: [
                RdxTabsRoot,
                RdxTabsList,
                RdxTabsTab,
                RdxTabsPanel,
                RdxTabsPanelPresence,
                RdxTabsIndicator,
                TabsIndicatorExample,
                TabsAnimatedExample,
                TabsKeyframesExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <div class="${rootClass}" rdxTabsRoot defaultValue="account">
                <div class="${listClass}" rdxTabsList>
                    <button class="${tabClass}" rdxTabsTab value="account">Account</button>
                    <button class="${tabClass}" rdxTabsTab value="password">Password</button>
                </div>
                <div class="${panelClass}" rdxTabsPanel value="account">
                    Make changes to your account here. Click save when you're done.
                </div>
                <div class="${panelClass}" rdxTabsPanel value="password">
                    Change your password here. After saving, you'll be logged out.
                </div>
            </div>
        `
    })
};

export const ActivateOnFocus: Story = {
    render: () => ({
        template: html`
            <div class="${rootClass}" rdxTabsRoot defaultValue="account">
                <div class="${listClass}" rdxTabsList activateOnFocus>
                    <button class="${tabClass}" rdxTabsTab value="account">Account</button>
                    <button class="${tabClass}" rdxTabsTab value="password">Password</button>
                    <button class="${tabClass}" rdxTabsTab value="team">Team</button>
                </div>
                <div class="${panelClass}" rdxTabsPanel value="account">
                    Tabs activate as soon as they receive keyboard focus.
                </div>
                <div class="${panelClass}" rdxTabsPanel value="password">
                    Change your password here. After saving, you'll be logged out.
                </div>
                <div class="${panelClass}" rdxTabsPanel value="team">Invite teammates and manage their roles.</div>
            </div>
        `
    })
};

export const Vertical: Story = {
    render: () => ({
        template: html`
            <div class="${rootClass} flex w-[520px]" rdxTabsRoot defaultValue="account" orientation="vertical">
                <div class="border-border bg-muted/30 flex w-40 shrink-0 flex-col border-r" rdxTabsList>
                    <button class="${tabClass} justify-start" rdxTabsTab value="account">Account</button>
                    <button class="${tabClass} justify-start" rdxTabsTab value="password">Password</button>
                    <button class="${tabClass} justify-start" rdxTabsTab value="team">Team</button>
                </div>
                <div class="${panelClass} flex-1" rdxTabsPanel value="account">
                    Make changes to your account here. Click save when you're done.
                </div>
                <div class="${panelClass} flex-1" rdxTabsPanel value="password">
                    Change your password here. After saving, you'll be logged out.
                </div>
                <div class="${panelClass} flex-1" rdxTabsPanel value="team">
                    Invite teammates and manage their roles.
                </div>
            </div>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <div class="${rootClass}" rdxTabsRoot defaultValue="account">
                <div class="${listClass}" rdxTabsList>
                    <button class="${tabClass}" rdxTabsTab value="account">Account</button>
                    <button class="${tabClass}" rdxTabsTab value="password" disabled>Password</button>
                    <button class="${tabClass}" rdxTabsTab value="team">Team</button>
                </div>
                <div class="${panelClass}" rdxTabsPanel value="account">
                    The Password tab is disabled and cannot be focused or activated.
                </div>
                <div class="${panelClass}" rdxTabsPanel value="password">
                    Change your password here. After saving, you'll be logged out.
                </div>
                <div class="${panelClass}" rdxTabsPanel value="team">Invite teammates and manage their roles.</div>
            </div>
        `
    })
};

export const Indicator: Story = {
    parameters: source(indicatorSource),
    render: () => ({
        template: html`
            <tabs-indicator-example />
        `
    })
};

export const Animated: Story = {
    parameters: source(animatedSource),
    render: () => ({
        template: html`
            <tabs-animated-example />
        `
    })
};

export const KeyframeUnmount: Story = {
    parameters: source(keyframesSource),
    render: () => ({
        template: html`
            <tabs-keyframes-example />
        `
    })
};
