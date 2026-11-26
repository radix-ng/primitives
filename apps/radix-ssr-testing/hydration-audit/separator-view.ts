import { Component, signal } from '@angular/core';
import { RdxSeparatorRootDirective, type Orientation } from '@radix-ng/primitives/separator';
import { RdxToolbarButton, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';

@Component({
    selector: 'audit-separator-view',
    imports: [RdxSeparatorRootDirective, RdxToolbarRoot, RdxToolbarButton, RdxToolbarSeparator],
    template: `
        <div rdxSeparatorRoot data-separator-node="standalone"></div>
        <hr [orientation]="orientation()" rdxSeparatorRoot data-separator-node="native" />
        <button (click)="orientation.set(undefined)" type="button">Clear separator orientation</button>

        <div rdxToolbarRoot aria-label="Editing">
            <button rdxToolbarButton type="button">Copy</button>
            <div rdxToolbarSeparator data-separator-node="toolbar-default"></div>
            <div [orientation]="undefined" rdxToolbarSeparator data-separator-node="toolbar-undefined"></div>
            <button rdxToolbarButton type="button">Paste</button>
        </div>
    `
})
export class SeparatorAuditView {
    protected readonly orientation = signal<Orientation | undefined>('vertical');
}
