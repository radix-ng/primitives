import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { PinGeometry } from './playground-mascot-data';

@Component({
    selector: 'app-playground-mascot-pin',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        @let pin = geometry();

        <div
            class="pointer-events-none fixed z-[190] rounded-lg border-2 border-[var(--mascot-accent)] shadow-[0_0_0_6px_var(--mascot-accent-soft)] ring-1 ring-[var(--mascot-accent-ring)]"
            [style.left.px]="pin.targetX"
            [style.top.px]="pin.targetY"
            [style.width.px]="pin.targetWidth"
            [style.height.px]="pin.targetHeight"
        ></div>
        <div
            class="ring-background pointer-events-none fixed z-[191] max-w-40 truncate rounded-md bg-[var(--mascot-accent)] px-2 py-1 text-[11px] font-semibold text-[var(--mascot-accent-foreground)] shadow-lg ring-2"
            [style.left.px]="pin.badgeX"
            [style.top.px]="pin.badgeY"
        >
            {{ pin.label }}
        </div>
    `
})
export class PlaygroundMascotPin {
    readonly geometry = input.required<PinGeometry>();
}
