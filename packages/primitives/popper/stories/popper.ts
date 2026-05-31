import { Component, effect, signal } from '@angular/core';
import { popperImports } from '../index';

@Component({
    selector: 'popper-upd-position',
    imports: [...popperImports],
    template: `
        <div
            class="relative h-60 w-[min(600px,80vw)] overflow-hidden rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50"
            rdxPopperRoot
        >
            <span class="absolute left-4 top-4 text-xs text-gray-600">
                Always updates: the anchor changes position every 700 ms
            </span>
            <button
                class="absolute left-14 top-[132px] h-10 w-10 rounded-full bg-black text-white transition-transform duration-300 ease-out [transform:translateX(var(--offset))]"
                [style.--offset]="left() + 'px'"
                type="button"
                aria-label="Moving anchor"
                rdxPopperAnchor
            >
                <span class="sr-only">Moving anchor</span>
            </button>
            <div side="top" sideOffset="6" updatePositionStrategy="always" rdxPopperContentWrapper>
                <div
                    class="rounded-lg bg-gray-950 px-3 py-2 text-xs leading-none text-white shadow-xl"
                    rdxPopperContent
                >
                    Anchor offset: {{ left() }}px
                </div>
                <span class="fill-gray-950" rdxPopperArrow></span>
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
            class="relative h-80 w-[min(600px,80vw)] overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-gray-50"
            (pointermove)="onPointerMove($event)"
            rdxPopperRoot
        >
            <span class="absolute left-3 top-3 text-xs text-gray-600">Move the pointer inside this area</span>
            <span
                class="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black"
                [style.left.px]="pointer().x"
                [style.top.px]="pointer().y"
                rdxPopperAnchor
            ></span>
            <div side="top" sideOffset="6" updatePositionStrategy="always" rdxPopperContentWrapper>
                <div
                    class="rounded-md bg-gray-950 px-3 py-2 text-xs leading-none text-white shadow-xl"
                    rdxPopperContent
                >
                    {{ pointer().x }}, {{ pointer().y }}
                </div>
                <span class="fill-gray-950" rdxPopperArrow></span>
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
