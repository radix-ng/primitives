import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, computed, Directive, effect, inject, input } from '@angular/core';
import { RdxRovingFocusItemDirective } from '@radix-ng/primitives/roving-focus';
import { RdxToggleDirective } from '@radix-ng/primitives/toggle';
import { RdxToggleGroupItemToken } from './toggle-group-item.token';
import { injectToggleGroup } from './toggle-group.token';

@Directive({
    selector: '[rdxToggleGroupItem]',
    exportAs: 'rdxToggleGroupItem',
    standalone: true,
    providers: [{ provide: RdxToggleGroupItemToken, useExisting: RdxToggleGroupItemDirective }],
    hostDirectives: [
        {
            directive: RdxRovingFocusItemDirective,
            inputs: ['focusable', 'active', 'allowShiftKey']
        },
        {
            directive: RdxToggleDirective,
            inputs: ['pressed:isPressed', 'disabled']
        }
    ],
    host: {
        '(click)': 'toggle()'
    }
})
export class RdxToggleGroupItemDirective {
    private readonly rdxToggleDirective = inject(RdxToggleDirective);

    private readonly rdxRovingFocusItemDirective = inject(RdxRovingFocusItemDirective);

    /**
     * Access the toggle group.
     * @ignore
     */
    protected readonly rootContext = injectToggleGroup();

    /**
     * The value of this toggle button.
     */
    readonly value = input.required<string>();

    /**
     * Whether this toggle button is disabled.
     * @default false
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    readonly isPressed = computed(() => {
        return this.rootContext.type() === 'single'
            ? this.rootContext.value() === this.value()
            : this.rootContext.value()?.includes(this.value());
    });

    constructor() {
        effect(() => {
            this.rdxToggleDirective.pressed.set(!!this.isPressed());
            this.rdxRovingFocusItemDirective.active = !!this.isPressed();
        });
    }

    /**
     * @ignore
     */
    toggle(): void {
        if (this.disabled()) {
            return;
        }

        this.rootContext.toggle(this.value());
    }
}
