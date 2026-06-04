import { ReactiveFormsModule } from '@angular/forms';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { RdxFieldDescription, RdxFieldError, RdxFieldLabel, RdxFieldRoot } from '../../field';
import { RdxInputDirective } from '../../input';
import { demoInput } from '../../storybook/styles';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxFieldsetLegend } from '../src/fieldset-legend';
import { RdxFieldsetRoot } from '../src/fieldset-root';
import { FieldsetSignupFormExample } from './fieldset-signup-form';
import signupFormSource from './fieldset-signup-form?raw';

const source = (code: string) => ({ docs: { source: { code, language: 'typescript' } } });
const html = String.raw;

export default {
    title: 'Primitives/Fieldset',
    decorators: [
        moduleMetadata({
            imports: [
                ReactiveFormsModule,
                RdxFieldsetRoot,
                RdxFieldsetLegend,
                RdxFieldRoot,
                RdxFieldLabel,
                RdxFieldDescription,
                RdxFieldError,
                RdxInputDirective,
                FieldsetSignupFormExample
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

export const Default: Story = {
    render: () => ({
        props: { inputClass: demoInput },
        template: html`
            <fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot>
                <legend class="text-foreground px-1 text-sm font-semibold" rdxFieldsetLegend>Shipping address</legend>

                <div class="space-y-2" rdxFieldRoot required>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Street address</label>
                    <input [class]="inputClass" rdxInput autocomplete="shipping street-address" />
                    <p class="text-muted-foreground text-sm" rdxFieldDescription>Used to calculate delivery options.</p>
                    <p class="text-destructive text-sm" rdxFieldError>Street address is required.</p>
                </div>

                <div class="space-y-2" rdxFieldRoot>
                    <label class="text-foreground text-sm font-medium" rdxFieldLabel>Apartment</label>
                    <input [class]="inputClass" rdxInput autocomplete="shipping address-line2" />
                </div>
            </fieldset>
        `
    })
};

export const Disabled: Story = {
    render: () => ({
        props: { inputClass: demoInput },
        template: html`
            <fieldset class="border-border w-80 space-y-4 rounded-md border p-4" rdxFieldsetRoot disabled>
                <legend class="text-foreground px-1 text-sm font-semibold data-[disabled]:opacity-50" rdxFieldsetLegend>
                    Billing address
                </legend>

                <div class="space-y-2" rdxFieldRoot disabled>
                    <label class="text-foreground text-sm font-medium data-[disabled]:opacity-50" rdxFieldLabel>
                        Company
                    </label>
                    <input [class]="inputClass" rdxInput defaultValue="Acme Inc." />
                </div>
            </fieldset>
        `
    })
};

export const SignupForm: Story = {
    parameters: source(signupFormSource),
    render: () => ({
        template: html`
            <fieldset-signup-form-example />
        `
    })
};
