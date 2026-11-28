import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RdxCompositeItem, RdxCompositeRoot } from '@radix-ng/primitives/composite';
import type { Direction } from '@radix-ng/primitives/core';
import { RdxDirectionProvider } from '@radix-ng/primitives/direction-provider';
import { RdxPortal } from '@radix-ng/primitives/portal';

@Component({
    selector: 'rdx-composite-portalled-direction',
    imports: [RdxCompositeItem, RdxCompositeRoot, RdxDirectionProvider, RdxPortal],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="flex flex-col items-start gap-4" dir="rtl">
            <button class="demo-button demo-button-primary h-9 px-4" (click)="toggleDirection()" type="button">
                Switch primitive direction to {{ direction() === 'rtl' ? 'LTR' : 'RTL' }}
            </button>

            <div [direction]="direction()" rdxDirectionProvider>
                <div rdxDirectionProvider>
                    <div
                        class="flex flex-wrap gap-2"
                        [container]="destination"
                        orientation="horizontal"
                        rdxCompositeRoot
                        rdxPortal
                    >
                        <button class="demo-button demo-button-outline h-9 px-4" type="button" rdxCompositeItem>
                            One
                        </button>
                        <button class="demo-button demo-button-outline h-9 px-4" type="button" rdxCompositeItem>
                            Two
                        </button>
                        <button class="demo-button demo-button-outline h-9 px-4" type="button" rdxCompositeItem>
                            Three
                        </button>
                    </div>
                </div>
            </div>

            <div #destination dir="ltr" data-testid="portal-destination"></div>
        </div>
    `
})
export class RdxCompositePortalledDirectionComponent {
    protected readonly direction = signal<Direction>('rtl');

    protected toggleDirection(): void {
        this.direction.update((direction) => (direction === 'rtl' ? 'ltr' : 'rtl'));
    }
}
