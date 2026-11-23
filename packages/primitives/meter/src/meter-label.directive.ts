import { computed, Directive, input } from '@angular/core';
import { injectId, watch } from '@radix-ng/primitives/core';
import { injectMeterRootContext } from './meter-root.directive';

/**
 * Labels the meter.
 *
 * @group Components
 */
@Directive({
    selector: '[rdxMeterLabel]',
    exportAs: 'rdxMeterLabel',
    host: {
        '[attr.id]': 'labelId()',
        role: 'presentation'
    }
})
export class RdxMeterLabelDirective {
    protected readonly meter = injectMeterRootContext();
    private readonly generatedId = injectId('rdx-meter-label-');

    /** ID registered with the Meter Root. */
    readonly id = input<string>();

    protected readonly labelId = computed(() => this.id() ?? this.meter.labelId() ?? this.generatedId);

    constructor() {
        watch([this.labelId], ([id], onCleanup) => {
            onCleanup(this.meter.registerLabel(id));
        });
    }
}
