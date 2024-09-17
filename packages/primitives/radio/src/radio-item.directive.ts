import { FocusableOption } from '@angular/cdk/a11y';
import { booleanAttribute, Directive, ElementRef, inject, InjectionToken, Input, OnInit } from '@angular/core';
import { RDX_RADIO_GROUP } from './radio-tokens';

export const RdxRadioItemToken = new InjectionToken<RdxRadioItemDirective>('RadioItemToken');

export function injectRadioItem(): RdxRadioItemDirective {
    return inject(RdxRadioItemToken);
}

// Increasing integer for generating unique ids for radio components.
let nextUniqueId = 0;

@Directive({
    selector: '[rdxRadioItem]',
    exportAs: 'rdxRadioItem',
    standalone: true,
    providers: [{ provide: RdxRadioItemToken, useExisting: RdxRadioItemDirective }],
    host: {
        type: 'button',
        role: 'radio',
        '[attr.id]': 'id',
        '[attr.aria-checked]': 'checked',
        '[attr.data-disabled]': 'disabled ? "" : null',
        '[attr.data-state]': 'checked ? "checked" : "unchecked"',
        '[attr.tabindex]': 'tabIndex',
        '(click)': '_onClick()',
        '(blur)': '_onBlur()'
    }
})
export class RdxRadioItemDirective implements FocusableOption, OnInit {
    private readonly radioGroup = inject(RDX_RADIO_GROUP);
    readonly element = inject(ElementRef);

    @Input() id = `rdx-radio-${++nextUniqueId}`;

    @Input({ required: true }) value!: string;

    @Input({ transform: booleanAttribute }) disabled = false;

    get tabIndex(): number {
        return this.disabled ? -1 : this.radioGroup.value === this.value ? 0 : -1;
    }

    get checked(): boolean {
        return this.radioGroup.value === this.value;
    }

    ngOnInit() {
        if (this.radioGroup.defaultValue === this.value) {
            this.radioGroup.select(this.value);
        }
    }

    focus(): void {
        this.element.nativeElement.focus();
    }

    _onClick(): void {
        if (!this.disabled) {
            this.radioGroup.select(this.value);
        }
    }

    _onBlur(): void {
        this.radioGroup.onTouched?.();
    }
}
