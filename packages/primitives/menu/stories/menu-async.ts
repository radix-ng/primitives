import { ChangeDetectionStrategy, Component, input, resource, signal, viewChild } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import {
    RdxMenuItem,
    RdxMenuPopup,
    RdxMenuPortal,
    RdxMenuPositioner,
    RdxMenuRoot,
    RdxMenuSubTrigger,
    RdxMenuTrigger
} from '@radix-ng/primitives/menu';

@Component({
    selector: 'rdx-menu-async',
    imports: [
        RdxMenuRoot,
        RdxMenuTrigger,
        RdxMenuSubTrigger,
        RdxMenuPortal,
        RdxMenuPositioner,
        RdxMenuPopup,
        RdxMenuItem,
        LucideChevronRight
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid gap-4">
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                <button class="demo-button demo-button-outline h-9 px-4" rdxMenuTrigger>
                    {{ nested() ? 'Documents' : 'Recent documents' }}
                </button>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div class="z-50 data-[closed]:pointer-events-none" align="start" sideOffset="4" rdxMenuPositioner>
                        <div
                            class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                            rdxMenuPopup
                        >
                            @if (nested()) {
                                <button
                                    class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                    (onSelect)="selected.set('New document')"
                                    rdxMenuItem
                                >
                                    New document
                                </button>
                                <ng-container #recent="rdxMenuRoot" rdxMenuRoot>
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center justify-between gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        rdxMenuSubTrigger
                                    >
                                        Recent documents
                                        <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                    </button>
                                    <ng-template [keepMounted]="true" rdxMenuPortal>
                                        <div
                                            class="z-50 data-[closed]:pointer-events-none"
                                            side="right"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div
                                                class="demo-menu-popup min-w-[8rem] p-1 data-[closed]:pointer-events-none data-[closed]:hidden"
                                                rdxMenuPopup
                                            >
                                                @if (documents.isLoading()) {
                                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                                        Loading documents…
                                                    </p>
                                                }
                                                @for (document of documents.value() ?? []; track document) {
                                                    <button
                                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                                        (onSelect)="selected.set(document)"
                                                        rdxMenuItem
                                                    >
                                                        {{ document }}
                                                    </button>
                                                }
                                            </div>
                                        </div>
                                    </ng-template>
                                </ng-container>
                            } @else {
                                @if (documents.isLoading()) {
                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                        Loading documents…
                                    </p>
                                }
                                @for (document of documents.value() ?? []; track document) {
                                    <button
                                        class="demo-menu-item data-highlighted:bg-primary data-highlighted:text-primary-foreground relative flex w-full items-center gap-2 px-2 py-1.5 data-[disabled]:opacity-50 data-[highlighted]:outline"
                                        (onSelect)="selected.set(document)"
                                        rdxMenuItem
                                    >
                                        {{ document }}
                                    </button>
                                }
                            }
                        </div>
                    </div>
                </ng-template>
            </ng-container>
            <p class="text-muted-foreground max-w-72 text-sm">After loading, use the arrow keys to enter the list.</p>
            <output class="text-muted-foreground text-sm" aria-live="polite">Selected: {{ selected() }}</output>
        </div>
    `
})
export class RdxMenuAsyncComponent {
    readonly nested = input(false);
    private readonly root = viewChild<RdxMenuRoot>('root');
    private readonly recent = viewChild<RdxMenuRoot>('recent');
    protected readonly documents = resource({
        params: () => ((this.nested() ? this.recent()?.open() : this.root()?.open()) ? true : undefined),
        loader: async ({ abortSignal }) => {
            // Simulate an abortable request. An application can use fetch(..., { signal: abortSignal }).
            await new Promise<void>((resolve) => {
                const finish = () => {
                    clearTimeout(timer);
                    abortSignal.removeEventListener('abort', finish);
                    resolve();
                };
                const timer = setTimeout(finish, 600);
                abortSignal.addEventListener('abort', finish, { once: true });
                if (abortSignal.aborted) finish();
            });
            return ['Project notes', 'Release checklist', 'Design review'];
        }
    });
    protected readonly selected = signal('none');
}
