import { contentChild, Directive, EventEmitter, inject, InjectionToken, Input, Output } from '@angular/core';
import { asyncScheduler } from 'rxjs';
import { RdxCollapsibleContentToken } from './collapsible-content.token';

const RdxCollapsibleRootToken = new InjectionToken<RdxCollapsibleRootDirective>('RdxCollapsibleRootToken');

export function injectCollapsible(): RdxCollapsibleRootDirective {
    return inject(RdxCollapsibleRootDirective);
}

export type RdxCollapsibleState = 'open' | 'closed';

@Directive({
    selector: '[rdxCollapsibleRoot]',
    standalone: true,
    exportAs: 'collapsibleRoot',
    providers: [{ provide: RdxCollapsibleRootToken, useExisting: RdxCollapsibleRootDirective }],
    host: {
        '[attr.data-state]': 'getState()'
    }
})
export class RdxCollapsibleRootDirective {
    /**
     * Reference to RdxCollapsibleContent directive
     * @private
     * @ignore
     */
    private readonly contentDirective = contentChild.required(RdxCollapsibleContentToken);

    /**
     * Stores collapsible state
     * @private
     * @ignore
     */
    private _open = false;

    /**
     * Determines whether a directive is available for interaction.
     * When true, prevents the user from interacting with the collapsible.
     */
    @Input() disabled = false;

    /**
     * The controlled open state of the collapsible.
     * Sets the state of the directive. `true` - expanded, `false` - collapsed
     * @param {boolean} value
     */
    @Input() set open(value: boolean) {
        if (value !== this._open) {
            this.onOpenChange.emit(value);
        }

        this._open = value;
        this.setPresence();
    }

    /**
     * Emitted with new value when directive state changed.
     * Event handler called when the open state of the collapsible changes.
     */
    @Output() onOpenChange = new EventEmitter<boolean>();

    /**
     * Allows to change directive state
     * @param {boolean | undefined} value
     */
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

    /**
     * Returns directive state (open | closed)
     */
    getState(): RdxCollapsibleState {
        return this._open ? 'open' : 'closed';
    }

    /**
     * Returns current directive state
     */
    isOpen(): boolean {
        return this._open;
    }

    /**
     * Controls visibility of content
     * @private
     * @ignore
     */
    private setPresence(): void {
        if (!this.contentDirective) {
            return;
        }

        this.contentDirective().elementRef.nativeElement.setAttribute('data-state', this.getState());

        if (this.isOpen()) {
            this.contentDirective().elementRef.nativeElement.removeAttribute('hidden');
        } else {
            asyncScheduler.schedule(() => {
                const animations = this.contentDirective().elementRef.nativeElement.getAnimations();

                if (animations === undefined || animations.length === 0) {
                    this.contentDirective().elementRef.nativeElement.setAttribute('hidden', '');
                }
            });
        }
    }
}
