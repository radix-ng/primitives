import { CdkAccordionItem } from '@angular/cdk/accordion';
import {
    Directive,
    effect,
    ElementRef,
    inject,
    InjectionToken,
    input,
    signal
} from '@angular/core';
import { animationFrameScheduler } from 'rxjs';

import { RdxAccordionItemState } from './accordion-item.directive';
import { RdxAccordionOrientation } from './accordion-root.directive';

export const RdxAccordionContentToken = new InjectionToken<RdxAccordionContentDirective>(
    'RdxAccordionContentToken'
);

@Directive({
    selector: '[AccordionContent]',
    standalone: true,
    exportAs: 'AccordionContent',
    providers: [{ provide: RdxAccordionContentToken, useExisting: RdxAccordionContentDirective }],
    host: {
        '[attr.data-state]': 'state()',
        '[attr.data-disabled]': 'disabled() ? "" : undefined',
        '[attr.data-orientation]': 'orientation'
    },
    hostDirectives: [CdkAccordionItem]
})
export class RdxAccordionContentDirective {
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    state = signal<RdxAccordionItemState>('closed');
    disabled = input(false);
    accordionItem = inject(CdkAccordionItem);
    orientation: RdxAccordionOrientation = 'vertical';

    constructor() {
        effect(() => {
            if (this.state()) {
                this.setPresence();
            }
        });
    }

    setOpen(state?: RdxAccordionItemState | undefined): void {
        if (this.disabled()) {
            return;
        }

        if (state === undefined) {
            if (this.state() === 'open') {
                this.state.update(() => 'closed');
            } else {
                this.state.update(() => 'open');
            }
        } else {
            this.state.update(() => state);
        }
    }

    private setPresence(): void {
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
                if (this.state() === 'open') {
                    this.show();
                } else {
                    this.hide();
                }
            });
        });
    }

    private show(): void {
        this.elementRef.nativeElement.removeAttribute('hidden');
    }

    private hide(): void {
        this.elementRef.nativeElement.setAttribute('hidden', '');
    }
}
