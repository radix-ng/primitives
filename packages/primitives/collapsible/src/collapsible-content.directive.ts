import { DestroyRef, Directive, ElementRef, inject, NgZone, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { transitionCollapsing, usePresence } from '../../presence';
import { injectCollapsible } from './collapsible-root.directive';

@Directive({
    selector: '[CollapsibleContent]',
    standalone: true,
    host: {
        '[style.overflow]': '"hidden"',
        '[style.transition]': '"height 0.5s ease-in-out"',
        '[style.display]': 'getDisplayValue()',
        '[style.height]': 'getHeightValue()'
    }
})
export class RdxCollapsibleContentDirective implements OnInit {
    private readonly collapsible = injectCollapsible();
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly ngZone = inject(NgZone);
    private readonly destroyRef = inject(DestroyRef);

    ngOnInit(): void {
        this.collapsible.openChange
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((isOpen) => {
                this.setPresence(isOpen);
            });
    }

    setPresence(isOpen: boolean): void {
        const direction = isOpen ? 'show' : 'hide';
        usePresence(this.ngZone, this.elementRef.nativeElement, transitionCollapsing, {
            context: {
                direction,
                dimension: 'height'
            },
            animation: true
        }).subscribe();
    }

    getDisplayValue(): string | undefined {
        if (this.collapsible.isOpen()) {
            return undefined;
        }

        return 'none';
    }

    getHeightValue(): string | undefined {
        if (this.collapsible.isOpen()) {
            return 'auto';
        }

        return undefined;
    }
}
