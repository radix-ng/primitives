import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    computed,
    Directive,
    inject,
    InjectionToken,
    input,
    InputSignalWithTransform,
    model,
    ModelSignal,
    output,
    OutputEmitterRef
} from '@angular/core';

export const RdxSwitchToken = new InjectionToken<RdxSwitchRootDirective>('RdxSwitchToken');

export function injectSwitch(): RdxSwitchRootDirective {
    return inject(RdxSwitchToken);
}

export interface SwitchProps {
    checked?: ModelSignal<boolean>;
    defaultChecked?: boolean;
    required?: InputSignalWithTransform<boolean, BooleanInput>;
    onCheckedChange?: OutputEmitterRef<boolean>;
}

let idIterator = 0;

@Directive({
    selector: 'button[rdxSwitchRoot]',
    exportAs: 'rdxSwitchRoot',
    standalone: true,
    providers: [
        { provide: RdxSwitchToken, useExisting: RdxSwitchRootDirective }],
    host: {
        role: 'switch',
        type: 'button',
        '[id]': 'elementId()',
        '[attr.aria-checked]': 'checked()',
        '[attr.aria-required]': 'required',
        '[attr.data-state]': 'checked() ? "checked" : "unchecked"',
        '[attr.data-disabled]': 'disabledState() ? "true" : null',
        '[attr.disabled]': 'disabledState() ? disabledState() : null',

        '(click)': 'toggle()'
    }
})
export class RdxSwitchRootDirective implements SwitchProps {
    readonly id = input<string>(`rdx-switch-${idIterator++}`);
    protected readonly elementId = computed(() => (this.id() ? this.id() : null));

    /**
     * When true, indicates that the user must check the switch before the owning form can be submitted.
     */
    readonly required = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /**
     * The controlled state of the switch. Must be used in conjunction with onCheckedChange.
     */
    readonly checked = model<boolean>(false);

    /**
     * When true, prevents the user from interacting with the switch.
     */
    readonly disabled = input<boolean, BooleanInput>(false, {
        transform: booleanAttribute
    });

    /*
     * @ignore
     */
    readonly disabledState = computed(() => this.disabled());

    /**
     * Event handler called when the state of the switch changes.
     */
    readonly onCheckedChange = output<boolean>();

    /**
     * Toggles the checked state of the switch.
     * If the switch is disabled, the function returns early.
     */
    protected toggle(): void {
        if (this.disabledState()) {
            return;
        }

        this.checked.set(!this.checked());

        this.onCheckedChange.emit(this.checked());
    }
}
