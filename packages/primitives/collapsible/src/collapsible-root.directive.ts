import { Directive, EventEmitter, inject, InjectionToken, Input, Output } from '@angular/core';

const RdxCollapsibleToken = new InjectionToken<RdxCollapsibleRootDirective>('RdxCollapsibleToken');

export function injectCollapsible(): RdxCollapsibleRootDirective {
    return inject(RdxCollapsibleRootDirective);
}

@Directive({
    selector: '[CollapsibleRoot]',
    standalone: true,
    providers: [{ provide: RdxCollapsibleToken, useExisting: RdxCollapsibleRootDirective }]
})
export class RdxCollapsibleRootDirective {
    private _open = false;
    @Input() disabled = false;
    @Input() set open(value: boolean) {
        if (value !== this._open) {
            this.openChange.emit(value);
        }

        this._open = value;
    }
    @Output() openChange = new EventEmitter<boolean>();

    setOpen(value?: boolean) {
        if (value === undefined) {
            this.open = !this._open;
        } else {
            this.open = value;
        }
    }

    isOpen(): boolean {
        return this._open;
    }
}
