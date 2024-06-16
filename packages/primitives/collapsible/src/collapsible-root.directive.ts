import {
    ContentChild,
    Directive,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    NgZone,
    Output
} from '@angular/core';

import { transitionCollapsing, usePresence } from '../../presence';
import { RdxCollapsibleContentDirective } from './collapsible-content.directive';

const RdxCollapsibleToken = new InjectionToken<RdxCollapsibleRootDirective>('RdxCollapsibleToken');

export function injectCollapsible(): RdxCollapsibleRootDirective {
    return inject(RdxCollapsibleRootDirective);
}

export type RdxCollapsibleState = 'open' | 'closed';

@Directive({
    selector: '[CollapsibleRoot]',
    standalone: true,
    providers: [{ provide: RdxCollapsibleToken, useExisting: RdxCollapsibleRootDirective }],
    host: {
        '[attr.data-state]': 'getState()'
    }
})
export class RdxCollapsibleRootDirective {
    private readonly ngZone = inject(NgZone);
    private _open = false;
    @Input() disabled = false;
    @Input() set open(value: boolean) {
        if (value !== this._open) {
            this.openChange.emit(value);
        }

        this._open = value;
    }
    @Output() openChange = new EventEmitter<boolean>();
    @ContentChild(RdxCollapsibleContentDirective) contentDirective?: RdxCollapsibleContentDirective;

    setOpen(value?: boolean) {
        if (value === undefined) {
            this.open = !this._open;
        } else {
            this.open = value;
        }

        this.setPresence();
    }

    getState(): RdxCollapsibleState {
        return this._open ? 'open' : 'closed';
    }

    isOpen(): boolean {
        return this._open;
    }

    private setPresence(): void {
        if (!this.contentDirective) {
            return;
        }

        const direction = this._open ? 'show' : 'hide';

        usePresence(
            this.ngZone,
            this.contentDirective.elementRef.nativeElement,
            transitionCollapsing,
            {
                context: {
                    direction,
                    dimension: 'height'
                },
                animation: true
            }
        ).subscribe();
    }
}
