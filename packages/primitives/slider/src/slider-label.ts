import { Directive, input } from '@angular/core';
import { injectId, useLabel } from '@radix-ng/primitives/core';
import { injectSliderRootContext } from './slider-context';

/** Names the slider group. Clicking the label of a single-thumb slider focuses its native input. */
@Directive({
    selector: 'div[rdxSliderLabel]',
    exportAs: 'rdxSliderLabel',
    host: {
        '[id]': 'id()',
        '(pointerdown)': 'label.onPointerDown($event)',
        '(click)': 'label.onClick($event)',
        '[attr.data-orientation]': 'root.orientation()',
        '[attr.data-disabled]': 'root.isDisabled() ? "" : undefined',
        '[attr.data-dragging]': 'root.dragging() ? "" : undefined'
    }
})
export class RdxSliderLabel {
    protected readonly root = injectSliderRootContext();
    readonly id = input<string>(injectId('rdx-slider-label-'));
    protected readonly label = useLabel({
        id: this.id,
        registries: [this.root.labelRegistry],
        control: () => (this.root.values().length === 1 ? (this.root.thumbList()[0]?.inputElement ?? null) : null)
    });
}
