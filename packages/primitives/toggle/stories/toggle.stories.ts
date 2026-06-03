import { LucideItalic } from '@lucide/angular';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxToggleVisuallyHiddenInputDirective } from '../src/toggle-visually-hidden-input.directive';
import { RdxToggleDirective } from '../src/toggle.directive';
import { ToggleButtonReactiveForms } from './toggle-forms.component';

const html = String.raw;

export default {
    title: 'Primitives/Toggle',
    decorators: [
        moduleMetadata({
            imports: [
                RdxToggleDirective,
                RdxToggleVisuallyHiddenInputDirective,
                ToggleButtonReactiveForms,
                LucideItalic
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        template: html`
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                aria-label="Toggle italic"
                type="button"
            >
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const State: Story = {
    argTypes: {
        pressed: {
            control: 'boolean'
        },
        disabled: {
            control: 'boolean'
        }
    },
    render: (args) => ({
        props: {
            config: args
        },
        template: html`
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [disabled]="config.disabled"
                [pressed]="config.pressed"
                aria-label="Toggle italic"
                type="button"
            >
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const Controlled: Story = {
    render: (args) => ({
        props: {
            config: args
        },
        template: html`
            <h1>Uncontrolled</h1>
            <span class="">default off</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [pressed]="false"
                aria-label="Toggle bold"
                #toggle="rdxToggle"
                type="button"
            >
                <input
                    rdxToggleVisuallyHiddenInput
                    [name]="'toggleDef'"
                    [value]="toggle.pressed()"
                    [required]="false"
                />
                <svg class="flex" lucideItalic size="12"></svg>
            </button>

            <h1>Controlled</h1>
            <span class="">default on</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [defaultPressed]="true"
                [pressed]="true"
                aria-label="Toggle bold"
                #toggle="rdxToggle"
                type="button"
            >
                <input
                    rdxToggleVisuallyHiddenInput
                    [name]="'toggleDef'"
                    [value]="toggle.pressed()"
                    [required]="false"
                />
                <svg class="flex" lucideItalic size="12"></svg>
            </button>

            <span class="">default off</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [defaultPressed]="false"
                [pressed]="false"
                aria-label="Toggle bold"
                #toggle="rdxToggle"
                type="button"
            >
                <input
                    rdxToggleVisuallyHiddenInput
                    [name]="'toggleDef'"
                    [value]="toggle.pressed()"
                    [required]="false"
                />
                <svg class="flex" lucideItalic size="12"></svg>
            </button>

            <h1>Events</h1>
            <span class="">default off</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [pressed]="false"
                aria-label="Toggle bold"
                #toggle="rdxToggle"
                type="button"
            >
                <input
                    rdxToggleVisuallyHiddenInput
                    [name]="'toggleDef'"
                    [value]="toggle.pressed()"
                    [required]="false"
                />
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm transition-[color,box-shadow] outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                disabled
                rdxToggle
                #toggle="rdxToggle"
                aria-label="Toggle disabled"
                type="button"
            >
                <input
                    rdxToggleVisuallyHiddenInput
                    [name]="'toggleDef'"
                    [value]="toggle.pressed()"
                    [required]="false"
                    [disabled]="toggle.disabled()"
                />
                <svg class="flex" lucideItalic size="12"></svg>
            </button>
        `
    })
};

export const ReactiveForm: Story = {
    render: () => ({
        template: html`
            <toggle-reactive-forms></toggle-reactive-forms>
        `
    })
};
