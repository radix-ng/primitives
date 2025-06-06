import { Component, model } from '@angular/core';
import { RdxToggleGroupDirective, RdxToggleGroupItemDirective } from '@radix-ng/primitives/toggle-group';
import { LucideAngularModule } from 'lucide-angular';

@Component({
    selector: 'toggle-group',
    imports: [RdxToggleGroupDirective, RdxToggleGroupItemDirective, LucideAngularModule],
    styleUrl: 'toggle.styles.css',
    template: `
        <div
            class="ToggleGroup"
            [value]="align()"
            (onValueChange)="setAlign($event)"
            rdxToggleGroup
            aria-label="Text alignment"
        >
            <button class="ToggleGroupItem" rdxToggleGroupItem value="left" aria-label="Left aligned">
                <lucide-icon name="align-left" size="12" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="center" aria-label="Center aligned">
                <lucide-icon name="align-center" size="12" />
            </button>
            <button class="ToggleGroupItem" rdxToggleGroupItem value="right" aria-label="Right aligned">
                <lucide-icon name="align-right" size="12" />
            </button>
        </div>

        <div>value of model: {{ align() }}</div>
    `
})
export class ToggleGroup {
    align = model<'right' | 'center' | 'left' | undefined>('right');

    setAlign(val: string | undefined) {
        this.align.set(val as 'right' | 'center' | 'left' | undefined);
    }
}
