import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';

@Component({
    changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'separator-horizontal-example',
    imports: [RdxSeparatorRootDirective],
    template: `
        <div class="flex w-full max-w-sm flex-col gap-3">
            <div>
                <h3 class="text-foreground text-sm font-medium">Radix NG Primitives</h3>
                <p class="text-muted-foreground mt-1 text-sm">Headless Angular primitives modeled after Base UI.</p>
            </div>

            <div class="bg-border h-px w-full" rdxSeparatorRoot></div>

            <div class="text-muted-foreground text-sm">
                Composable directives with state exposed through data attributes.
            </div>
        </div>
    `
})
export class SeparatorHorizontalExample {}
