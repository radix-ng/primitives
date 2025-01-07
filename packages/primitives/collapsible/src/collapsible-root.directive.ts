import { BooleanInput } from '@angular/cdk/coercion';
import { booleanAttribute, contentChild, Directive, inject, InjectionToken, input, Input, output } from '@angular/core';
import { asyncScheduler } from 'rxjs';
import { RdxCollapsibleContentToken } from './collapsible-content.token';

const RdxCollapsibleRootToken = new InjectionToken<RdxCollapsibleRootDirective>('RdxCollapsibleRootToken');

export function injectCollapsible(): RdxCollapsibleRootDirective {
    return inject(RdxCollapsibleRootDirective);
}

export type RdxCollapsibleState = 'open' | 'closed';

/**
 * @group Components
 */
@Directive({
    selector: '[rdxCollapsibleRoot]',
    exportAs: 'collapsibleRoot',
    providers: [{ provide: RdxCollapsibleRootToken, useExisting: RdxCollapsibleRootDirective }],
    host: {
        '[attr.data-state]': 'getState()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined'
    }
})
export class RdxCollapsibleRootDirective {
    /**
     * Reference to RdxCollapsibleContent directive
     */
    private readonly contentDirective = contentChild.required(RdxCollapsibleContentToken);

    /**
     * Determines whether a directive is available for interaction.
     * When true, prevents the user from interacting with the collapsible.
     *
     * @group Props
     */
    readonly disabled = input<boolean, BooleanInput>(false, { transform: booleanAttribute });

    /**
     * The controlled open state of the collapsible.
     * Sets the state of the directive. `true` - expanded, `false` - collapsed
     *
     * @group Props
     * @defaultValue false
     */
    @Input() set open(value: boolean) {
        if (value !== this._open) {
            this.onOpenChange.emit(value);
        }

        this._open = value;
        this.setPresence();
    }

    get open(): boolean {
        return this._open;
    }

    /**
     * Stores collapsible state
     */
    private _open = false;

    /**
     * Emitted with new value when directive state changed.
     * Event handler called when the open state of the collapsible changes.
     *
     * @group Emits
     */
    readonly onOpenChange = output<boolean>();

    /**
     * Allows to change directive state
     * @param {boolean | undefined} value
     * @ignore
     */
    setOpen(value?: boolean) {
        if (this.disabled()) {
            return;
        }

        if (value === undefined) {
            this.open = !this.open;
        } else {
            this.open = value;
        }

        this.setPresence();
    }

    /**
     * Returns directive state (open | closed)
     * @ignore
     */
    getState(): RdxCollapsibleState {
        return this.open ? 'open' : 'closed';
    }

    /**
     * Returns current directive state
     * @ignore
     */
    isOpen(): boolean {
        return this.open;
    }

    /**
     * Controls visibility of content
     */
    private setPresence(): void {
        if (!this.contentDirective) {
            return;
        }

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
