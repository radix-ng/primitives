import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, Directive, inject, input, model, OutputEmitterRef } from '@angular/core';
import { outputFromObservable, outputToObservable } from '@angular/core/rxjs-interop';
import { provideValueAccessor, RdxControlValueAccessor } from '@radix-ng/primitives/core';

export interface ToggleProps {
    /**
     * The controlled state of the toggle.
     */
    pressed?: boolean;

    /**
     * The state of the toggle when initially rendered. Use `defaultPressed`
     * if you do not need to control the state of the toggle.
     * @defaultValue false
     */
    defaultPressed?: boolean;

    /**
     * The callback that fires when the state of the toggle changes.
     */
    onPressedChange?: OutputEmitterRef<boolean>;

    /**
     * Whether the toggle is disabled.
     * @defaultValue false
     */
    disabled?: boolean;
}

export type DataState = 'on' | 'off';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxToggle]',
    exportAs: 'rdxToggle',
    providers: [provideValueAccessor(RdxToggleDirective)],
    hostDirectives: [
        {
            directive: RdxControlValueAccessor,
            inputs: ['value: pressed', 'disabled']
        }
    ],
    host: {
        type: 'button',
        '[attr.aria-pressed]': 'cva.value()',
        '[attr.data-state]': 'cva.value() ? "on" : "off"',
        '[attr.data-disabled]': 'cva.disabled() ? "" : undefined',
        '[disabled]': 'cva.disabled()',

        '(click)': 'onClick()'
    }
})
export class RdxToggleDirective {
    /**
     * @ignore
     */
    readonly cva = inject(RdxControlValueAccessor);

    /**
     * The pressed state of the toggle when it is initially rendered.
     * Use when you do not need to control its pressed state.
     *
     * @group Props
     */
    readonly defaultPressed = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled pressed state of the toggle.
     * Must be used in conjunction with `onPressedChange`.
     *
     * @group Props
     */
    readonly pressed = model<boolean>(this.defaultPressed());

    /**
     * When true, prevents the user from interacting with the toggle.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * Event handler called when the pressed state of the toggle changes.
     *
     * @group Emits
     */
    readonly onPressedChange = outputFromObservable(outputToObservable(this.cva.valueChange));

    protected onClick(): void {
        if (!this.disabled()) {
            this.pressed.set(!this.pressed());
            this.cva.writeValue(this.pressed());
            this.cva.setValue(this.pressed());
        }
    }
}
