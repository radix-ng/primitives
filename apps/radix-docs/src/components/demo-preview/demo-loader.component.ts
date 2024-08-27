import { Component, inject, input, type OnInit, ViewContainerRef } from '@angular/core';

@Component({
    selector: 'empty-component',
    standalone: true,
    template: `
        <ng-container></ng-container>
    `
})
export class DemoLoaderComponent implements OnInit {
    readonly name = input<string>('');
    readonly file = input<string>('');

    private viewContainerRef = inject(ViewContainerRef);

    async ngOnInit() {
        await this.loadComponent();
    }

    private async loadComponent() {
        const { default: Component } = await import(`../demos/${this.name()}/${this.file()}.ts`);

        this.viewContainerRef.clear();
        this.viewContainerRef.createComponent(Component);
    }
}
