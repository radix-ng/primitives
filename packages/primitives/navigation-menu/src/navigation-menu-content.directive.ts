import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    Input,
    input,
    OnDestroy,
    OnInit,
    TemplateRef
} from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getMotionAttribute, makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuContent]'
})
export class RdxNavigationMenuContentDirective implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly template = inject(TemplateRef);
    private readonly elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute })
    set rdxNavigationMenuContent(value: BooleanInput) {
        // structural directive requires this input even if unused
    }

    /**
     * Used to keep the content rendered and available in the DOM, even when closed.
     * Useful for animations or SEO.
     * @default false
     */
    readonly forceMount = input<BooleanInput, unknown>(undefined, { transform: booleanAttribute });

    /** @ignore */
    readonly contentId = makeContentId(this.context.baseId, this.item.value());
    /** @ignore */
    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value());

    /** @ignore - Compute motion attribute for animations */
    getMotionAttribute(): string | null {
        if (!isRootNavigationMenu(this.context)) return null;

        const itemValues = Array.from(this.context.viewportContent?.() ?? new Map()).map(([value]) => value);

        return getMotionAttribute(
            this.context.value(),
            this.context.previousValue(),
            this.item.value(),
            itemValues,
            this.context.dir
        );
    }

    /** @ignore */
    ngOnInit() {
        this.item.contentRef.set(this.elementRef.nativeElement);

        // register template with viewport in root menu via context
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentChange) {
            this.context.onViewportContentChange(this.item.value(), {
                ref: this.elementRef,
                templateRef: this.template,
                forceMount: this.forceMount(),
                value: this.item.value(),
                getMotionAttribute: this.getMotionAttribute.bind(this)
            });
        }
    }

    /** @ignore */
    ngOnDestroy() {
        // unregister from viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentRemove) {
            this.context.onViewportContentRemove(this.item.value());
        }
    }
}
