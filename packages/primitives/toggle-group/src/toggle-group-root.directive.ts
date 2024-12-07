import { Directive, EnvironmentInjector, inject, input, OnInit } from '@angular/core';
import { useSingleOrMultipleValue } from './core/useSingleOrMultipleValue';

@Directive({
    selector: '[rdxToggleGroupRoot]',
    exportAs: 'rdxToggleGroupRoot',
    standalone: true
})
export class RdxToggleGroupRoot implements OnInit {
    private readonly injector = inject(EnvironmentInjector);

    readonly type = input<'single' | 'multiple'>();
    readonly defaultValue = input<string | string[] | undefined>();
    readonly modelValueInput = input<string | string[] | undefined>();

    private modelValue!: ReturnType<typeof useSingleOrMultipleValue>['modelValue'];
    private changeModelValue!: ReturnType<typeof useSingleOrMultipleValue>['changeModelValue'];
    private isSingle!: ReturnType<typeof useSingleOrMultipleValue>['isSingle'];

    ngOnInit() {
        const { modelValue, changeModelValue, isSingle } = useSingleOrMultipleValue(
            {
                type: this.type(),
                defaultValue: this.defaultValue(),
                modelValue: this.modelValueInput()
            },
            this.injector
        );

        this.modelValue = modelValue;
        this.changeModelValue = changeModelValue;
        this.isSingle = isSingle;

        this.changeModelValue('New Value');
    }
}
