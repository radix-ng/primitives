import { inject, InjectionToken, Provider } from '@angular/core';

// Define a common interface that includes the shared properties
export interface NavigationMenuBase {
    value: () => string;
    isRootMenu: boolean;
    orientation: 'horizontal' | 'vertical';
    dir: 'ltr' | 'rtl';
    rootNavigationMenu: () => HTMLElement | null;
}

// Define interfaces for the specific implementations
export interface NavigationMenuRoot extends NavigationMenuBase {
    previousValue: () => string;
    indicatorTrack: () => HTMLElement | null;
    viewport: () => HTMLElement | null;
    viewportContent: () => Map<string, any>;
    onTriggerEnter: (itemValue: string) => void;
    onTriggerLeave: () => void;
    onContentEnter: () => void;
    onContentLeave: () => void;
    onItemSelect: (itemValue: string) => void;
    onItemDismiss: () => void;
    onViewportContentChange: (contentValue: string, contentData: any) => void;
    onViewportContentRemove: (contentValue: string) => void;
}

export interface NavigationMenuSub extends NavigationMenuBase {
    onTriggerEnter: (itemValue: string) => void;
    onItemSelect: (itemValue: string) => void;
    onItemDismiss: () => void;
}

// The token now accepts either type
export const RDX_NAVIGATION_MENU_TOKEN = new InjectionToken<NavigationMenuRoot | NavigationMenuSub>(
    'RdxNavigationMenuToken'
);

// Helper function to check if an object is a NavigationMenuRoot
export function isNavigationMenuRoot(obj: any): obj is NavigationMenuRoot {
    return 'indicatorTrack' in obj && 'previousValue' in obj;
}

export function injectNavigationMenu(): NavigationMenuRoot | NavigationMenuSub {
    return inject(RDX_NAVIGATION_MENU_TOKEN);
}

export function provideNavigationMenu(provider: any): Provider {
    return {
        provide: RDX_NAVIGATION_MENU_TOKEN,
        useExisting: provider
    };
}
