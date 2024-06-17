import {
    AfterViewInit,
    ContentChild,
    Directive,
    EventEmitter,
    inject,
    InjectionToken,
    Input,
    Output
} from '@angular/core';
import { asyncScheduler } from 'rxjs';

import {
    RdxCollapsibleContentDirective,
    RdxCollapsibleContentToken
} from './collapsible-content.directive';

const RdxCollapsibleToken = new InjectionToken<RdxCollapsibleRootDirective>('RdxCollapsibleToken');

export function injectCollapsible(): RdxCollapsibleRootDirective {
    return inject(RdxCollapsibleRootDirective);
}

export type RdxCollapsibleState = 'open' | 'closed';

@Directive({
    selector: '[CollapsibleRoot]',
    standalone: true,
    exportAs: 'collapsibleRoot',
    providers: [{ provide: RdxCollapsibleToken, useExisting: RdxCollapsibleRootDirective }],
    host: {
        '[attr.data-state]': 'getState()'
    }
})
export class RdxCollapsibleRootDirective implements AfterViewInit {
    private _open = false;
    @Input() disabled = false;
    @Input() set open(value: boolean) {
        if (value !== this._open) {
            this.openChange.emit(value);
        }

        this._open = value;
    }
    @Output() openChange = new EventEmitter<boolean>();
    @ContentChild(RdxCollapsibleContentToken) contentDirective?: RdxCollapsibleContentDirective;

    ngAfterViewInit(): void {
        this.setPresence();
    }

    setOpen(value?: boolean) {
        if (this.disabled) {
            return;
        }

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

        this.contentDirective.elementRef.nativeElement.setAttribute('data-state', this.getState());

        if (this.isOpen()) {
            this.contentDirective.elementRef.nativeElement.removeAttribute('hidden');
        } else {
            asyncScheduler.schedule(() => {
                const animations = this.contentDirective?.elementRef.nativeElement.getAnimations();

                if (animations === undefined || animations.length === 0) {
                    this.contentDirective?.elementRef.nativeElement.setAttribute('hidden', '');
                }
            });
        }
    }
}
