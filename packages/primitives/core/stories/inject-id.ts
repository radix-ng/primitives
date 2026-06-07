import { Component, input } from '@angular/core';
import { injectId } from '@radix-ng/primitives/core';
import { cn, demoInput } from '../../storybook/styles';

/**
 * Each instance calls `injectId('rdx-field-')` in its injection context, so every
 * label/input pair is wired with a unique, SSR-stable id without hardcoding one.
 */
@Component({
    selector: 'inject-id-field',
    imports: [],
    template: `
        <div class="flex flex-col gap-1.5">
            <label class="text-foreground text-sm font-medium" [attr.for]="id">{{ label() }}</label>
            <input [id]="id" [class]="inputClass" [placeholder]="label()" type="text" />
            <code class="text-muted-foreground text-xs">id="{{ id }}"</code>
        </div>
    `
})
export class InjectIdField {
    readonly label = input.required<string>();

    /** Generated once per instance; the shared per-prefix counter keeps ids unique and ordered. */
    readonly id = injectId('rdx-field-');

    protected readonly inputClass = cn(demoInput);
}

@Component({
    selector: 'inject-id-example',
    imports: [InjectIdField],
    template: `
        <div class="flex w-72 flex-col gap-5">
            <inject-id-field label="First name" />
            <inject-id-field label="Last name" />
            <inject-id-field label="Email" />
        </div>
    `
})
export class InjectIdExample {}
