import { ChangeDetectionStrategy, Component, input, resource, signal, viewChild } from '@angular/core';
import { LucideChevronRight } from '@lucide/angular';
import { RdxMenuModule, RdxMenuRoot } from '@radix-ng/primitives/menu';
import { cn, demoButton, demoMenu } from '../../storybook/styles';

@Component({
    selector: 'rdx-menu-async',
    imports: [RdxMenuModule, LucideChevronRight],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
        <div class="grid gap-4">
            <ng-container #root="rdxMenuRoot" rdxMenuRoot>
                <button [class]="cn(b.base, b.outline, b.size.md)" rdxMenuTrigger>
                    {{ nested() ? 'Documents' : 'Recent documents' }}
                </button>
                <ng-template [keepMounted]="true" rdxMenuPortal>
                    <div [class]="m.positioner" align="start" sideOffset="4" rdxMenuPositioner>
                        <div [class]="m.popup" rdxMenuPopup>
                            @if (nested()) {
                                <button [class]="m.item" (onSelect)="selected.set('New document')" rdxMenuItem>
                                    New document
                                </button>
                                <ng-container #recent="rdxMenuRoot" rdxMenuRoot>
                                    <button [class]="cn(m.item, 'justify-between')" rdxMenuSubTrigger>
                                        Recent documents
                                        <svg class="size-4 shrink-0" lucideChevronRight></svg>
                                    </button>
                                    <ng-template [keepMounted]="true" rdxMenuPortal>
                                        <div
                                            [class]="m.positioner"
                                            side="right"
                                            align="start"
                                            sideOffset="4"
                                            rdxMenuPositioner
                                        >
                                            <div [class]="m.popup" rdxMenuPopup>
                                                @if (documents.isLoading()) {
                                                    <p class="text-muted-foreground px-3 py-2 text-sm" role="status">
                                                        Loading documents…
                                                    </p>
                                                }
                                                @for (document of documents.value() ?? []; track document) {
                                                    <button
                                                        [class]="m.item"
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
                                    <button [class]="m.item" (onSelect)="selected.set(document)" rdxMenuItem>
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
    protected readonly cn = cn;
    protected readonly b = demoButton;
    protected readonly m = demoMenu;
}
