import { CdkAccordionItem } from '@angular/cdk/accordion';
import {
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    OnInit,
    signal
} from '@angular/core';
import { animationFrameScheduler } from 'rxjs';

import { RdxAccordionItemState } from './accordion-item.directive';
import { RdxAccordionOrientation } from './accordion-root.directive';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>(
    'RdxAccordionContentToken'
);

@Directive({
    selector: '[rdxAccordionContent]',
    standalone: true,
    exportAs: 'rdxAccordionContent',
    providers: [{ provide: RdxAccordionContentToken, useExisting: RdxAccordionContentDirective }],
    host: {
        '[attr.data-state]': 'state()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-orientation]': 'orientation'
    },
    hostDirectives: [CdkAccordionItem]
})
export class RdxAccordionContentDirective implements OnInit {
    /**
     * @ignore
     */
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    /**
     * @ignore
     */
    private initialized = signal(false);
    /**
     * Current item state
     */
    state = signal<RdxAccordionItemState>('closed');
    /**
     * When true, prevents the user from interacting with the accordion and all its items.
     */
    disabled = input(false);
    /**
     * @ignore
     */
    accordionItem = inject(CdkAccordionItem);
    /**
     * @ignore
     */
    orientation: RdxAccordionOrientation = 'vertical';

    constructor() {
        effect(() => {
            if (this.state()) {
                this.setPresence();
            }
        });
    }

    /**
     * @ignore
     */
    ngOnInit(): void {
        this.togglePresence();
    }

    /**
     * @ignore
     */
    setOpen(state?: RdxAccordionItemState | undefined): void {
        if (this.disabled()) {
            return;
        }

        if (state === undefined) {
            this.state.update(() => (this.state() === 'open' ? 'closed' : 'open'));
        } else {
            this.state.update(() => state);
        }
    }

    /**
     * @ignore
     */
    private initialize(): void {
        if (!this.initialized()) {
            this.togglePresence();

            animationFrameScheduler.schedule(() => {
                this.elementRef.nativeElement
                    .getAnimations()
                    .forEach((animation) => animation.cancel());

                this.initialized.set(true);
            });
        }
    }

    /**
     * @ignore
     */
    private setPresence(): void {
        if (!this.initialized()) {
            this.initialize();

            return;
        }

        animationFrameScheduler.schedule(() => {
            const animations = this.elementRef.nativeElement.getAnimations();

            const hidden = this.elementRef.nativeElement.hasAttribute('hidden');

            if (hidden) {
                this.show();

                const rect = this.elementRef.nativeElement.getBoundingClientRect();
                const height = `${this.elementRef.nativeElement.scrollHeight /*rect.height*/}px`;
                const width = `${rect.width}px`;

                this.elementRef.nativeElement.style.setProperty(
                    '--radix-accordion-content-height',
                    height
                );

                this.elementRef.nativeElement.style.setProperty(
                    '--radix-accordion-content-width',
                    width
                );

                this.hide();
            }

            Promise.all(animations.map((animation) => animation.finished)).then(() => {
                this.togglePresence();
            });
        });
    }

    /**
     * @ignore
     */
    private togglePresence(): void {
        if (this.state() === 'open') {
            this.show();
        } else {
            this.hide();
        }
    }

    /**
     * @ignore
     */
    private show(): void {
        this.elementRef.nativeElement.removeAttribute('hidden');
    }

    /**
     * @ignore
     */
    private hide(): void {
        this.elementRef.nativeElement.setAttribute('hidden', '');
    }
}
