import { Directive, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { RdxNavigationMenuDirective } from './navigation-menu.directive';
import { provideNavigationMenuContext } from './navigation-menu.token';
import { generateId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuSub]',
    standalone: true,
    providers: [provideNavigationMenuContext(RdxNavigationMenuSubDirective)],
    host: {
        '[attr.data-orientation]': 'orientation'
    }
})
export class RdxNavigationMenuSubDirective {
    @Input() orientation: 'horizontal' | 'vertical' = 'horizontal';
    @Input() set defaultValue(val: string) {
        if (val) this.value.set(val);
    }

    @Output() valueChange = new EventEmitter<string>();

    readonly value = signal<string>('');
    readonly previousValue = signal<string>('');
    readonly baseId = `rdx-nav-menu-sub-${generateId()}`;
    readonly isRootMenu = false;

    private readonly parent = inject(RdxNavigationMenuDirective, { optional: true });

    get dir(): 'ltr' | 'rtl' {
        return this.parent?.dir || 'ltr';
    }

    get rootNavigationMenu(): HTMLElement | null {
        return this.parent?.rootNavigationMenu() || null;
    }

    onTriggerEnter(itemValue: string) {
        this.setValue(itemValue);
    }

    onItemSelect(itemValue: string) {
        this.setValue(itemValue);
    }

    onItemDismiss() {
        this.setValue('');
    }

    private setValue(value: string) {
        this.previousValue.set(this.value());
        this.value.set(value);
        this.valueChange.emit(value);
    }
}
