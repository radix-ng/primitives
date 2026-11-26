import { Component, provideZonelessChangeDetection, signal } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { RdxSeparatorRootDirective } from '@radix-ng/primitives/separator';
import { RdxToolbarButton, RdxToolbarRoot, RdxToolbarSeparator } from '@radix-ng/primitives/toolbar';
import { installFixture, opposite, type Orientation } from './contract';

installFixture();

@Component({
    selector: 'parity-separator',
    imports: [RdxSeparatorRootDirective, RdxToolbarRoot, RdxToolbarButton, RdxToolbarSeparator],
    template: `
        <input aria-label="Before separator" />
        <div rdxSeparatorRoot data-part="default"></div>
        <input aria-label="After separator" />

        <div [orientation]="orientation()" rdxSeparatorRoot data-part="reactive"></div>
        <button (click)="orientation.set('vertical')" type="button">Set vertical</button>
        <button (click)="orientation.set('horizontal')" type="button">Set horizontal</button>
        <button (click)="orientation.set(undefined)" type="button">Clear orientation</button>

        <hr rdxSeparatorRoot orientation="vertical" data-part="native" />

        <div
            [orientation]="toolbarOrientation()"
            [attr.data-override]="toolbarOverride() ?? 'unset'"
            rdxToolbarRoot
            aria-label="Editing"
        >
            <button rdxToolbarButton type="button">Copy</button>
            <div rdxToolbarSeparator data-part="toolbar-derived"></div>
            <div [orientation]="undefined" rdxToolbarSeparator data-part="toolbar-initial-undefined"></div>
            <div [orientation]="toolbarOverride()" rdxToolbarSeparator data-part="toolbar-override"></div>
            <button rdxToolbarButton type="button">Paste</button>
        </div>
        <button (click)="rotateToolbar()" type="button">Rotate toolbar</button>
        <button (click)="toolbarOverride.set(undefined)" type="button">Clear toolbar override</button>
    `
})
class SeparatorFixture {
    protected readonly orientation = signal<Orientation | undefined>(undefined);
    protected readonly toolbarOrientation = signal<Orientation>('horizontal');
    protected readonly toolbarOverride = signal<Orientation | undefined>('horizontal');

    protected rotateToolbar(): void {
        this.toolbarOrientation.update(opposite);
    }
}

void bootstrapApplication(SeparatorFixture, { providers: [provideZonelessChangeDetection()] });
