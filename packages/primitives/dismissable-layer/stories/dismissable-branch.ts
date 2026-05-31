import { Component, signal } from '@angular/core';
import { RdxDismissableLayer, RdxDismissableLayerBranch } from '@radix-ng/primitives/dismissable-layer';

const buttonClasses =
    'border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';
const primaryButtonClasses =
    'bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-10 items-center justify-center rounded-md border border-transparent px-4 text-sm font-medium shadow-xs outline-none transition-[color,box-shadow] focus-visible:ring-[3px]';

@Component({
    selector: 'dismissable-branch',
    imports: [RdxDismissableLayer, RdxDismissableLayerBranch],
    template: `
        <div class="w-2xl grid grid-cols-2 gap-4">
            <section
                class="border-border bg-card text-card-foreground flex flex-col gap-4 rounded-xl border p-5 shadow-sm"
            >
                <div>
                    <p class="text-muted-foreground text-xs font-medium uppercase tracking-wide">Main layer</p>
                    <h3 class="mt-1 text-base font-semibold">Editor panel</h3>
                    <p class="text-muted-foreground mt-1 text-sm leading-6">
                        The layer closes on regular outside interactions.
                    </p>
                </div>

                <button class="${primaryButtonClasses}" (click)="open.set(true)" type="button">Open layer</button>

                @if (open()) {
                    <div
                        class="border-border bg-background flex flex-col gap-3 rounded-lg border p-4"
                        (dismiss)="open.set(false)"
                        rdxDismissableLayer
                    >
                        <div class="flex items-center justify-between gap-3">
                            <span class="text-sm font-medium">Layer is active</span>
                            <span class="bg-primary/10 text-primary rounded-full px-2 py-1 text-xs font-medium">
                                Open
                            </span>
                        </div>
                        <button class="${buttonClasses}" (click)="open.set(false)" type="button">Close layer</button>
                    </div>
                }
            </section>

            <aside
                class="border-primary/50 bg-primary/5 text-card-foreground flex flex-col gap-4 rounded-xl border border-dashed p-5"
                rdxDismissableLayerBranch
            >
                <div>
                    <p class="text-primary text-xs font-medium uppercase tracking-wide">Registered branch</p>
                    <h3 class="mt-1 text-base font-semibold">Detached toolbar</h3>
                    <p class="text-muted-foreground mt-1 text-sm leading-6">
                        Interacting here does not dismiss the layer, even though this block is outside its DOM subtree.
                    </p>
                </div>
                <button class="${buttonClasses}" (click)="incrementBranchClicks()" type="button">
                    Branch action: {{ branchClicks() }}
                </button>
            </aside>

            <button class="${buttonClasses} col-span-2 justify-self-start" type="button">Regular outside action</button>
        </div>
    `
})
export class DismissableBranch {
    readonly open = signal(true);

    readonly branchClicks = signal(0);

    incrementBranchClicks() {
        this.branchClicks.update((value) => value + 1);
    }
}
