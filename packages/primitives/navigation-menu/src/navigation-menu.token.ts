import { inject, InjectionToken, Provider, Type } from '@angular/core';
import { RdxNavigationMenuSubDirective } from './navigation-menu-sub.directive';
import { RdxNavigationMenuDirective } from './navigation-menu.directive';

export interface NavigationMenuContext {
    isRootMenu: boolean;
    value: () => string;
    previousValue: () => string;
    baseId: string;
    dir: 'ltr' | 'rtl';
    orientation: 'horizontal' | 'vertical';
    loop: boolean;
    rootNavigationMenu: () => HTMLElement | null;

    indicatorTrack?: () => HTMLElement | null;
    onIndicatorTrackChange?: (track: HTMLElement | null) => void;
    userDismissedByClick?: () => boolean;
    resetUserDismissed?: () => void;
    viewport?: () => HTMLElement | null;
    onViewportChange?: (viewport: HTMLElement | null) => void;
    viewportContent?: () => Map<string, any>;
    onViewportContentChange?: (contentValue: string, contentData: any) => void;
    onViewportContentRemove?: (contentValue: string) => void;
    onTriggerEnter?: (itemValue: string) => void;
    onTriggerLeave?: () => void;
    onContentEnter?: () => void;
    onContentLeave?: () => void;
    onItemSelect?: (itemValue: string) => void;
    onItemDismiss?: () => void;
    handleClose?: (force?: boolean) => void;
    setTriggerPointerState?: (isOver: boolean) => void;
    setContentPointerState?: (isOver: boolean) => void;
    isPointerInSystem?: () => boolean;
}

export const RDX_NAVIGATION_MENU_TOKEN = new InjectionToken<NavigationMenuContext>('RdxNavigationMenuToken');

export function injectNavigationMenu(): NavigationMenuContext {
    return inject(RDX_NAVIGATION_MENU_TOKEN);
}

export function isRootNavigationMenu(context: NavigationMenuContext): boolean {
    return context.isRootMenu;
}

export function provideNavigationMenuContext(
    provider: Type<RdxNavigationMenuDirective | RdxNavigationMenuSubDirective>
): Provider {
    return {
        provide: RDX_NAVIGATION_MENU_TOKEN,
        useExisting: provider
    };
}
