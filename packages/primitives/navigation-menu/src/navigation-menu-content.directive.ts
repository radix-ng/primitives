import { BooleanInput } from '@angular/cdk/coercion';
import {
    booleanAttribute,
    Directive,
    ElementRef,
    inject,
    Input,
    OnDestroy,
    OnInit,
    TemplateRef,
    ViewContainerRef
} from '@angular/core';
import { RdxNavigationMenuItemDirective } from './navigation-menu-item.directive';
import { injectNavigationMenu, isRootNavigationMenu } from './navigation-menu.token';
import { getMotionAttribute, makeContentId, makeTriggerId } from './utils';

@Directive({
    selector: '[rdxNavigationMenuContent]',
    standalone: true
})
export class RdxNavigationMenuContentDirective implements OnInit, OnDestroy {
    private readonly context = injectNavigationMenu();
    private readonly item = inject(RdxNavigationMenuItemDirective);
    private readonly template = inject(TemplateRef);
    private readonly viewContainer = inject(ViewContainerRef);
    private readonly elementRef = inject(ElementRef);

    @Input({ transform: booleanAttribute })
    set rdxNavigationMenuContent(value: BooleanInput) {
        // Structural directive requires this input even if unused
    }

    @Input({ transform: booleanAttribute }) forceMount: BooleanInput;

    readonly contentId = makeContentId(this.context.baseId, this.item.value);
    readonly triggerId = makeTriggerId(this.context.baseId, this.item.value);

    // Compute motion attribute for animations
    getMotionAttribute(): string | null {
        if (!isRootNavigationMenu(this.context)) return null;

        const itemValues = Array.from(this.context.viewportContent?.() || new Map()).map(([value]) => value);

        return getMotionAttribute(
            this.context.value(),
            this.context.previousValue(),
            this.item.value,
            itemValues,
            this.context.dir
        );
    }

    ngOnInit() {
        // Don't create the view directly when using structural directive
        // Instead, register the template with the viewport

        // Register with the item
        this.item.contentRef.set(this.elementRef.nativeElement);

        // Register with viewport in root menu
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentChange) {
            this.context.onViewportContentChange(this.item.value, {
                ref: this.elementRef,
                templateRef: this.template,
                forceMount: this.forceMount,
                value: this.item.value,
                getMotionAttribute: this.getMotionAttribute.bind(this) // Add this for motion attribute support
            });
        }
    }

    ngOnDestroy() {
        // Unregister from viewport
        if (isRootNavigationMenu(this.context) && this.context.onViewportContentRemove) {
            this.context.onViewportContentRemove(this.item.value);
        }
    }
}
