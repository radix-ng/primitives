// Thanks for adrian-ub

import { AsyncPipe, NgComponentOutlet } from '@angular/common';
import { Component, computed, input } from '@angular/core';

import { demos } from '@/demos/components';

@Component({
    selector: 'empty-themes-component',
    imports: [NgComponentOutlet, AsyncPipe],
    template: `
        @let componentRender = this.component() | async;

        @if (!componentRender || !componentRender.default) {
            <div class="text-foreground text-sm">Loading...</div>
        } @else {
            <ng-container *ngComponentOutlet="componentRender.default" />
        }
    `
})
export class DemoThemesLoaderComponent {
    readonly name = input<string>();
    readonly file = input<string>();

    demos = demos;

    component = computed(async () => {
        if (!this.file() || !this.name()) return null;

        return await demos[this.name()!][this.file()!].component();
    });
}
