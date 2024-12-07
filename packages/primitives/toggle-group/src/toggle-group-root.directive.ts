import { Directive, EnvironmentInjector, inject, Input, OnInit } from '@angular/core';
import { useSingleOrMultipleValue } from './core/useSingleOrMultipleValue';

@Directive({
    selector: '[rdxToggleGroupRoot]',
    exportAs: 'rdxToggleGroupRoot',
    standalone: true
})
export class RdxToggleGroupRoot implements OnInit {
    @Input() type!: 'single' | 'multiple';
    @Input() defaultValue!: string | string[] | undefined;
    @Input() modelValueInput!: string | string[] | undefined;

    modelValue!: ReturnType<typeof useSingleOrMultipleValue>['modelValue'];
    changeModelValue!: ReturnType<typeof useSingleOrMultipleValue>['changeModelValue'];
    isSingle!: ReturnType<typeof useSingleOrMultipleValue>['isSingle'];

    private readonly injector = inject(EnvironmentInjector);

    ngOnInit() {
        const { modelValue, changeModelValue, isSingle } = useSingleOrMultipleValue(
            {
                type: this.type,
                defaultValue: this.defaultValue,
                modelValue: this.modelValueInput
            },
            this.injector
        );

        this.modelValue = modelValue;
        this.changeModelValue = changeModelValue;
        this.isSingle = isSingle;

        this.changeModelValue('New Value');
    }
}
