import { booleanAttribute, Directive, effect, inject, input, TemplateRef, untracked } from '@angular/core';
import { RdxNavigationMenuItem } from './navigation-menu-item';
import { injectNavigationMenuRootContext } from './navigation-menu-root-context';

/**
 * The content shown when its item is open. Used as a structural directive; its template is rendered
 * into the shared {@link RdxNavigationMenuViewport}.
 *
 * ```html
 * <ng-container *rdxNavigationMenuContent>…</ng-container>
 * ```
 */
@Directive({
    selector: '[rdxNavigationMenuContent]'
})
export class RdxNavigationMenuContent {
    private readonly rootContext = injectNavigationMenuRootContext();
    private readonly item = inject(RdxNavigationMenuItem);
    private readonly templateRef = inject<TemplateRef<unknown>>(TemplateRef);

    /**
     * Required by the structural directive syntax; the value is unused.
     */
    readonly rdxNavigationMenuContent = input(false, { transform: booleanAttribute });

    /**
     * Keep the content mounted in the viewport even when its item is closed.
     */
    readonly forceMount = input(false, { transform: booleanAttribute });

    constructor() {
        effect((onCleanup) => {
            const value = this.item.value();

            // Register untracked so reading/writing the root's `contents` map inside registerContent
            // doesn't make this effect re-run when other items register.
            const unregister = untracked(() =>
                this.rootContext.registerContent({
                    value,
                    contentId: this.rootContext.contentId(value),
                    triggerId: this.rootContext.triggerId(value),
                    templateRef: this.templateRef,
                    forceMount: this.forceMount
                })
            );

            onCleanup(unregister);
        });
    }
}
