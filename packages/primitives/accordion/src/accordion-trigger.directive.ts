import { computed, DestroyRef, Directive, effect, ElementRef, inject, input } from '@angular/core';
import { provideRdxButtonConfig, RdxButtonDirective } from '@radix-ng/primitives/button';
import { injectCollapsibleRootContext } from '@radix-ng/primitives/collapsible';
import { injectId } from '@radix-ng/primitives/core';
import { injectAccordionItemContext } from './accordion-item.directive';
import { injectAccordionRootContext } from './accordion-root.directive';

@Directive({
    selector: '[rdxAccordionTrigger]',
    hostDirectives: [{ directive: RdxButtonDirective, inputs: ['disabled', 'type', 'tabIndex', 'role'] }],
    host: {
        '[attr.id]': 'resolvedId()',
        '[attr.aria-expanded]': 'itemContext.open()',
        '[attr.aria-controls]': 'itemContext.open() ? collapsibleContext.panelId() : undefined',
        '[attr.data-disabled]': 'effectiveDisabled() ? "" : undefined',
        '[attr.data-panel-open]': 'itemContext.open() ? "" : undefined',
        '[attr.data-orientation]': 'rootContext.orientation()',
        '[attr.data-hidden]': 'itemContext.hidden() ? "" : undefined',
        '[attr.data-index]': 'itemContext.index()'
    },
    providers: [
        provideRdxButtonConfig(() => {
            return {
                disabled: injectAccordionItemContext().dataDisabled,
                focusableWhenDisabled: computed(() => false)
            };
        })
    ]
})
export class RdxAccordionTriggerDirective {
    protected readonly rootContext = injectAccordionRootContext();
    protected readonly itemContext = injectAccordionItemContext();
    protected readonly collapsibleContext = injectCollapsibleRootContext();
    private readonly button = inject(RdxButtonDirective, { self: true });
    private readonly generatedId = injectId('rdx-accordion-trigger-');

    /** Authored native ID, registered reactively for the Panel's accessible label. */
    readonly id = input<string | undefined>();
    protected readonly resolvedId = computed(() => this.id() || this.generatedId);
    readonly effectiveDisabled = computed(() => this.itemContext.dataDisabled() || this.button.disabled());

    constructor() {
        const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
        const activate = (event: Event) => this.changeItem(event);
        // Consumer click handlers run before the request. Install our synchronous handler after
        // the current bubble listeners, including template bindings added after construction.
        const prepare = () => {
            element.removeEventListener('click', activate);
            element.addEventListener('click', activate);
        };
        element.addEventListener('click', prepare, true);
        inject(DestroyRef).onDestroy(() => {
            element.removeEventListener('click', prepare, true);
            element.removeEventListener('click', activate);
        });
        effect((onCleanup) => {
            const id = this.resolvedId();
            this.itemContext.triggerId.set(id);
            onCleanup(() => {
                if (this.itemContext.triggerId() === id) this.itemContext.triggerId.set(undefined);
            });
        });
    }

    changeItem(event: Event) {
        if (this.effectiveDisabled()) return;
        this.itemContext.requestOpen(!this.itemContext.open(), 'trigger-press', event);
    }
}
