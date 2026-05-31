import { Component, effect, signal } from '@angular/core';
import { popperImports } from '../index';

@Component({
    selector: 'popper-upd-position',
    imports: [...popperImports],
    template: `
        <div
            class="border-border bg-muted relative h-60 w-[min(600px,80vw)] overflow-hidden rounded-2xl border-2 border-dashed"
            rdxPopperRoot
        >
            <span class="text-muted-foreground absolute left-4 top-4 text-xs">
                Always updates: the anchor changes position every 700 ms
            </span>
            <button
                class="bg-primary text-primary-foreground absolute left-14 top-[132px] h-10 w-10 rounded-full transition-transform duration-300 ease-out [transform:translateX(var(--offset))]"
                [style.--offset]="left() + 'px'"
                type="button"
                aria-label="Moving anchor"
                rdxPopperAnchor
            >
                <span class="sr-only">Moving anchor</span>
            </button>
            <div side="top" sideOffset="6" updatePositionStrategy="always" rdxPopperContentWrapper>
                <div
                    class="border-border bg-popover text-popover-foreground rounded-lg border px-3 py-2 text-xs leading-none shadow-md"
                    rdxPopperContent
                >
                    Anchor offset: {{ left() }}px
                </div>
                <span class="fill-popover" rdxPopperArrow></span>
            </div>
        </div>
    `
})
export class PopperUpdPosition {
    left = signal(0);

    constructor() {
        effect((onCleanup) => {
            const intervalId = setInterval(() => {
                this.left.update((prev) => (prev + 80) % 400);
            }, 700);

            onCleanup(() => {
                clearInterval(intervalId);
            });
        });
    }
}

@Component({
    selector: 'popper-follow-pointer',
    imports: [...popperImports],
    template: `
        <div
            class="border-border bg-muted relative h-80 w-[min(600px,80vw)] overflow-hidden rounded-xl border-2 border-dashed"
            (pointermove)="onPointerMove($event)"
            rdxPopperRoot
        >
            <span class="text-muted-foreground absolute left-3 top-3 text-xs">Move the pointer inside this area</span>
            <span
                class="bg-primary absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full"
                [style.left.px]="pointer().x"
                [style.top.px]="pointer().y"
                rdxPopperAnchor
            ></span>
            <div side="top" sideOffset="6" updatePositionStrategy="always" rdxPopperContentWrapper>
                <div
                    class="border-border bg-popover text-popover-foreground rounded-md border px-3 py-2 text-xs leading-none shadow-md"
                    rdxPopperContent
                >
                    {{ pointer().x }}, {{ pointer().y }}
                </div>
                <span class="fill-popover" rdxPopperArrow></span>
            </div>
        </div>
    `
})
export class PopperFollowPointer {
    readonly pointer = signal({ x: 300, y: 160 });

    onPointerMove(event: PointerEvent) {
        const area = event.currentTarget as HTMLElement;
        const rect = area.getBoundingClientRect();

        this.pointer.set({
            x: Math.round(event.clientX - rect.left),
            y: Math.round(event.clientY - rect.top)
        });
    }
}
