import { RdxMenuArrow } from './src/menu-arrow';
import { RdxMenuBackdrop } from './src/menu-backdrop';
import { RdxMenuCheckboxItem } from './src/menu-checkbox-item';
import { RdxMenuCheckboxItemIndicator } from './src/menu-checkbox-item-indicator';
import { RdxMenuGroup } from './src/menu-group';
import { RdxMenuGroupLabel } from './src/menu-group-label';
import { RdxMenuItem } from './src/menu-item';
import { RdxMenuLinkItem } from './src/menu-link-item';
import { RdxMenuPopup } from './src/menu-popup';
import { RdxMenuPortal, RdxMenuPortalMisuseGuard } from './src/menu-portal';
import { RdxMenuPositioner } from './src/menu-positioner';
import { RdxMenuRadioGroup } from './src/menu-radio-group';
import { RdxMenuRadioItem } from './src/menu-radio-item';
import { RdxMenuRadioItemIndicator } from './src/menu-radio-item-indicator';
import { RdxMenuRoot } from './src/menu-root';
import { RdxMenuSeparator } from './src/menu-separator';
import { RdxMenuSubTrigger } from './src/menu-sub-trigger';
import { RdxMenuTrigger } from './src/menu-trigger';
import { RdxMenuViewport } from './src/menu-viewport';
import { NgModule } from '@angular/core';

export * from './src/menu-arrow';
export * from './src/menu-backdrop';
export * from './src/menu-checkbox-item';
export * from './src/menu-checkbox-item-indicator';
export * from './src/menu-group';
export * from './src/menu-group-context';
export * from './src/menu-group-label';
export * from './src/menu-item';
export * from './src/menu-link-item';
export * from './src/menu-popup';
export * from './src/menu-portal';
export * from './src/menu-positioner';
export * from './src/menu-radio-group';
export * from './src/menu-radio-item';
export * from './src/menu-radio-item-indicator';
export * from './src/menu-root';
export * from './src/menu-separator';
export * from './src/menu-sub-trigger';
export * from './src/menu-trigger';
export * from './src/menu-utils';
export * from './src/menu-viewport';

const menuImports = [
    RdxMenuRoot,
    RdxMenuTrigger,
    RdxMenuSubTrigger,
    RdxMenuPortal,
    RdxMenuPortalMisuseGuard,
    RdxMenuPositioner,
    RdxMenuPopup,
    RdxMenuViewport,
    RdxMenuBackdrop,
    RdxMenuArrow,
    RdxMenuItem,
    RdxMenuLinkItem,
    RdxMenuGroup,
    RdxMenuGroupLabel,
    RdxMenuSeparator,
    RdxMenuCheckboxItem,
    RdxMenuCheckboxItemIndicator,
    RdxMenuRadioGroup,
    RdxMenuRadioItem,
    RdxMenuRadioItemIndicator
];

@NgModule({
    imports: [...menuImports],
    exports: [...menuImports]
})
export class RdxMenuModule {}
