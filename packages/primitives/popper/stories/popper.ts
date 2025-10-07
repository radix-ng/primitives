import { Component, effect, signal } from '@angular/core';
import { popperImports } from '../index';

@Component({
    selector: 'popper-upd-position',
    imports: [...popperImports],
    styles: `
        .popper_contentClass {
            transform-origin: var(--radix-popper-transform-origin);
            background-color: #ccc;
            padding: 10px;
            border-radius: 10px;
            width: 300px;
            height: 150px;
        }
        .popper_anchorClass {
            background-color: hotpink;
            width: 100px;
            height: 100px;
        }
        .popper_arrowClass {
            fill: #ccc;
        }
    `,
    template: `
        <div rdxPopperRoot>
            <div class="popper_anchorClass" [style.margin-left]="left() + 'px'" rdxPopperAnchor>open</div>
            <div class="popper_contentClass" side="left" align="center" sideOffset="5" rdxPopperContentWrapper>
                <div rdxPopperContent>Dimensions</div>
                <span class="popper_arrowClass" rdxPopperArrow></span>
            </div>
        </div>
    `
})
export class PopperUpdPosition {
    open = signal(false);
    left = signal(0);

    constructor() {
        effect((onCleanup) => {
            const intervalId = setInterval(() => {
                this.left.update((prev) => (prev + 50) % 300);
            }, 500);

            onCleanup(() => {
                clearInterval(intervalId);
            });
        });
    }
}
