// Thanks for adrian-ub

import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { demos } from '@/demos/primitives';

@Component({
    imports: [NgComponentOutlet, AsyncPipe],
    template: `
        @let componentRender = this.component() | async;

        @if (this.existComponent && (!componentRender || !componentRender?.default)) {
            <div class="text-sm text-white">Loading...</div>
        } @else if (!this.existComponent) {
            <div>
                <p class="text-muted-foreground text-sm">
                    Component
                    <code class="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm">
                        {{ name() }}
                    </code>
                    .
                </p>
            </div>
        } @else {
            <ng-container *ngComponentOutlet="componentRender!.default" />
        }
    `
})
export class DemoLoaderComponent {
    readonly name = input<string>();
    readonly file = input<string>();

    demos = demos;

    protected existComponent = true;

    component = computed(async () => {
        if (!this.file() || !this.name()) return null;

        const component = demos[this.name()!][this.file()!].component();

        try {
            return component;
        } catch {
            this.existComponent = false;
            return null;
        }
    });
}
