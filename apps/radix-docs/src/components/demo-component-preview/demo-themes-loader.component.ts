import { Component, inject, input, type OnInit, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'empty-themes-component',
    standalone: true,
    template: `
        <ng-container></ng-container>
    `
})
export class DemoThemesLoaderComponent implements OnInit {
    readonly name = input<string>('');
    readonly file = input<string>('');

    private viewContainerRef = inject(ViewContainerRef);

    async ngOnInit() {
        await this.loadComponent();
    }

    private async loadComponent() {
        const { default: Component } = await import(`../demos-themes/${this.name()}/${this.file()}.ts`);

        this.viewContainerRef.clear();
        this.viewContainerRef.createComponent(Component);
    }
}
