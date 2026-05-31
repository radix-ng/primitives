import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { LucideAngularModule } from 'lucide-angular';
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
                LucideAngularModule
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
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                aria-label="Toggle italic"
                type="button"
            >
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
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
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
                rdxToggle
                [disabled]="config.disabled"
                [pressed]="config.pressed"
                aria-label="Toggle italic"
                type="button"
            >
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
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
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
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
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
            </button>

            <h1>Controlled</h1>
            <span class="">default on</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
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
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
            </button>

            <span class="">default off</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
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
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
            </button>

            <h1>Events</h1>
            <span class="">default off</span>
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
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
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
            </button>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        template: html`
            <button
                class="border-border bg-background text-foreground hover:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-9 w-9 items-center justify-center rounded-md border shadow-sm outline-none transition-[color,box-shadow] focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50"
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
                <lucide-angular class="flex" name="italic" size="12"></lucide-angular>
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
