import { Component, ElementRef, input, signal, viewChild } from '@angular/core';
import { RdxDismissableLayer } from '@radix-ng/primitives/dismissable-layer';

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'dismissable-nested',
    imports: [RdxDismissableLayer],
    template: `
        <div
            class="border-border bg-card text-card-foreground flex min-w-56 flex-col items-start gap-3 rounded-xl border p-4 shadow-sm"
            (dismiss)="handleDismiss()"
            (focusOutside)="handleFocusOutside($event)"
            (pointerDownOutside)="handlePointerDownOutside($event)"
            rdxDismissableLayer
        >
            <div>
                <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Layer {{ level() }}</p>
                <p class="mt-1 text-sm font-medium">Only the topmost layer handles Escape.</p>
            </div>
            <button class="${buttonClasses}" #buttonRef (click)="open.set(!open())">
                {{ open() ? 'Close child' : 'Open child' }}
            </button>
            @if (open()) {
                <dismissable-nested
                    [level]="level() + 1"
                    [onDismiss]="closeChild"
                    [onPointerDownOutside]="preventTriggerDismiss"
                />
            }
        </div>
    `
})
export class DismissableNested {
    readonly onDismiss = input<() => void>();
    readonly onFocusOutside = input<(ev: Event) => void>();
    readonly onPointerDownOutside = input<(ev: PointerEvent) => void>();

    readonly level = input(1);

    readonly open = signal(false);

    readonly buttonRef = viewChild<ElementRef>('buttonRef');

    readonly closeChild = () => {
        this.open.set(false);
    };

    readonly preventTriggerDismiss = (event: PointerEvent) => {
        if (event.target === this.buttonRef()?.nativeElement) {
            event.preventDefault();
        }
    };

    handleDismiss() {
        this.onDismiss()?.();
    }

    handleFocusOutside(event: FocusEvent) {
        this.onFocusOutside()?.(event);
    }

    handlePointerDownOutside(event: PointerEvent) {
        this.onPointerDownOutside()?.(event);
    }
}
