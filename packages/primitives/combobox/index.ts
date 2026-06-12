import { NgModule } from '@angular/core';
import { RdxComboboxAnchor } from './src/combobox-anchor';
import { RdxComboboxArrow } from './src/combobox-arrow';
import { RdxComboboxBackdrop } from './src/combobox-backdrop';
import { RdxComboboxChip } from './src/combobox-chip';
import { RdxComboboxChipRemove } from './src/combobox-chip-remove';
import { RdxComboboxChips } from './src/combobox-chips';
import { RdxComboboxClear } from './src/combobox-clear';
import { RdxComboboxEmpty } from './src/combobox-empty';
import { RdxComboboxGroup } from './src/combobox-group';
import { RdxComboboxGroupLabel } from './src/combobox-group-label';
import { RdxComboboxIcon } from './src/combobox-icon';
import { RdxComboboxInput } from './src/combobox-input';
import { RdxComboboxItem } from './src/combobox-item';
import { RdxComboboxItemIndicator } from './src/combobox-item-indicator';
import { RdxComboboxLabel } from './src/combobox-label';
import { RdxComboboxList } from './src/combobox-list';
import { RdxComboboxPopup } from './src/combobox-popup';
import { RdxComboboxPortal, RdxComboboxPortalMisuseGuard } from './src/combobox-portal';
import { RdxComboboxPositioner } from './src/combobox-positioner';
import { RdxComboboxRoot } from './src/combobox-root';
import { RdxComboboxStatus } from './src/combobox-status';
import { RdxComboboxTrigger } from './src/combobox-trigger';
import { RdxComboboxValue } from './src/combobox-value';

export * from './src/combobox-anchor';
export * from './src/combobox-arrow';
export * from './src/combobox-backdrop';
export * from './src/combobox-chip';
export * from './src/combobox-chip-remove';
export * from './src/combobox-chips';
export * from './src/combobox-clear';
export * from './src/combobox-empty';
export * from './src/combobox-group';
export * from './src/combobox-group-label';
export * from './src/combobox-icon';
export * from './src/combobox-input';
export * from './src/combobox-item';
export * from './src/combobox-item-indicator';
export * from './src/combobox-label';
export * from './src/combobox-list';
export * from './src/combobox-popup';
export * from './src/combobox-portal';
export * from './src/combobox-positioner';
export * from './src/combobox-root';
export * from './src/combobox-status';
export * from './src/combobox-trigger';
export * from './src/combobox-value';

export const _importsCombobox = [
    RdxComboboxRoot,
    RdxComboboxAnchor,
    RdxComboboxLabel,
    RdxComboboxInput,
    RdxComboboxValue,
    RdxComboboxTrigger,
    RdxComboboxIcon,
    RdxComboboxClear,
    RdxComboboxPortal,
    RdxComboboxPortalMisuseGuard,
    RdxComboboxBackdrop,
    RdxComboboxPositioner,
    RdxComboboxPopup,
    RdxComboboxArrow,
    RdxComboboxList,
    RdxComboboxItem,
    RdxComboboxItemIndicator,
    RdxComboboxGroup,
    RdxComboboxGroupLabel,
    RdxComboboxEmpty,
    RdxComboboxStatus,
    RdxComboboxChips,
    RdxComboboxChip,
    RdxComboboxChipRemove
];

@NgModule({
    imports: [..._importsCombobox],
    exports: [..._importsCombobox]
})
export class RdxComboboxModule {}
