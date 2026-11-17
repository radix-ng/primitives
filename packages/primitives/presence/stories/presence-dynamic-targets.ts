import { Component, inject, signal } from '@angular/core';
import { provideRdxPresenceContext, RdxPresenceTarget } from '@radix-ng/primitives/presence';
import { cn, demoButton } from '../../storybook/styles';
import { PresenceDemo } from './presence';

@Component({
    selector: 'presence-dynamic-targets',
    imports: [PresenceDemo, RdxPresenceTarget],
    providers: [provideRdxPresenceContext(() => ({ present: inject(PresenceDynamicTargets).open }))],
    template: `
        <div class="flex flex-col items-center gap-4">
            <button [class]="buttonClass" (click)="open.set(!open())" type="button">
                {{ open() ? 'Unmount' : 'Mount' }}
            </button>
            <button [class]="buttonClass" (click)="showChild.set(!showChild())" type="button">
                {{ showChild() ? 'Remove animated child' : 'Add animated child' }}
            </button>
            <div class="flex h-28 items-center">
                <ng-template presenceDemo>
                    <div
                        class="dynamic-presence-root group border-border bg-card text-card-foreground flex h-24 w-56 items-center justify-center rounded-md border p-2 text-sm shadow-sm transition-opacity duration-1000 data-[closed]:opacity-0"
                        [attr.data-closed]="open() ? undefined : ''"
                    >
                        @if (showChild()) {
                            <span
                                class="dynamic-presence-child group-data-[closed]:animate-ping group-data-[closed]:[animation-duration:2s] group-data-[closed]:[animation-iteration-count:1]"
                                rdxPresenceTarget
                            >
                                Dynamic animation target
                            </span>
                        }
                    </div>
                </ng-template>
            </div>
        </div>
    `
})
export class PresenceDynamicTargets {
    readonly open = signal(false);
    readonly showChild = signal(true);
    readonly buttonClass = cn(demoButton.base, demoButton.outline, demoButton.size.md);
}
