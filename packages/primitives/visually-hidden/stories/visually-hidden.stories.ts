import { Component, signal } from '@angular/core';
import { Meta, moduleMetadata, StoryObj } from '@storybook/angular';
import { tailwindDemoDecorator } from '../../storybook/tailwind-demo';
import { RdxVisuallyHiddenInputBubbleDirective } from '../src/visually-hidden-input-bubble.directive';
import { RdxVisuallyHiddenInputDirective } from '../src/visually-hidden-input.directive';
import { RdxVisuallyHiddenDirective, VisuallyHidden } from '../src/visually-hidden.directive';

const html = String.raw;

/**
 * Interactive demo for the `feature` modes. Reads the live host attributes off the
 * element so you can see how `focusable` keeps the field accessible while
 * `fully-hidden` removes it from the tab order and the accessibility tree.
 */
@Component({
    selector: 'visually-hidden-feature-demo',
    imports: [RdxVisuallyHiddenDirective],
    template: html`
        <div class="flex flex-col items-center gap-4">
            <div class="flex gap-2">
                <button
                    class="border-border hover:bg-muted inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium outline-none"
                    [class.bg-primary]="feature() === 'focusable'"
                    [class.text-primary-foreground]="feature() === 'focusable'"
                    [class.bg-background]="feature() !== 'focusable'"
                    (click)="feature.set('focusable')"
                >
                    focusable
                </button>
                <button
                    class="border-border hover:bg-muted inline-flex h-9 items-center justify-center rounded-md border px-3 text-sm font-medium outline-none"
                    [class.bg-primary]="feature() === 'fully-hidden'"
                    [class.text-primary-foreground]="feature() === 'fully-hidden'"
                    [class.bg-background]="feature() !== 'fully-hidden'"
                    (click)="feature.set('fully-hidden')"
                >
                    fully-hidden
                </button>
            </div>

            <input
                class="border-border bg-background text-foreground h-9 w-52 rounded-md border px-2.5 text-sm"
                #el
                [feature]="feature()"
                rdxVisuallyHidden
                value="I am visually hidden"
            />

            <p class="text-muted-foreground text-sm">
                <code class="text-foreground">feature="{{ feature() }}"</code>
                → aria-hidden:
                <b class="text-foreground">{{ el.getAttribute('aria-hidden') ?? '—' }}</b>
                , tabindex:
                <b class="text-foreground">{{ el.getAttribute('tabindex') ?? '—' }}</b>
                , hidden:
                <b class="text-foreground">{{ el.hidden }}</b>
            </p>
        </div>
    `
})
class VisuallyHiddenFeatureDemo {
    readonly feature = signal<VisuallyHidden>('focusable');
}

export default {
    title: 'Utilities/Visually Hidden',
    decorators: [
        moduleMetadata({
            imports: [
                RdxVisuallyHiddenDirective,
                RdxVisuallyHiddenInputBubbleDirective,
                RdxVisuallyHiddenInputDirective,
                VisuallyHiddenFeatureDemo
            ]
        }),
        tailwindDemoDecorator()
    ]
} as Meta;

type Story = StoryObj;

/**
 * The most common use: give an icon-only control an accessible name. The label is
 * invisible on screen but announced by assistive technology.
 */
export const AccessibleName: Story = {
    render: () => ({
        template: html`
            <button
                class="border-border bg-background text-foreground hover:bg-muted focus-visible:ring-ring inline-flex size-10 items-center justify-center rounded-md border outline-none focus-visible:ring-2"
            >
                <svg
                    class="size-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    aria-hidden="true"
                >
                    <path
                        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 1 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"
                    />
                </svg>
                <span rdxVisuallyHidden>Add to favorites</span>
            </button>
        `
    })
};

/**
 * Toggle between the two `feature` modes and watch the host attributes update live.
 */
export const FeatureModes: Story = {
    name: 'Feature modes',
    render: () => ({
        template: html`
            <visually-hidden-feature-demo />
        `
    })
};

/**
 * `rdxVisuallyHidden` applied to a real `<input>`: the value participates in form
 * submission while the field stays out of the visual and accessibility tree.
 */
export const FormInput: Story = {
    name: 'Form input',
    render: () => ({
        template: html`
            <form class="flex flex-col gap-4" (submit)="$event.preventDefault()">
                <div class="flex items-center gap-2">
                    <label class="text-foreground text-sm font-medium" for="visibleInput">Visible field</label>
                    <input
                        class="border-border bg-background text-foreground focus:ring-ring h-9 w-52 rounded-md border px-2.5 text-sm focus:ring-2 focus:outline-none"
                        id="visibleInput"
                        type="text"
                        name="visibleInput"
                        value="Visible value"
                    />
                </div>

                <input
                    rdxVisuallyHiddenInput
                    [feature]="'fully-hidden'"
                    [name]="'hiddenInput'"
                    [value]="'Hidden value'"
                    [required]="true"
                />

                <p class="text-muted-foreground text-sm">
                    The hidden input carries its value into the form while staying out of the visual and accessibility
                    tree.
                </p>
            </form>
        `
    })
};
